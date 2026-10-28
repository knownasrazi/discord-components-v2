# discord-components-v2

A skill for building Discord messages with Components V2: accent-colored containers, text-and-thumbnail sections, media galleries, separators, file components, and label-based modals.

**Live docs site with rendered previews of every recipe:** https://knownasrazi.github.io/discord-components-v2/

Every recipe ships a validated JSON payload plus implementations in discord.js (@discordjs/builders), seyfert, and discord.py.

## What is inside

| Path | What it is |
|------|------------|
| `SKILL.md` | the skill entry: when to use V2, quickstart, component map, workflow |
| `payloads/` | 10 copy-paste JSON payloads, all typechecked against `discord-api-types` v10 types |
| `recipes/` | one guide per pattern with full code in all three libraries |
| `references/` | API reference, gotchas list, modals guide, library notes |
| `scripts/validate-payloads.mjs` | re-validates the payloads (typecheck against official types) |
| `docs/index.html` | the Pages site (served from `/docs`, previews each recipe live) |
| `docs/mock/` | Discord-styled HTML previews of each recipe (open in a browser) |

## Recipes

1. [Shop card](recipes/shop-card.md) - product card with gallery, perks, buy buttons
2. [Leaderboard](recipes/leaderboard.md) - ranked list with 2-column sections
3. [Pricing panel](recipes/pricing-panel.md) - three plan cards with feature lists and CTA buttons
4. [Welcome card](recipes/welcome-card.md) - rules + onboarding links + thumbnail section
5. [Ticket panel + modal](recipes/ticket-panel.md) - support desk with a label-based modal
6. [Now playing](recipes/now-playing.md) - music player card with control buttons
7. [Media showcase](recipes/media-showcase.md) - image grid with captions
8. [Announcement](recipes/announcement.md) - server news with a link + confirm row
9. [Spoiler drop](recipes/spoiler-drop.md) - gated patch notes with spoiler layers and an attached file

## Payload validation

```sh
node scripts/validate-payloads.mjs
```

Requires `npm install discord-api-types typescript` first (it generates a scratch TypeScript project and runs `tsc` against the official API types). Output: `OK - 9 message payloads + 1 modals typecheck clean`.

## Spoilers

Spoiler containers, gallery items, files, and `||markdown||` spans all work together; see the [spoiler drop recipe](recipes/spoiler-drop.md) for the three-layer pattern.

## Known library gaps covered

- seyfert serializes `accentColor` instead of `accent_color` (and its `Label` `text` kwarg) - gotchas #22/#23
- `@discordjs/builders` does not re-export enums and `setEmoji` needs an object - gotchas #16/#19
- discord.py separator takes `visible=`, not `divider` - gotchas #27

Full list: [references/gotchas.md](references/gotchas.md) (38 items).

## Compatibility

Verified against: discord-api-types 0.38.x, @discordjs/builders 1.14.x, seyfert 5.2.x, discord.py 2.7.x.
