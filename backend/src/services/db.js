import pg from 'pg';
import { encrypt, isEncrypted } from './encryption.js';
import { recordDb } from './performanceMetrics.js';

const { Pool } = pg;

// NEXAHUB: tenant scoping -- see docs/mailflow/SYNC.md and docs/mailflow/SCHEMA.md.
// MailFlow is single-tenant upstream: 82 files import `query`/`pool` from here and none
// of them name a tenant. NexaHub installs a resolver at boot that returns the pool for
// whichever tenant owns the current request, so every one of those consumers becomes
// tenant-scoped without being touched. Left unset -- plain upstream MailFlow, and its
// own tests -- everything falls through to the single pool below, unchanged.
let tenantPoolResolver = null;

export function setTenantPoolResolver(resolver) {
  tenantPoolResolver = resolver;
}

function activePool() {
  return tenantPoolResolver ? tenantPoolResolver() : defaultPool;
}

const defaultPool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'mailflow',
  user: process.env.DB_USER || 'mailflow',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  // Apply statement_timeout via PostgreSQL startup options so it is set during
  // the connection handshake, before any queries can run. The alternative —
  // pool.on('connect') + client.query('SET ...') — is racy: pg does not await
  // the async handler before dispatching the client, so the SET command and the
  // first application query can land on the same client concurrently.
  options: '-c statement_timeout=30000',
});

// pg removes failed idle clients itself, then emits on the pool. Without a
// listener, a database restart throws an uncaught error and kills the API.
// NEXAHUB: attach to the default pool directly (the exported `pool` is a proxy
// to whichever tenant is active; tenant pools attach their own handler where
// they are created -- see the host's tenantPool.ts).
defaultPool.on('error', err => {
  console.error('Idle PostgreSQL connection error:', err.message);
});

// A proxy rather than a re-export, so `pool.connect()` in routes/auth.js, routes/oidc.js
// and services/migrations.js reaches the current tenant's pool without those files
// changing. NEXAHUB.
export const pool = new Proxy({}, {
  get(_target, property) {
    const active = activePool();
    const value = active[property];
    return typeof value === 'function' ? value.bind(active) : value;
  },
});

export async function query(text, params) {
  // Time the query for the performance baseline (behavior-neutral). This is the
  // single top-level DB chokepoint; transaction clients (withTransaction) are not
  // timed here. process.hrtime avoids clock-skew and is ~nanosecond overhead.
  // NEXAHUB: tenant-scoped through activePool().
  const start = process.hrtime.bigint();
  try {
    return await activePool().query(text, params);
  } finally {
    recordDb(Number(process.hrtime.bigint() - start) / 1e6);
  }
}

// Run fn(client) inside a serializable transaction. Commits on success, rolls
// back on throw. The client exposes a .query(text, params) method identical to
// the top-level query() helper.
export async function withTransaction(fn) {
  const client = await activePool().connect();  // NEXAHUB: tenant-scoped
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// One-time startup migration: encrypt any plaintext credentials still in the DB.
// Safe to run on every startup — already-encrypted values are skipped by isEncrypted().
export async function encryptExistingCredentials() {
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('ENCRYPTION_KEY not set — stored credentials are NOT encrypted. Set ENCRYPTION_KEY in .env to enable at-rest encryption.');
    return;
  }

  const result = await pool.query(`
    SELECT id, auth_pass, oauth_access_token, oauth_refresh_token
    FROM email_accounts
    WHERE (auth_pass IS NOT NULL AND auth_pass NOT LIKE 'enc:v1:%')
       OR (oauth_access_token IS NOT NULL AND oauth_access_token NOT LIKE 'enc:v1:%')
       OR (oauth_refresh_token IS NOT NULL AND oauth_refresh_token NOT LIKE 'enc:v1:%')
  `);

  let count = 0;
  for (const row of result.rows) {
    const updates = {};
    if (row.auth_pass && !isEncrypted(row.auth_pass))
      updates.auth_pass = encrypt(row.auth_pass);
    if (row.oauth_access_token && !isEncrypted(row.oauth_access_token))
      updates.oauth_access_token = encrypt(row.oauth_access_token);
    if (row.oauth_refresh_token && !isEncrypted(row.oauth_refresh_token))
      updates.oauth_refresh_token = encrypt(row.oauth_refresh_token);

    if (Object.keys(updates).length) {
      const keys = Object.keys(updates);
      const sets = keys.map((k, i) => `${k} = $${i + 1}`);
      await pool.query(
        `UPDATE email_accounts SET ${sets.join(', ')} WHERE id = $${keys.length + 1}`,
        [...Object.values(updates), row.id]
      );
      count++;
    }
  }
  if (count > 0) console.log(`Encrypted credentials for ${count} account(s)`);

  // Also encrypt OIDC provider client secrets
  const oidcResult = await pool.query(`
    SELECT id, client_secret FROM oidc_providers
    WHERE client_secret IS NOT NULL AND client_secret NOT LIKE 'enc:v1:%'
  `);

  let oidcCount = 0;
  for (const row of oidcResult.rows) {
    if (row.client_secret && !isEncrypted(row.client_secret)) {
      await pool.query(
        'UPDATE oidc_providers SET client_secret = $1 WHERE id = $2',
        [encrypt(row.client_secret), row.id]
      );
      oidcCount++;
    }
  }
  if (oidcCount > 0) console.log(`Encrypted client secrets for ${oidcCount} OIDC provider(s)`);
}
