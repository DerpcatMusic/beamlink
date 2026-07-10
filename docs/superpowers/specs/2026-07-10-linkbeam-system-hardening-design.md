# Linkbeam system hardening design

**Date:** 2026-07-10
**Status:** Approved direction, pending written-spec review
**Systems:** authentication, secrets, imports, subscriber safety, analytics architecture, development workflow, and CI

## Objective

Remove the system-level failure modes found during the repo audit without adding a server, paid backend, or client framework. Keep Cloudflare-native deployment and preserve current production data.

## Secret handling

Meta access tokens are deployment secrets, not application settings. Stop accepting or persisting `meta_access_token` through the settings API and D1.

- Read `META_ACCESS_TOKEN` only from the Worker secret binding.
- Keep non-secret Pixel/Dataset ID, API version, test code, and ad-account ID in D1 settings.
- Replace the token input with configured/not-configured status and the exact `wrangler secret put META_ACCESS_TOKEN` command.
- Add a migration that deletes any existing `meta_access_token` settings row after operators have been warned to copy the token into a Worker secret.
- Never return secret material from an API or render it into HTML.

The migration documentation must make the order explicit: set the Worker secret, verify CAPI, then remove the D1 copy. The destructive cleanup is not run against the Dolmen Gate production database until the secret is confirmed live.

## Password authentication

Replace new unsalted SHA-256 password hashes with versioned PBKDF2-SHA256 records:

`pbkdf2_sha256$<iterations>$<salt>$<digest>`

Use PBKDF2-HMAC-SHA256 with 600,000 iterations, a random 16-byte salt, and a 32-byte digest, matching the current [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

Provide a local command that generates the record without transmitting the password. Verification accepts the PBKDF2 format and the legacy 64-character SHA-256 format until the next breaking release, and never for less than 90 days after cutover. The admin/onboarding UI displays a warning when legacy authentication is detected. Cloudflare Access remains the recommended production configuration.

Tests cover correct, incorrect, malformed, expired-session, and legacy password paths. Existing session cookies remain valid.

## Safe remote imports

All provider, Open Graph, and artwork fetches use a shared bounded-fetch helper:

- Only `http:` and `https:` URLs.
- Reject credentials in URLs, localhost, `.local`, private/reserved IP literals, and known metadata endpoints.
- Follow at most five redirects and revalidate every redirect target.
- HTML timeout: 8 seconds; maximum body: 2 MB.
- Artwork timeout: 12 seconds; maximum body: 10 MB.
- Validate final content type before parsing or storing.
- Return a plain, actionable import error without exposing internal stack data.

Known provider APIs continue using their existing dedicated importers. Generic Open Graph remains available for legitimate music pages after the safety checks.

## Subscriber safety and privacy

Reject known bot traffic before inserting subscriber rows. Add a visually hidden honeypot and a limit of five submissions per link and client in ten minutes. Store only an HMAC-derived client key in `LINK_CACHE` with a ten-minute TTL; use a new `RATE_LIMIT_SECRET` Worker secret and never store raw IP addresses.

The public form includes the release-owner disclosure defined in the product-surfaces spec. Admin gains the ability to delete individual email signups. A scheduled retention cleanup removes signups older than `SUBSCRIBER_RETENTION_DAYS`, defaulting to 365 days, while preserving aggregate metrics.

CSV export remains available and carries the consent timestamp. API responses use generic success wording for duplicate addresses to avoid exposing membership.

## Analytics isolation

Decompose the link overview into focused data loaders and render components:

- Core funnel and traffic series.
- Audience breakdowns.
- Attribution and Meta Ads data.
- CAPI delivery and match quality.
- Link actions and subscriber summary.

Use section-level error boundaries/results so a Meta API timeout or one failed query produces an inline unavailable state instead of a 500 for the entire page. D1 work remains parallel where safe. External Meta requests get explicit timeouts and cached fallback data.

Preserve server-rendered tables and charts. JavaScript continues to enhance tabs/tooltips but is not required to read the primary analytics data. Move the large inline controller into focused modules or shared components with testable functions.

The `/out/:slug/:platform` and `/d/:slug/:platform` routes call one shared redirect handler so tracking behavior cannot drift between aliases.

## Development workflow

Add explicit commands:

- `bun run dev`: reliable foreground local development, including migrations, even when Astro detects a coding-agent environment. A small launcher calls Astro's programmatic development API instead of the agent-detecting CLI path.
- `bun run dev:background`: opt-in background server behavior.
- `bun run smoke`: build, apply migrations to the built Worker's local D1 state, start Wrangler on an available port, probe representative routes, then stop cleanly.

The smoke script checks homepage, onboarding/admin, new-link editor, normal fan page, ASCII preview payload budget, outbound redirect behavior, and the built Worker's `fetch`, `scheduled`, and `queue` exports.

## Continuous integration

Declare `packageManager: bun@1.3.14` and add a GitHub Actions workflow using that pinned version. It runs:

1. Frozen dependency install.
2. Unit tests.
3. Astro check and production build.
4. Fresh local D1 migrations.
5. Built-Worker smoke suite.
6. Brand-cleanliness and payload-budget tests.

CI does not deploy and does not require production secrets. External provider tests use fixtures or mocked fetches.

## Operational observability

- Background `waitUntil` failures include structured operation/link identifiers without tokens or email addresses.
- Analytics section failures log a stable category and show a user-safe message.
- Smoke-test failures print the route, status, response prefix, and relevant local log path.
- Scheduled cleanup and retry handlers report counts, not sensitive payloads.

## Verification

- Existing 152 tests remain green and new tests cover every changed boundary.
- Astro check and production build remain clean.
- A clean local database can migrate from zero to latest.
- A copy of the pre-change schema/data can migrate without losing links, metrics, destinations, or subscribers inside the retention window.
- Settings APIs cannot write or reveal Meta access tokens.
- PBKDF2 and legacy password verification both work during the compatibility cycle.
- Unsafe fetch targets, oversized bodies, excessive redirects, and timeouts fail deterministically.
- One failed analytics section does not prevent the overview from rendering.
- Both redirect aliases produce identical tracking and destination behavior.
- CI and the local smoke command exercise the built Worker rather than only Astro's source-mode server.

## Rollout order

1. Add non-destructive secret/auth compatibility and bounded fetches.
2. Add analytics isolation, subscriber protections, dev workflow, and CI.
3. Verify production has `META_ACCESS_TOKEN` as a Worker secret.
4. Apply the D1 token-cleanup migration.
5. Remove legacy SHA-256 generation from documentation while retaining verification for the compatibility cycle.
