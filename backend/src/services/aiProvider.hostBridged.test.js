/**
 * NEXAHUB: dispatch coverage for the host-bridged providers (Anthropic, Google Gemini).
 *
 * aiProvider.test.js is upstream MailFlow's suite and covers the API-key and ChatGPT
 * providers. This file is NexaHub's own and lives beside it rather than inside it so an
 * upstream release never conflicts here.
 *
 * What it pins is the chain behind the admin AI "Test connection" button for these two
 * providers: `/admin/ai/test` -> testAiProvider() -> completeText() -> completeHostBridged()
 * -> the host bridge. Everything is the real aiProvider implementation; only the bridge
 * itself is a stub, which is the seam the host fills with apps/server/src/mailflow/aiBridge.ts
 * (covered on that side by aiBridge.test.ts).
 *
 * `setHostAiBridge` is module-level state, so every test here installs its own bridge and
 * afterEach clears it -- a leaked bridge would silently turn a 501 assertion green.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AI_PROVIDER_ANTHROPIC,
  AI_PROVIDER_API_KEY,
  AI_PROVIDER_GEMINI,
  MASKED_API_KEY,
  createAiProvider,
  getHostAiBridge,
  setHostAiBridge,
} from './aiProvider.js';

function memorySettings(initial) {
  let stored = initial == null ? null : JSON.stringify(initial);
  const queryFn = vi.fn(async (sql, params = []) => {
    if (/SELECT value FROM system_settings/i.test(sql)) {
      return { rows: stored == null ? [] : [{ value: stored }] };
    }
    if (/INSERT INTO system_settings/i.test(sql)) {
      stored = params[0];
      return { rows: [], rowCount: 1 };
    }
    if (/DELETE FROM system_settings/i.test(sql)) {
      stored = null;
      return { rows: [], rowCount: 1 };
    }
    throw new Error(`Unexpected SQL: ${sql}`);
  });
  return { queryFn, read: () => (stored == null ? null : JSON.parse(stored)) };
}

function factory({ initial, ...overrides } = {}) {
  const settings = memorySettings(initial);
  const deps = {
    queryFn: settings.queryFn,
    encryptFn: (value) => `encrypted:${value}`,
    decryptFn: (value) => value?.replace(/^encrypted:/, ''),
    validateHostFn: vi.fn().mockResolvedValue(null),
    getConnectionPolicyFn: vi.fn().mockResolvedValue({ allowPrivateHosts: false }),
    // A bridged provider must never reach MailFlow's own HTTP path. Any call here is a bug,
    // so the stub throws rather than returning something the assertions could absorb.
    fetchFn: vi.fn(() => { throw new Error('fetchFn must not be called for a bridged provider'); }),
    getCodexAccessFn: vi.fn().mockRejectedValue(new Error('Codex must not be used')),
    getCodexStatusFn: vi.fn().mockRejectedValue(new Error('Codex must not be used')),
    streamCodexResponsesFn: vi.fn(),
    completeCodexTextFn: vi.fn(),
    ...overrides,
  };
  return { provider: createAiProvider(deps), settings, deps };
}

/** A stored config with this provider selected and its section populated. */
function bridgedConfig(provider, { apiKey = 'encrypted:secret-key', model = 'model-x', enabled = true } = {}) {
  const section = provider === AI_PROVIDER_ANTHROPIC ? 'anthropicConfig' : 'geminiConfig';
  return {
    enabled,
    provider,
    apiKeyConfig: { baseUrl: '', apiKey: null, model: '' },
    chatgptConfig: { model: 'gpt-5.4' },
    [section]: { apiKey, model },
  };
}

/** Installs a bridge that records every request and returns `text`. */
function stubBridge(text = 'ok') {
  const requests = [];
  const bridge = {
    complete: vi.fn(async (request) => {
      requests.push(request);
      return typeof text === 'function' ? text(request) : text;
    }),
  };
  setHostAiBridge(bridge);
  return { bridge, requests };
}

async function collect(iterable) {
  const chunks = [];
  for await (const chunk of iterable) chunks.push(chunk);
  return chunks;
}

afterEach(() => {
  setHostAiBridge(null);
  vi.unstubAllGlobals();
});

