import { decrypt, encrypt } from './encryption.js';
import { query } from './db.js';
import { getConnectionPolicy } from './connectionPolicy.js';
import { validateHost } from './hostValidation.js';
import { createRequestSignal, parseJson, readLimited, readSseData, sanitizeText } from './aiHttp.js';
import { completeCodexText, streamCodexResponses } from './openaiCodexResponses.js';
import { getCodexAccess, getCodexStatus } from './openaiCodexAuth.js';

export const AI_PROVIDER_API_KEY = 'api-key';
export const AI_PROVIDER_CHATGPT = 'chatgpt';
export const MASKED_API_KEY = '••••••••';
export const DEFAULT_CODEX_MODEL = 'gpt-5.6-luna';

// NEXAHUB: providers whose completions are executed by the host application rather than by
// MailFlow itself. NexaHub already owns a multi-provider AI layer (apps/server/src/ai/*)
// with adapters, model catalogue and quota accounting for these two; duplicating their SDK
// calls here would mean two implementations to keep current. Standalone MailFlow never
// installs a host bridge, so selecting one of these without a host is refused (501) rather
// than half-working.
export const AI_PROVIDER_ANTHROPIC = 'anthropic';
export const AI_PROVIDER_GEMINI = 'gemini';

/** NEXAHUB: provider -> the config section holding its credential and model. */
const HOST_BRIDGED_PROVIDERS = new Map([
  [AI_PROVIDER_ANTHROPIC, 'anthropicConfig'],
  [AI_PROVIDER_GEMINI, 'geminiConfig'],
]);

// NEXAHUB: the host-supplied completion bridge. Injected the same way MailFlow already
// accepts an ImapManager and a tenant pool resolver, so the dependency points host ->
// vendor and this file needs no knowledge of NexaHub.
let hostAiBridge = null;

/** NEXAHUB: called once at boot by the host (NexaHub: mailflow/aiBridge.ts). */
export function setHostAiBridge(bridge) {
  if (bridge !== null && typeof bridge?.complete !== 'function') {
    throw new TypeError('A host AI bridge must expose complete()');
  }
  hostAiBridge = bridge;
}

/** NEXAHUB: exported for the host's own verification scripts. */
export function getHostAiBridge() {
  return hostAiBridge;
}

const PROVIDERS = new Set([
  AI_PROVIDER_API_KEY,
  AI_PROVIDER_CHATGPT,
  // NEXAHUB
  AI_PROVIDER_ANTHROPIC,
  AI_PROVIDER_GEMINI,
]);
const ERROR_BODY_LIMIT_BYTES = 8 * 1024;
const JSON_BODY_LIMIT_BYTES = 2 * 1024 * 1024;
const SSE_EVENT_LIMIT_BYTES = 256 * 1024;
const OUTPUT_LIMIT_CHARS = 2 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 60_000;

export class AiProviderError extends Error {
  // `expose` marks an error whose message is safe to show the caller (already
  // secret-redacted and sanitized) — provider-originated failures set it so the
  // admin sees the real reason instead of a generic message, even on a 5xx.
  constructor(message, { status = 503, expose = false } = {}) {
    super(message);
    this.name = 'AiProviderError';
    this.status = status;
    this.expose = expose;
  }
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBaseUrl(value) {
  return cleanString(value).replace(/\/+$/, '');
}

/** NEXAHUB: `{ apiKey, model }` section for a host-bridged provider. */
function normalizeHostBridgedSection(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    apiKey: source.apiKey || null,
    model: cleanString(source.model),
  };
}

