---
name: discord-components-v2
description: Build Discord messages with Components V2 (containers, sections, text displays, media galleries, separators, files) and label-based modals. Use when the user wants custom message layouts, v2 components, container-style cards, or migrating from embeds to v2. Covers raw JSON, discord.js, seyfert, and discord.py.
---

# Discord Components V2

Components V2 is Discord's layout system that replaces the one-embed-plus-content model with up to 40 nested components per message: accent-colored containers, text + thumbnail sections, media galleries, separators, and label-based modals.

## Decision: should this message use V2?

Use Components V2 when the layout needs any of:
- multiple framed sections with accent colors (cards)
- a thumbnail beside text (Section)
- a grid of images (Media Gallery)
- inline file display with text (File component)
- more content than one embed allows (embeds are capped at 10)

Stay on classic (flags 0) when you only need one simple embed with fields - a plain embed is still less code.

**Hard rule:** when any top-level component has `type >= 9`, set `"flags": 32768` (IS_COMPONENTS_V2). With the flag set, `content`, `embeds`, `poll`, and `stickers` are all rejected. Everything must live inside components.

## Quickstart (raw JSON)

```json
{
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "accent_color": 15158332,
      "components": [
        {
          "type": 9,
          "accessory": { "type": 11, "media": { "url": "https://example.com/cover.png" } },
          "components": [{ "type": 10, "content": "## Hello\nA section with text and a thumbnail." }]
        },
        { "type": 14, "divider": true, "spacing": 1 },
        {
          "type": 1,
          "components": [
            { "type": 2, "style": 1, "label": "Ping", "custom_id": "ping:button" }
          ]
        }
      ]
    }
  ]
}
```

- `type 17` = Container (accent bar on the left), `type 9` = Section, `type 10` = Text Display, `type 11` = Thumbnail, `type 14` = Separator, `type 1` = Action Row, `type 2` = Button.

## Component map

| Type | Name | Where it is allowed |
|------|------|---------------------|
| 1 | Action Row | message top level, Container; modal top level (selects only) |
| 2 | Button | inside Action Row, or as a Section accessory |
| 3 | String Select | inside Action Row (message or modal) |
| 4 | Text Input | inside Label (modal only) |
| 5-8 | User/Role/Mentionable/Channel Select | inside Action Row (message or modal) |
| 9 | Section | message top level, Container; holds 1-3 Text Displays + 1 accessory (Thumbnail or Button) |
| 10 | Text Display | message top level, Container, Section; modal top level |
| 11 | Thumbnail | Section accessory only |
| 12 | Media Gallery | message top level, Container; 1-10 images |
| 13 | File | message top level, Container; `attachment://` only |
| 14 | Separator | message top level, Container |
| 17 | Container | message top level; holds up to 10 of: Action Row, Text Display, Section, Media Gallery, Separator, File |
| 18 | Label | modal top level; wraps one input component |
| 19 | File Upload | inside Label (modal only) |
| 21/22/23 | Radio Group / Checkbox Group / Checkbox | modal only (newer types) |

Buttons and selects never sit directly in a Container - wrap them in an Action Row (or use a Section accessory for a single button).

## Limits

- 40 components total per message (every nested one counts, including Buttons).
- Container children: 10.
- Section: 1-3 Text Displays, exactly 1 accessory.
- Media Gallery: 1-10 items.
- Modal: 1-5 top-level components.
- One image/file per File component; media comes from URLs or multipart `attachment://<filename>` references.

## Workflow

1. **Design the payload as raw JSON first.** Recipes in `recipes/` ship a tested JSON file in `payloads/` - copy the closest one and edit text/colors/actions.
2. **Validate the shape.** Run `node scripts/validate-payloads.mjs` (typechecks every payload against discord-api-types). Wrong nesting (a Button directly in a Container, a Container inside a Container) fails here instead of in production.
3. **Port to the target library** with `references/libraries.md` - the same recipe exists in discord.js builders, seyfert classes, and discord.py `ui.LayoutView` code.
4. **Check the gotchas** in `references/gotchas.md` before shipping: accent color serialization in seyfert, webhook `?with_components=true`, spoiler containers, flag removal, button row counts.
5. For modals read `references/modals.md` - label-based modals (Label 18, File Upload 19, Radio/Checkbox 21-23) differ from the old action-row modals.

## Recipes

| Recipe | What it shows |
|--------|---------------|
| `shop-card` | item cards in one accent container, buy buttons |
| `leaderboard` | ranked list with avatar thumbnails |
| `pricing-panel` | three plan sections with per-plan buttons |
| `welcome-card` | banner gallery + server intro |
| `ticket-panel` | support panel + modal with text input and select |
| `now-playing` | progress card with playback buttons |
| `media-showcase` | gallery grid with a spoiler image |
| `announcement` | headed notice with acknowledgments |
| `spoiler-drop` | spoiler container with file + text |

Each recipe file embeds the exact JSON from `payloads/` (already typechecked) plus discord.js, seyfert, and discord.py implementations.

## Library notes (verified versions)

- **discord.js 1.14.1 builders** (`@discordjs/builders`): `ContainerBuilder` etc. exist; enums (`ButtonStyle`, `MessageFlags`, `SeparatorSpacingSize`) must be imported from `discord-api-types/v10`, not from builders. `TextDisplayBuilder` uses `setContent()`.
- **seyfert 5.2.1**: v2 components are classes (`new Container()`, `new TextDisplay({content})`); separator enum is `Spacing`. Bug: containers serialize `accentColor` instead of `accent_color`, so the accent bar is silently dropped when you send raw JSON - see gotchas #22.
- **discord.py 2.7.1**: `ui.LayoutView` + `ui.Container`; `ui.Separator(visible=...)` (not `divider`).

Full field-level reference: `references/api-reference.md`.
