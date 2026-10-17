// NEXAHUB: added file -- see docs/mailflow/SYNC.md.
//
// Upstream exports `imapManager` from index.js, so every route that touches it imports
// from there. That makes index.js a dependency of the routes, and index.js does its whole
// boot at module scope: connects Redis, runs migrations, backfills, opens a WebSocket
// server. Importing a single route therefore starts a server -- which NexaHub cannot do,
// because runMigrations() would run once against whatever schema happened to be active,
// while NexaHub migrates each tenant separately.
//
// This module holds the instance instead. The exported `imapManager` is a proxy, so the
// route files change only their import path and every call site stays as upstream wrote
// it. index.js still registers the real instance, and still exports it, so running
// MailFlow standalone is unchanged.
let instance = null;
let resolver = null;

// Accepts either an instance (standalone MailFlow: one manager for the whole process) or a
// resolver function (NexaHub: one manager per tenant, chosen per request). A resolver is
// consulted on every access, because which manager is correct depends on who is asking.
export function setImapManager(managerOrResolver) {
  if (typeof managerOrResolver === 'function') {
    resolver = managerOrResolver;
    instance = null;
  } else {
    instance = managerOrResolver;
    resolver = null;
  }
}

function current() {
  return resolver ? resolver() : instance;
}

export function hasImapManager() {
  return resolver !== null || instance !== null;
}

export const imapManager = new Proxy({}, {
  get(_target, property) {
    const active = current();
    if (!active) {
      throw new Error(
        `MailFlow's imapManager was used before it was registered (property: ${String(property)}). `
        + 'Call setImapManager() during boot.',
      );
    }
    const value = active[property];
    return typeof value === 'function' ? value.bind(active) : value;
  },
});