export function normalizeAiConfig(raw = {}) {
  const hasStructuredConfig = raw.apiKeyConfig && typeof raw.apiKeyConfig === 'object';
  const apiSource = hasStructuredConfig ? raw.apiKeyConfig : raw;
  const chatgptSource = raw.chatgptConfig && typeof raw.chatgptConfig === 'object'
    ? raw.chatgptConfig
    : {};
  const provider = PROVIDERS.has(raw.provider) ? raw.provider : AI_PROVIDER_API_KEY;
  return {
    enabled: raw.enabled !== false,
    provider,
    apiKeyConfig: {
      baseUrl: normalizeBaseUrl(apiSource.baseUrl),
      apiKey: apiSource.apiKey || null,
      model: cleanString(apiSource.model),
    },
    chatgptConfig: {
      model: cleanString(chatgptSource.model) || DEFAULT_CODEX_MODEL,
    },
    // NEXAHUB: one section per host-bridged provider, same shape as apiKeyConfig
    // minus baseUrl (the host SDKs own their endpoints).
    anthropicConfig: normalizeHostBridgedSection(raw.anthropicConfig),
    geminiConfig: normalizeHostBridgedSection(raw.geminiConfig),
    features: {
      compose: raw.features?.compose !== false,
      summarize: raw.features?.summarize !== false,
    },
  };
}

function publicConfig(config) {
  if (!config) return null;
  const masked = {
    ...config,
    apiKeyConfig: {
      ...config.apiKeyConfig,
      apiKey: config.apiKeyConfig.apiKey ? MASKED_API_KEY : '',
    },
  };
  // NEXAHUB: host-bridged credentials must never leave the server either.
  for (const section of HOST_BRIDGED_PROVIDERS.values()) {
    masked[section] = {
      ...config[section],
      apiKey: config[section]?.apiKey ? MASKED_API_KEY : '',
    };
  }
  return masked;
}

function redactSecrets(value, secrets = []) {
  let redacted = value;
  for (const secret of secrets) {
    if (typeof secret === 'string' && secret) redacted = redacted.split(secret).join('[redacted]');
  }
  return redacted;
}

function providerError(status, text, secrets = []) {
  const parsed = parseJson(text);
  const raw = typeof parsed?.error === 'string' ? parsed.error : parsed?.error?.message;
  const detail = sanitizeText(redactSecrets(raw || text, secrets));
  return new AiProviderError(`AI provider error (${status})${detail ? `: ${detail}` : ''}`, { status: 502, expose: true });
}

function providerRequestError(error, request, callerSignal) {
  if (request.timedOut()) return new AiProviderError('AI provider request timed out', { status: 504, expose: true });
  if (callerSignal?.aborted) return new AiProviderError('AI provider request was aborted', { status: 499, expose: true });
  if (error instanceof AiProviderError) return error;
  return new AiProviderError(
    `AI provider request failed: ${sanitizeText(error?.message) || 'network error'}`,
    { status: 502, expose: true },
  );
}

