# Linkbeam product surfaces design

**Date:** 2026-07-10
**Status:** Approved direction, pending written-spec review
**Surfaces:** public fan page, link editor, admin controls, and marketing homepage

## Objective

Make Linkbeam's visible product surfaces as fast, truthful, accessible, and distinctive as its underlying tracking system. Preserve server-rendered fan pages and the release-first design principle.

## Public fan page performance

The ASCII style must no longer serialize a full grid of SVG `<text>` nodes into HTML. Replace the current server fallback with a compact, fixed-size visual asset or small SVG tile whose encoded payload stays below 4 KB. Artwork-aware ASCII remains a progressive enhancement rendered by the existing canvas path.

The no-JavaScript fallback remains usable and visually intentional. It may be less detailed than the canvas result, but it cannot add hundreds of kilobytes to the response.

Performance budgets:

- Normal public fan-page HTML: at most 30 KB uncompressed.
- ASCII public fan-page HTML: at most 40 KB uncompressed.
- Admin editor initial HTML: at most 100 KB uncompressed.
- Individual preview response: at most 40 KB uncompressed.
- No client framework on `/:slug`.

Add tests that measure the serialized response/pattern size so the regression cannot return.

## Appearance editor

Reduce the initial decision set to three curated presets:

| Preset | Background | Buttons | Intent |
|---|---|---|---|
| Clean | Blurred artwork | Monochrome | Fast, restrained default |
| Color | Mesh | Logo color | Artwork-led color without heavy motion |
| Bold | Vinyl | Full color | Deliberate high-energy release treatment |

An **Advanced appearance** disclosure exposes all five background styles, six button treatments, and per-effect controls. Existing saved combinations continue loading correctly; if a saved combination does not match a preset, the editor opens Advanced and labels it `Custom`.

The live preview stays visible on desktop and below the form on narrower screens. Preview failures surface a compact status beside “Updates as you edit” while preserving the last successful preview.

## Truthful pre-release mode

Rename the user-facing mode from **Pre-save** to **Pre-release** until Linkbeam implements real provider authorization that saves a release into a listener's library.

Changes include:

- Admin mode labels and badges: `Pre-release`.
- Public heading: `Coming soon` or `Releases <date>`.
- Platform actions: `Open on Spotify`, `Open on Apple Music`, and equivalent neutral verbs; never claim a save occurred.
- Analytics labels: `Pre-release taps` and `Email signups`, not `Pre-saves`.
- Product and marketing copy: `pre-release pages and email capture`.

Historical database columns and event kinds may remain for compatibility, but presentation helpers provide the truthful vocabulary everywhere visible.

The email form becomes **Join the release list**, with the disclosure: “Your email is shared with this link's owner for release updates.” Submission confirms that the address was collected; it does not promise that Linkbeam itself will send a reminder. The admin subscriber export uses `Email signups` terminology.

## Marketing identity

The Linkbeam marketing page should feel **precise, kinetic, and controlled**. The release artwork and real product output provide the visual interest.

Keep:

- Dark, high-contrast foundation.
- Existing blue accent as the single product accent.
- Live embedded fan page.
- Direct, plain-spoken copy and open-source positioning.

Remove:

- Full-page aurora blobs and ambient glow fields.
- Decorative two-axis grid overlays.
- Wide decorative shadows paired with borders.
- Over-rounded CTA panels.
- Unsupported speed claims such as a fixed `~150ms` number without measured evidence.

Replace those effects with a restrained beam-line motif, actual album artwork, live product output, and a compact admin analytics artifact. Use locally served or system typography so the marketing page does not require Google Fonts. Motion is limited to one short initial treatment and stateful interactions, with reduced-motion parity.

## Accessibility and responsive behavior

- Interactive controls reach 44×44 CSS pixels on public/marketing surfaces and on mobile admin layouts.
- Compact desktop admin controls may remain dense when an equivalent mobile rule enlarges them.
- Marketing comparison content uses semantic table structure or equivalent accessible row/column labels.
- Mobile navigation keeps the primary product and admin destinations discoverable instead of hiding all text links.
- Appearance radio cards preserve native input semantics and visible keyboard focus.
- Status updates use live regions and never rely on color alone.
- All body copy and control labels meet WCAG AA contrast.

## Verification

- Unit tests enforce payload budgets and vocabulary mappings.
- Browser-independent markup tests verify labels, headings, disclosure text, table semantics, and focusable controls.
- Responsive visual checks cover 360, 768, 1024, and 1440 CSS-pixel widths when a browser runner is available.
- Keyboard walkthrough covers marketing navigation, editor presets/Advanced, preview status, public destinations, and email signup.
- Reduced-motion and no-JavaScript fan-page variants remain complete.
- Existing saved style JSON round-trips without data loss.
