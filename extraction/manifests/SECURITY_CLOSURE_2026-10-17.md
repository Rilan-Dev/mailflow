# Security Closure Slice — 2026-10-17

Source pin: 35067fc2876d50980f1a8a3b8ea72b5467b69f60 / a2a82b50b8a1ac24a273e55dc0f9418aefdfed17

## First-pass trace findings

- **Authentication/session:** auth routes depend on PostgreSQL, bcrypt, TOTP, encryption, SMTP, auth event logging, Redis sessions, host validation, rate limiting and session destruction. Session options define a seven-day idle window and HttpOnly/SameSite=Lax/secure-auto cookie behavior.
- **OAuth/OIDC:** Microsoft/Google OAuth and OIDC share encrypted token persistence, session state and provider policy. OIDC has state, nonce, PKCE and bounded outbound calls; private issuer support is tied to the connection policy.
- **Outbound target validation:** hostValidation handles IPv4/IPv6 reserved/private ranges, IDNA normalization, DNS resolution and pinned lookup. safeFetch uses an Undici connector and requires HTTPS/public destinations by default.
- **Remote image proxy:** imageProxy uses safeFetch, a 10 MiB response cap, timeouts, concurrency limit and content-signature sniffing; SVG and mismatched MIME/body cases have tests.
- **Email sanitization:** emailSanitizer uses sanitize-html and parse5, handles email HTML and compose/signature HTML, rewrites anchors and blocks/proxies remote images.

## Evidence
Machine-readable evidence with current blob SHAs and known tests is in `security-closure-2026-10-17-35067fc.json`.

## Open closure questions
1. Trace all callers and redirects through safeFetch; verify per-hop DNS/IP guard behavior and policy rechecks.
2. Trace auth/OAuth/OIDC persistence, migrations, provider settings, state/nonce/PKCE and all negative cases.
3. Trace image proxy body limiting, response headers, cache isolation, CID flow and all browser rendering sinks.
4. Trace sanitizer callers and prove no alternate unsafe HTML render path.
5. Run the listed tests against a real checkout; this static trace did not run tests.
6. Review per-path provenance and licenses before any reuse.

No capability is closed by this report. Snapshot integrity is PASS; capability closure, legal clearance and host integration remain pending.