describe('host-bridged provider dispatch', () => {
  it('rejects a bridge that cannot complete, and accepts null to uninstall', () => {
    expect(() => setHostAiBridge({})).toThrow(/must expose complete\(\)/);
    const { bridge } = stubBridge();
    expect(getHostAiBridge()).toBe(bridge);
    setHostAiBridge(null);
    expect(getHostAiBridge()).toBeNull();
  });

  // The acceptance criterion: the admin test button reaches the host bridge for both
  // providers, carrying the decrypted key, the configured model and MailFlow's own
  // 16-token budget (upstream raised it from 5 so reasoning models do not return empty
  // content -- see testAiProvider) -- and never touching fetch or Codex on the way.
  it.each([
    [AI_PROVIDER_ANTHROPIC],
    [AI_PROVIDER_GEMINI],
  ])('routes testAiProvider() through the host bridge for %s', async (provider) => {
    const { requests, bridge } = stubBridge('ok');
    const { provider: ai, deps } = factory({ initial: bridgedConfig(provider) });

    await expect(ai.testAiProvider()).resolves.toEqual({ ok: true });

    expect(bridge.complete).toHaveBeenCalledTimes(1);
    expect(requests[0]).toMatchObject({
      provider,
      model: 'model-x',
      // Decrypted exactly once on the way out; the ciphertext never reaches the host.
      apiKey: 'secret-key',
      maxTokens: 16,
      messages: [{ role: 'user', content: 'Reply with only the word "ok".' }],
    });
    expect(requests[0].onDelta).toBeUndefined();
    expect(deps.fetchFn).not.toHaveBeenCalled();
    expect(deps.getCodexAccessFn).not.toHaveBeenCalled();
  });

  it('passes the selected provider\'s own section, not the other provider\'s', async () => {
    const { requests } = stubBridge();
    const { provider: ai } = factory({ initial: {
      enabled: true,
      provider: AI_PROVIDER_GEMINI,
      apiKeyConfig: { baseUrl: '', apiKey: null, model: '' },
      chatgptConfig: { model: 'gpt-5.4' },
      anthropicConfig: { apiKey: 'encrypted:anthropic-key', model: 'claude-x' },
      geminiConfig: { apiKey: 'encrypted:gemini-key', model: 'gemini-x' },
    } });

    await ai.completeText([{ role: 'user', content: 'hi' }]);

    expect(requests[0]).toMatchObject({ provider: AI_PROVIDER_GEMINI, model: 'gemini-x', apiKey: 'gemini-key' });
    expect(JSON.stringify(requests[0])).not.toContain('anthropic-key');
  });

  it('forwards an explicit maxTokens and omits it when the caller gives none', async () => {
    const { requests } = stubBridge();
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC) });

    await ai.completeText([{ role: 'user', content: 'hi' }], { maxTokens: 64 });
    expect(requests[0].maxTokens).toBe(64);

    await ai.completeText([{ role: 'user', content: 'hi' }]);
    expect(requests[1]).not.toHaveProperty('maxTokens');
  });

  // Standalone MailFlow installs no bridge. 501 names the missing host instead of looking
  // like the provider is down.
  it.each([
    [AI_PROVIDER_ANTHROPIC],
    [AI_PROVIDER_GEMINI],
  ])('fails %s with 501 when no host bridge is installed', async (provider) => {
    const { provider: ai } = factory({ initial: bridgedConfig(provider) });
    await expect(ai.completeText([{ role: 'user', content: 'hi' }]))
      .rejects.toMatchObject({ status: 501, message: expect.stringContaining('requires a host AI bridge') });
    await expect(ai.testAiProvider()).rejects.toMatchObject({ status: 501 });
  });

  it.each([
    ['a missing credential', { apiKey: null, model: 'model-x' }],
    ['a missing model', { apiKey: 'encrypted:secret-key', model: '' }],
  ])('refuses to call the bridge with %s', async (_label, section) => {
    const { bridge } = stubBridge();
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC, section) });
    await expect(ai.completeText([{ role: 'user', content: 'hi' }]))
      .rejects.toThrow(/not fully configured/);
    expect(bridge.complete).not.toHaveBeenCalled();
  });

  it('does not call the bridge while AI is disabled', async () => {
    const { bridge } = stubBridge();
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC, { enabled: false }) });
    await expect(ai.completeText([{ role: 'user', content: 'hi' }])).rejects.toThrow(/disabled/);
    expect(bridge.complete).not.toHaveBeenCalled();
  });

  it('maps a bridge failure to its own status and redacts the key from the message', async () => {
    setHostAiBridge({
      complete: async () => {
        const error = new Error('upstream refused key secret-key');
        error.status = 401;
        throw error;
      },
    });
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC) });
    await expect(ai.completeText([{ role: 'user', content: 'hi' }])).rejects.toMatchObject({ status: 401 });
    await expect(ai.completeText([{ role: 'user', content: 'hi' }])).rejects.not.toThrow(/secret-key/);
  });

  it('reports a non-string completion as a 502 rather than passing it on', async () => {
    stubBridge(() => 42);
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_GEMINI) });
    await expect(ai.completeText([{ role: 'user', content: 'hi' }]))
      .rejects.toMatchObject({ status: 502, message: expect.stringContaining('invalid completion') });
  });

  it('defaults an unclassified bridge error to 502', async () => {
    setHostAiBridge({ complete: async () => { throw new Error('socket hang up'); } });
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC) });
    await expect(ai.completeText([{ role: 'user', content: 'hi' }])).rejects.toMatchObject({ status: 502 });
  });
});

