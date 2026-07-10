# Linkbeam identity migration design

**Date:** 2026-07-10
**Status:** Approved direction, pending written-spec review
**Repository:** `/home/derpcat/projects/beamlink`
**Deployment fork:** `/home/derpcat/projects/music-shortlink`

## Objective

Rename the open-source product from **Beamlink** to **Linkbeam** without disconnecting existing self-hosted installations, the Dolmen Gate production fork, old documentation links, or deployment resources that already contain the `beamlink` prefix.

The canonical public name becomes `Linkbeam`; the canonical technical slug becomes `linkbeam`.

## Scope boundaries

This migration changes the product identity, repository identity, documentation, new-install defaults, generated onboarding commands, package metadata, outbound User-Agent strings, source namespaces, and deployment-fork sync contract.

It does not rename existing production D1 databases, KV namespaces, R2 buckets, Queues, deployed Worker names, database tables, metric kinds, or stored records. Those identifiers carry live state and remain valid regardless of the public product name.

## Canonical identifiers

| Surface | Canonical value |
|---|---|
| Product name | `Linkbeam` |
| Wordmark | `linkbeam` |
| GitHub repository | `DerpcatMusic/linkbeam` |
| Package name | `linkbeam` |
| New-install Worker name | `linkbeam` |
| New-install D1 name | `linkbeam` |
| New-install R2 bucket | `linkbeam-artwork` |
| New-install conversion Queue | `linkbeam-conversions` |
| New-install dead-letter Queue | `linkbeam-conversions-dlq` |
| New CSS namespace | `--linkbeam-*` and `.linkbeam-*` |
| Product docs base | the GitHub Pages path attached to `DerpcatMusic/linkbeam` |

The Dolmen Gate deployment keeps its current fork repository, custom domain, binding IDs, Worker/resource names, and `WORKER_NAME` value.

## Source migration

Create a small brand/config module for the runtime product name, repository URL, docs URL, default Worker prefix, and outbound User-Agent. Layouts, pages, onboarding helpers, and provider requests consume those values instead of repeating literals.

Migrate canonical CSS variables and product-owned classes to the `linkbeam` namespace. Retain `--beamlink-*` variable aliases and the embedded/preview body-class aliases until the next breaking release, and never remove them earlier than 90 days after the Linkbeam cutover. New source must use only the Linkbeam namespace.

Keep internal database schema and historical migration files unchanged. Do not rewrite old design specs merely to erase historical references; mark them as historical where ambiguity would otherwise arise.

## Documentation and repository cutover

Update README, AGENTS instructions, PRODUCT/DESIGN context, static documentation, AI prompts, generated command examples, favicon labels, page titles, Open Graph metadata, and clone commands in the same change as the source rename.

Add a project-cleanliness test that rejects stale user-facing `Beamlink` strings. The test has a narrow allowlist for compatibility aliases, historical specs, migration notes, and the deployment-fork fallback variable.

Rename the GitHub repository only after the code and fork compatibility changes are merged. After the rename:

1. Verify Git fetch/push through both the new repository URL and GitHub's old-repository redirect.
2. Verify the new GitHub Pages path and every published docs link.
3. If GitHub Pages does not preserve the old path, publish a minimal old-path redirect rather than leaving existing AI prompts and external links dead.
4. Update local remotes only after remote verification succeeds.

## Deployment-fork compatibility

The deployment fork gains `scripts/sync-from-linkbeam.sh` as the canonical sync command. The existing `scripts/sync-from-beamlink.sh` remains as a thin wrapper until the next breaking release, and never for less than 90 days after cutover.

The new sync script resolves its source in this order:

1. `LINKBEAM_DIR`
2. legacy `BEAMLINK_DIR`
3. sibling directory `../linkbeam`
4. legacy sibling directory `../beamlink`

The fork's upstream remote becomes `linkbeam`, while a pre-existing `beamlink` remote remains accepted by documentation and diagnostics during the transition. Sync continues preserving fork-only `wrangler.jsonc`, `astro.config.mjs`, deployment documentation, and custom-domain configuration.

## Failure handling

- A missing new source checkout produces an error that lists every attempted path and both supported environment variables.
- Old CSS aliases resolve to the same values as the new tokens and are covered by tests.
- No deploy step creates replacement production resources as part of the rename.
- The repository cutover is halted if tests, build, fork sync dry-run, GitHub Pages verification, or production-fork build fails.

## Verification

- Search reports no unallowlisted user-facing `Beamlink` strings.
- Unit tests cover brand constants, onboarding commands, CSS aliases, and sync path fallback.
- Parent test/build pass.
- Fork sync, test, and build pass without modifying fork-only configuration.
- Old and new GitHub repository URLs are checked after remote rename.
- Old and new docs entry points are checked after Pages cutover.
- Dolmen Gate production continues using its existing resources and domain.

## Rollback

Before the GitHub repository rename, rollback is a normal code revert. After the remote cutover, the source can still be reverted without touching production resources; repository and Pages redirects must remain in place until the identity decision is explicitly reversed.
