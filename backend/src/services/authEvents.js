import { query } from './db.js';

// Prune records older than 90 days once per hour so the table stays bounded.
// NEXAHUB: .unref() added, matching the pruneTimer in services/rateLimiter.js. Without it
// this interval keeps any process that merely IMPORTS this module alive forever, which is
// invisible in a server that never exits but hangs every script and test that touches it.
const pruneTimer = setInterval(() => {
  query("DELETE FROM auth_events WHERE created_at < NOW() - INTERVAL '90 days'")
    .catch(err => console.error('[auth] Failed to prune auth events:', err.message));
}, 60 * 60 * 1000);
pruneTimer.unref?.();

// NEXAHUB: a host that owns pruning itself stops this one.
// This timer calls query() with no tenant context, and under NexaHub every query resolves
// its schema from an AsyncLocalStorage store that a bare interval does not have. So it
// threw once an hour, logged, and pruned nothing -- auth_events grew without bound in
// every tenant schema. NexaHub prunes per tenant instead (mailflow/authEventPrune.ts) and
// calls this to stop the unscoped one. Exported rather than env-gated so it does not
// depend on import order.
export function stopAuthEventPruning() {
  clearInterval(pruneTimer);
}

// Fire-and-forget audit log write. Never throws — a logging failure must
// not block or crash authentication flows.
export function logAuthEvent(eventType, { username = null, userId = null, ip, success }) {
  query(
    `INSERT INTO auth_events (event_type, username, user_id, ip, success)
     VALUES ($1, $2, $3, $4, $5)`,
    [eventType, username || null, userId || null, ip || null, success]
  ).catch(err => console.error('[auth] Failed to log event:', err.message));
}