describe('host-bridged status and persistence', () => {
  it.each([
    [AI_PROVIDER_ANTHROPIC],
    [AI_PROVIDER_GEMINI],
  ])('reports %s as enabled once bridge, credential and model are all present', async (provider) => {
    stubBridge();
    const { provider: ai } = factory({ initial: bridgedConfig(provider) });
    await expect(ai.getAiStatus()).resolves.toEqual({
      enabled: true,
      provider,
      features: { compose: true, summarize: true },
      reconnectRequired: false,
    });
  });

  it.each([
    ['the host bridge is absent', { install: false, section: {} }],
    ['the credential is missing', { install: true, section: { apiKey: null } }],
    ['the model is missing', { install: true, section: { model: '' } }],
  ])('reports disabled when %s', async (_label, { install, section }) => {
    if (install) stubBridge();
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC, section) });
    // There is no authorization handshake to poll, so Codex status is never consulted.
    await expect(ai.getAiStatus()).resolves.toMatchObject({ enabled: false, reconnectRequired: false });
  });

  it('masks both bridged credentials in the admin config', async () => {
    const { provider: ai } = factory({ initial: {
      enabled: true,
      provider: AI_PROVIDER_ANTHROPIC,
      anthropicConfig: { apiKey: 'encrypted:anthropic-key', model: 'claude-x' },
      geminiConfig: { apiKey: 'encrypted:gemini-key', model: 'gemini-x' },
    } });
    const publicView = await ai.getAdminAiConfig();
    expect(publicView.anthropicConfig).toEqual({ apiKey: MASKED_API_KEY, model: 'claude-x' });
    expect(publicView.geminiConfig).toEqual({ apiKey: MASKED_API_KEY, model: 'gemini-x' });
    expect(JSON.stringify(publicView)).not.toContain('anthropic-key');
    expect(JSON.stringify(publicView)).not.toContain('gemini-key');
  });

  it('keeps the stored credential when the admin form returns the mask', async () => {
    stubBridge();
    const { provider: ai, settings } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC, { apiKey: 'encrypted:original-key' }) });

    await ai.saveAiConfig({
      enabled: true,
      provider: AI_PROVIDER_ANTHROPIC,
      anthropicConfig: { apiKey: MASKED_API_KEY, model: 'claude-y' },
    });

    expect(settings.read().anthropicConfig).toEqual({ apiKey: 'encrypted:original-key', model: 'claude-y' });
  });

  it('encrypts a replacement credential and never echoes it back', async () => {
    stubBridge();
    const { provider: ai, settings } = factory({ initial: bridgedConfig(AI_PROVIDER_GEMINI, { apiKey: 'encrypted:original-key' }) });

    const saved = await ai.saveAiConfig({
      enabled: true,
      provider: AI_PROVIDER_GEMINI,
      geminiConfig: { apiKey: 'brand-new-key', model: 'gemini-y' },
    });

    expect(settings.read().geminiConfig.apiKey).toBe('encrypted:brand-new-key');
    expect(saved.geminiConfig.apiKey).toBe(MASKED_API_KEY);
  });

  it('refuses to store a bridged selection that this deployment cannot serve', async () => {
    const { provider: ai, settings } = factory({});
    await expect(ai.saveAiConfig({
      enabled: true,
      provider: AI_PROVIDER_ANTHROPIC,
      anthropicConfig: { apiKey: 'k', model: 'claude-x' },
    })).rejects.toMatchObject({ status: 501 });
    expect(settings.read()).toBeNull();
  });

  it.each([
    ['API key is required', { apiKey: '', model: 'claude-x' }],
    ['Model name is required', { apiKey: 'k', model: '' }],
  ])('rejects an incomplete bridged selection with "%s"', async (message, anthropicConfig) => {
    stubBridge();
    const { provider: ai } = factory({});
    await expect(ai.saveAiConfig({ enabled: true, provider: AI_PROVIDER_ANTHROPIC, anthropicConfig }))
      .rejects.toMatchObject({ status: 400, message });
  });

  it('leaves the API-key provider reachable after a bridged provider is configured', async () => {
    stubBridge();
    const { provider: ai, settings } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC) });

    await ai.saveAiConfig({
      enabled: true,
      provider: AI_PROVIDER_API_KEY,
      apiKeyConfig: { baseUrl: 'https://api.example/v1', apiKey: 'openai-key', model: 'gpt-x' },
    });

    const stored = settings.read();
    expect(stored.provider).toBe(AI_PROVIDER_API_KEY);
    // The bridged section is retained rather than dropped, so switching back does not
    // require retyping the key.
    expect(stored.anthropicConfig.apiKey).toBe('encrypted:secret-key');
  });
});