// Redirects are not followed. The base URL's host is checked against the private-host policy when
// it is saved (saveConfig); a redirect would send the request, with a 307 its body (the email text
// being summarized or drafted) too, to a host that was never checked, one the policy forbids among
// them. fetch drops the API key on a redirect to another origin.
async function openProviderRequest(fetchFn, url, init, { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const request = createRequestSignal(signal, timeoutMs, 'AI request timed out');
  let response;
  try {
    response = await fetchFn(url, { ...init, redirect: 'manual', signal: request.signal });
  } catch (error) {
    request.cleanup();
    throw providerRequestError(error, request, signal);
  }
  if (response.status >= 300 && response.status < 400) {
    request.cleanup();
    response.body?.cancel().catch(() => {});
    throw new AiProviderError(
      `AI provider redirected the request (${response.status}); set the API base URL to the address it redirects to`,
      { status: 502, expose: true },
    );
  }
  return { ...request, response };
}

async function* parseChatCompletionsSse(response, { signal, secrets } = {}) {
  let outputChars = 0;
  const createError = (reason) => {
    if (reason === 'empty_body') return new AiProviderError('AI provider returned an empty stream', { status: 502 });
    if (reason === 'aborted') return new AiProviderError('AI provider request was aborted', { status: 499 });
    return new AiProviderError('AI provider stream event was too large', { status: 502 });
  };

  for await (const data of readSseData(response, {
    signal,
    maxEventBytes: SSE_EVENT_LIMIT_BYTES,
    createError,
  })) {
    if (data.trim() === '[DONE]') return;
    const event = parseJson(data);
    if (!event) throw new AiProviderError('AI provider returned a malformed stream event', { status: 502 });
    if (event.error) throw providerError(502, JSON.stringify({ error: event.error }), secrets);
    const delta = event.choices?.[0]?.delta?.content;
    if (typeof delta !== 'string' || !delta) continue;
    outputChars += delta.length;
    if (outputChars > OUTPUT_LIMIT_CHARS) throw new AiProviderError('AI provider output was too large', { status: 502 });
    yield delta;
  }
}

export function createAiProvider({
  queryFn = query,
  encryptFn = encrypt,
  decryptFn = decrypt,
  validateHostFn = validateHost,
  getConnectionPolicyFn = getConnectionPolicy,
  fetchFn = (...args) => fetch(...args),
  getCodexAccessFn = getCodexAccess,
  getCodexStatusFn = getCodexStatus,
  streamCodexResponsesFn = streamCodexResponses,
  completeCodexTextFn = completeCodexText,
} = {}) {
  async function loadAiConfig() {
    const result = await queryFn("SELECT value FROM system_settings WHERE key = 'ai_config'");
    if (!result.rows.length) return null;
    const parsed = parseJson(result.rows[0].value);
    return parsed ? normalizeAiConfig(parsed) : null;
  }

  async function getAdminAiConfig() {
    return publicConfig(await loadAiConfig());
  }

  async function saveAiConfig(input = {}) {
    if (!PROVIDERS.has(input.provider)) throw new AiProviderError('Unknown AI provider', { status: 400 });
    if (input.enabled !== false && input.provider === AI_PROVIDER_CHATGPT
        && !cleanString(input.chatgptConfig?.model)) {
      throw new AiProviderError('ChatGPT model name is required', { status: 400 });
    }
    const existing = await loadAiConfig();
    const incomingApi = input.apiKeyConfig || {};
    const incomingKey = incomingApi.apiKey;
    // NEXAHUB: a blank or masked key means "keep the stored one" — shared by every
    // credential section so the admin form never has to round-trip a secret.
    const keepOrEncrypt = (submitted, stored) => (
      typeof submitted === 'string' && submitted && submitted !== MASKED_API_KEY
        ? encryptFn(submitted)
        : (stored || null)
    );
    const storedKey = keepOrEncrypt(incomingKey, existing?.apiKeyConfig.apiKey);
    // NEXAHUB
    const hostBridgedSections = {};
    for (const section of HOST_BRIDGED_PROVIDERS.values()) {
      const incoming = input[section] || {};
      hostBridgedSections[section] = {
        ...incoming,
        apiKey: keepOrEncrypt(incoming.apiKey, existing?.[section]?.apiKey),
      };
    }
    const config = normalizeAiConfig({
      ...input,
      apiKeyConfig: { ...incomingApi, apiKey: storedKey },
      ...hostBridgedSections,
    });

    // NEXAHUB: a host-bridged provider needs a credential and a model, and it needs a
    // host that can actually run it. Refusing at save time keeps standalone MailFlow
    // from storing a selection it can never serve.
    const hostBridgedSection = HOST_BRIDGED_PROVIDERS.get(config.provider);
    if (config.enabled && hostBridgedSection) {
      if (!hostAiBridge) {
        throw new AiProviderError(
          `${config.provider} is only available when MailFlow runs inside a host that provides an AI bridge`,
          { status: 501 },
        );
      }
      if (!config[hostBridgedSection].apiKey) {
        throw new AiProviderError('API key is required', { status: 400 });
      }
      if (!config[hostBridgedSection].model) {
        throw new AiProviderError('Model name is required', { status: 400 });
      }
    }

    if (config.enabled && config.provider === AI_PROVIDER_API_KEY
        && (!config.apiKeyConfig.baseUrl || !config.apiKeyConfig.model)) {
      throw new AiProviderError('API base URL and model name are required', { status: 400 });
    }
    if (config.provider === AI_PROVIDER_API_KEY && config.apiKeyConfig.baseUrl) {
      let hostname;
      try {
        hostname = new URL(config.apiKeyConfig.baseUrl).hostname;
      } catch {
        throw new AiProviderError('Invalid API base URL', { status: 400 });
      }
      const policy = await getConnectionPolicyFn();
      const hostError = await validateHostFn(hostname, { allowPrivate: policy.allowPrivateHosts });
      if (hostError) throw new AiProviderError(`API base URL: ${hostError}`, { status: 400 });
    }

    await queryFn(
      `INSERT INTO system_settings (key, value, updated_at) VALUES ('ai_config', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [JSON.stringify(config)],
    );
    return publicConfig(config);
  }

  async function deleteAiConfig() {
    await queryFn("DELETE FROM system_settings WHERE key = 'ai_config'");
  }

  async function requireSelectedConfig() {
    const config = await loadAiConfig();
    if (!config) throw new AiProviderError('AI provider not configured');
    if (!config.enabled) throw new AiProviderError('AI features are disabled');
    if (config.provider === AI_PROVIDER_API_KEY
        && (!config.apiKeyConfig.baseUrl || !config.apiKeyConfig.model)) {
      throw new AiProviderError('AI provider not fully configured');
    }
    // NEXAHUB
    const hostBridgedSection = HOST_BRIDGED_PROVIDERS.get(config.provider);
    if (hostBridgedSection
        && (!config[hostBridgedSection].apiKey || !config[hostBridgedSection].model)) {
      throw new AiProviderError('AI provider not fully configured');
    }
    return config;
  }

  function apiKeyCredential(config) {
    return config.apiKeyConfig.apiKey ? decryptFn(config.apiKeyConfig.apiKey) : null;
  }

  /**
   * NEXAHUB: build the host bridge call for a host-bridged provider. Throws 501 when
   * MailFlow runs standalone so the failure names the missing host rather than
   * surfacing as a generic provider error.
   */
  function hostBridgeRequest(config, messages, { signal, maxTokens, onDelta } = {}) {
    const section = HOST_BRIDGED_PROVIDERS.get(config.provider);
    if (!hostAiBridge) {
      throw new AiProviderError(
        `${config.provider} requires a host AI bridge, which this deployment does not provide`,
        { status: 501 },
      );
    }
    return {
      bridge: hostAiBridge,
      request: {
        provider: config.provider,
        model: config[section].model,
        apiKey: decryptFn(config[section].apiKey),
        messages,
        ...(Number.isFinite(maxTokens) ? { maxTokens } : {}),
        signal,
        ...(onDelta ? { onDelta } : {}),
      },
    };
  }

  async function completeHostBridged(config, messages, options = {}) {
    const { bridge, request } = hostBridgeRequest(config, messages, options);
    let content;
    try {
      content = await bridge.complete(request);
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      throw new AiProviderError(
        `AI provider request failed: ${redactSecrets(sanitizeText(error?.message) || 'host bridge error', [request.apiKey])}`,
        { status: Number.isInteger(error?.status) ? error.status : 502 },
      );
    }
    if (typeof content !== 'string') {
      throw new AiProviderError('AI provider returned an invalid completion', { status: 502 });
    }
    return content;
  }

  /**
   * NEXAHUB: the host bridge pushes deltas through `onDelta`; MailFlow's chat route
   * consumes an async iterator. Buffer the pushes so a slow SSE client cannot drop
   * tokens, and fall back to the full completion when the host never streams.
   */
  async function* streamHostBridged(config, messages, options = {}) {
    const pending = [];
    let wake = null;
    let settled = null;
    const push = (delta) => {
      if (typeof delta !== 'string' || !delta) return;
      pending.push(delta);
      wake?.();
    };

    const completion = completeHostBridged(config, messages, { ...options, onDelta: push })
      .then((text) => { settled = { text }; }, (error) => { settled = { error }; })
      .finally(() => { wake?.(); });

    let emittedChars = 0;
    for (;;) {
      while (pending.length) {
        const delta = pending.shift();
        emittedChars += delta.length;
        if (emittedChars > OUTPUT_LIMIT_CHARS) {
          throw new AiProviderError('AI provider output was too large', { status: 502 });
        }
        yield delta;
      }
      if (settled) break;
      await new Promise((resolve) => { wake = resolve; });
      wake = null;
    }
    await completion;

    if (settled.error) throw settled.error;
    // A host that completed without ever calling onDelta still owes us the answer.
    if (emittedChars === 0 && settled.text) yield settled.text;
  }

  function apiKeyHeaders(apiKey) {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    return headers;
  }

  async function completeApiKey(config, messages, { signal, maxTokens, allowEmpty = false } = {}) {
    const apiKey = apiKeyCredential(config);
    const body = {
      model: config.apiKeyConfig.model,
      messages,
      ...(Number.isFinite(maxTokens) ? { max_tokens: maxTokens } : {}),
      stream: false,
    };
    const request = await openProviderRequest(fetchFn, `${config.apiKeyConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: apiKeyHeaders(apiKey),
      body: JSON.stringify(body),
    }, { signal });
    try {
      const { response } = request;
      const text = await readLimited(response, response.ok ? JSON_BODY_LIMIT_BYTES : ERROR_BODY_LIMIT_BYTES);
      if (!response.ok) throw providerError(response.status, text, [apiKey]);
      const parsed = parseJson(text);
      const choice = parsed?.choices?.[0];
      const content = choice?.message?.content;
      if (typeof content === 'string') return content;
      // A reasoning model — or any turn truncated by max_tokens — can return a
      // null `content`: the output went entirely to reasoning, or the budget was
      // spent before any text was emitted. That is a well-formed response, not a
      // transport failure. Callers that only need to confirm the endpoint works
      // (the connection test) accept it as empty; real completions surface the
      // finish reason instead of a generic error.
      if (choice && content == null) {
        if (allowEmpty) return '';
        const reason = typeof choice.finish_reason === 'string' ? choice.finish_reason : 'unknown';
        throw new AiProviderError(
          `AI provider returned an empty completion (finish_reason: ${reason})`,
          { status: 502, expose: true },
        );
      }
      throw new AiProviderError('AI provider returned an invalid completion', { status: 502, expose: true });
    } catch (error) {
      throw providerRequestError(error, request, signal);
    } finally {
      request.cleanup();
    }
  }

  async function* streamApiKey(config, messages, { signal } = {}) {
    const apiKey = apiKeyCredential(config);
    const request = await openProviderRequest(fetchFn, `${config.apiKeyConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: apiKeyHeaders(apiKey),
      body: JSON.stringify({ model: config.apiKeyConfig.model, messages, stream: true }),
    }, { signal, timeoutMs: 120_000 });
    try {
      const { response } = request;
      if (!response.ok) {
        const text = await readLimited(response, ERROR_BODY_LIMIT_BYTES);
        throw providerError(response.status, text, [apiKey]);
      }
      yield* parseChatCompletionsSse(response, { signal: request.signal, secrets: [apiKey] });
    } catch (error) {
      throw providerRequestError(error, request, signal);
    } finally {
      request.cleanup();
    }
  }

  function codexRequest(config, messages, options, credentials) {
    return {
      ...credentials,
      model: config.chatgptConfig.model,
      messages,
      signal: options.signal,
    };
  }

  async function completeText(messages, options = {}) {
    const config = await requireSelectedConfig();
    if (config.provider === AI_PROVIDER_API_KEY) return completeApiKey(config, messages, options);
    // NEXAHUB
    if (HOST_BRIDGED_PROVIDERS.has(config.provider)) return completeHostBridged(config, messages, options);
    let credentials = await getCodexAccessFn();
    try {
      return await completeCodexTextFn(codexRequest(config, messages, options, credentials));
    } catch (error) {
      if (error?.status !== 401) throw error;
      credentials = await getCodexAccessFn({ forceRefresh: true });
      return completeCodexTextFn(codexRequest(config, messages, options, credentials));
    }
  }

  async function* streamChat(messages, options = {}) {
    const config = await requireSelectedConfig();
    if (config.provider === AI_PROVIDER_API_KEY) {
      yield* streamApiKey(config, messages, options);
      return;
    }
    // NEXAHUB
    if (HOST_BRIDGED_PROVIDERS.has(config.provider)) {
      yield* streamHostBridged(config, messages, options);
      return;
    }

    let forceRefresh = false;
    for (;;) {
      const credentials = forceRefresh
        ? await getCodexAccessFn({ forceRefresh: true })
        : await getCodexAccessFn();
      let emitted = false;
      try {
        for await (const delta of streamCodexResponsesFn(codexRequest(config, messages, options, credentials))) {
          emitted = true;
          yield delta;
        }
        return;
      } catch (error) {
        if (forceRefresh || emitted || error?.status !== 401) throw error;
        forceRefresh = true;
      }
    }
  }

  async function getAiStatus() {
    const config = await loadAiConfig();
    if (!config || !config.enabled) {
      return {
        enabled: false,
        provider: config?.provider || AI_PROVIDER_API_KEY,
        features: config?.features || {},
        reconnectRequired: false,
      };
    }
    if (config.provider === AI_PROVIDER_API_KEY) {
      const enabled = Boolean(config.apiKeyConfig.baseUrl && config.apiKeyConfig.model);
      return { enabled, provider: config.provider, features: config.features, reconnectRequired: false };
    }
    // NEXAHUB: host-bridged providers are ready as soon as credential, model and host
    // bridge are all present — there is no separate authorization handshake to poll.
    const hostBridgedSection = HOST_BRIDGED_PROVIDERS.get(config.provider);
    if (hostBridgedSection) {
      const section = config[hostBridgedSection];
      return {
        enabled: Boolean(hostAiBridge && section.apiKey && section.model),
        provider: config.provider,
        features: config.features,
        reconnectRequired: false,
      };
    }
    const connection = await getCodexStatusFn();
    return {
      enabled: connection.connected === true && Boolean(config.chatgptConfig.model),
      provider: config.provider,
      features: config.features,
      reconnectRequired: connection.reconnectRequired === true,
      connection,
    };
  }

  async function testAiProvider() {
    // The connection test only needs to prove the endpoint is reachable, the key
    // is accepted, and the model returns a well-formed completion. `allowEmpty`
    // keeps it from failing on reasoning models that spend the small token budget
    // on reasoning and return empty content (see completeApiKey).
    await completeText(
      [{ role: 'user', content: 'Reply with only the word "ok".' }],
      { maxTokens: 16, allowEmpty: true },
    );
    return { ok: true };
  }

  return {
    loadAiConfig,
    getAdminAiConfig,
    saveAiConfig,
    deleteAiConfig,
    getAiStatus,
    testAiProvider,
    streamChat,
    completeText,
  };
}

const defaultProvider = createAiProvider();

export const loadAiConfig = defaultProvider.loadAiConfig;
export const getAdminAiConfig = defaultProvider.getAdminAiConfig;
export const saveAiConfig = defaultProvider.saveAiConfig;
export const deleteAiConfig = defaultProvider.deleteAiConfig;
export const getAiStatus = defaultProvider.getAiStatus;
export const testAiProvider = defaultProvider.testAiProvider;
export const streamChat = defaultProvider.streamChat;
export const completeText = defaultProvider.completeText;