describe('host-bridged streaming', () => {
  it('yields the host\'s deltas in order without waiting for the full completion', async () => {
    setHostAiBridge({
      complete: async (request) => {
        await request.onDelta('Hel');
        await request.onDelta('lo ');
        await request.onDelta('world');
        return 'Hello world';
      },
    });
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC) });

    // The full text is not appended on top of the deltas that already carried it.
    await expect(collect(ai.streamChat([{ role: 'user', content: 'hi' }])))
      .resolves.toEqual(['Hel', 'lo ', 'world']);
  });

  // Safety net, not the normal path: since RILAAA-100 the host's callAnthropic and
  // callGemini do forward onDelta (see apps/server/src/ai/core/providerStreaming.test.ts
  // and verify:provider-streaming-wire), so a bridged provider normally streams. This
  // covers a host that resolves in one shot anyway -- a non-streaming bridge, or a model
  // whose whole answer lands in a single event. Without the fallback the chat route's SSE
  // stream would close empty even though the completion succeeded.
  it.each([
    [AI_PROVIDER_ANTHROPIC],
    [AI_PROVIDER_GEMINI],
  ])('falls back to the whole completion when %s never streams', async (provider) => {
    stubBridge('the entire answer');
    const { provider: ai } = factory({ initial: bridgedConfig(provider) });
    await expect(collect(ai.streamChat([{ role: 'user', content: 'hi' }])))
      .resolves.toEqual(['the entire answer']);
  });

  it('emits nothing when a non-streaming host returns an empty completion', async () => {
    stubBridge('');
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_GEMINI) });
    await expect(collect(ai.streamChat([{ role: 'user', content: 'hi' }]))).resolves.toEqual([]);
  });

  it('ignores empty and non-string deltas rather than emitting them', async () => {
    setHostAiBridge({
      complete: async (request) => {
        await request.onDelta('real');
        await request.onDelta('');
        await request.onDelta(null);
        await request.onDelta(undefined);
        await request.onDelta(7);
        return 'real';
      },
    });
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC) });
    await expect(collect(ai.streamChat([{ role: 'user', content: 'hi' }]))).resolves.toEqual(['real']);
  });

  it('propagates a bridge failure out of the stream', async () => {
    setHostAiBridge({
      complete: async () => { const error = new Error('provider exploded'); error.status = 429; throw error; },
    });
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC) });
    await expect(collect(ai.streamChat([{ role: 'user', content: 'hi' }])))
      .rejects.toMatchObject({ status: 429 });
  });

  it('surfaces a failure that arrives after some deltas were already emitted', async () => {
    setHostAiBridge({
      complete: async (request) => {
        await request.onDelta('partial');
        throw new Error('died mid-answer');
      },
    });
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_GEMINI) });
    const seen = [];
    await expect((async () => {
      for await (const chunk of ai.streamChat([{ role: 'user', content: 'hi' }])) seen.push(chunk);
    })()).rejects.toMatchObject({ status: 502 });
    expect(seen).toEqual(['partial']);
  });

  it('stops a host that streams past the output limit', async () => {
    const overLimit = 'x'.repeat(2 * 1024 * 1024 + 1);
    setHostAiBridge({ complete: async (request) => { await request.onDelta(overLimit); return overLimit; } });
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC) });
    await expect(collect(ai.streamChat([{ role: 'user', content: 'hi' }])))
      .rejects.toMatchObject({ status: 502, message: expect.stringContaining('too large') });
  });

  it('refuses to stream a bridged provider with no host bridge installed', async () => {
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_GEMINI) });
    await expect(collect(ai.streamChat([{ role: 'user', content: 'hi' }])))
      .rejects.toMatchObject({ status: 501 });
  });

  it('hands the abort signal to the host so a hung-up client cancels the await', async () => {
    const { requests } = stubBridge();
    const { provider: ai } = factory({ initial: bridgedConfig(AI_PROVIDER_ANTHROPIC) });
    const controller = new AbortController();
    await collect(ai.streamChat([{ role: 'user', content: 'hi' }], { signal: controller.signal }));
    expect(requests[0].signal).toBe(controller.signal);
  });
});
