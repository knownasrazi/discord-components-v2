# Components V2 API reference

Verified against discord-api-types 0.38.57 (`payloads/v10/message.d.ts`, `_interactions/responses.d.ts`) and the live developer docs (2026). Every payload in `payloads/` typechecks against these types.

## Enabling V2 on a message

```json
{ "flags": 32768, "components": [ ... ] }
```

- Flag `1 << 15` = 32768 (`IS_COMPONENTS_V2`, `MessageFlags.IsComponentsV2`).
- With the flag set, `content`, `embeds`, `poll`, and `stickers` fields are rejected; media must be referenced by components.
- Every component that should display an attachment must use `attachment://<filename>`; uploaded files that are not referenced by any component are not shown.
- The flag cannot be removed from an already-sent V2 message; edit payloads must keep sending it.
- Message-level ids: each component can carry an optional `id` (developer-defined snowflake-like integer, arbitrary) for easier targeting.

## Nesting rules (the part everyone gets wrong)

```
Message (flags 32768)
├── Action Row (1)          ── Buttons (2) / Selects (3, 5-8)
├── Section (9)             ── 1-3 Text Displays (10) + exactly 1 accessory:
│                               Thumbnail (11) or Button (2)
├── Text Display (10)
├── Media Gallery (12)      ── 1-10 items
├── File (13)               ── exactly 1 attachment:// reference
├── Separator (14)
└── Container (17)          ── same children as message top level, max 10,
    (accent_color, spoiler)    but NO nested Containers, no bare Buttons/Selects
```

- Buttons/Selects never appear as direct children of a Container.
- Thumbnail never appears outside a Section accessory.
- File components must reference `attachment://` - a plain https URL is rejected.

## Field reference

### Container (type 17)
| Field | Type | Notes |
|-------|------|-------|
| `components` | ComponentInContainer[] | max 10 children |
| `accent_color` | int \| null | 0x000000-0xFFFFFF; null = default styling |
| `spoiler` | bool | blurs the whole container until clicked |

### Section (type 9)
| Field | Type | Notes |
|-------|------|-------|
| `components` | TextDisplay[] | 1-3 |
| `accessory` | Thumbnail \| Button | required, exactly one |

### Text Display (type 10)
| Field | Type | Notes |
|-------|------|-------|
| `content` | string | markdown incl. headers `#`/`##`/`###`, subtext `-#`, links, `<t:unix:F>`, user/role/channel mentions, spoilers `||...||`, block quotes |

### Thumbnail (type 11)
| Field | Type | Notes |
|-------|------|-------|
| `media` | UnfurledMediaItem | `{ "url": ... }` (https or attachment://) |
| `description` | string \| null | alt text |
| `spoiler` | bool | blur |

### Media Gallery (type 12)
| Field | Type | Notes |
|-------|------|-------|
| `items` | MediaGalleryItem[] | 1-10 |
| item.media | UnfurledMediaItem | |
| item.description | string \| null | |
| item.spoiler | bool | |

### File (type 13)
| Field | Type | Notes |
|-------|------|-------|
| `file` | UnfurledMediaItem | **only** `attachment://` |
| `spoiler` | bool | |

### Separator (type 14)
| Field | Type | Notes |
|-------|------|-------|
| `divider` | bool | show the line (default true) |
| `spacing` | 1 \| 2 | 1 = small, 2 = large (default small) |

### Action Row (type 1) / Button (type 2)
Unchanged from classic: 5 components per row, button styles 1-5, `custom_id` for interactive, `url` for style 5.

## Unfurled media item
```json
{ "url": "https://example.com/img.png" }        // external
{ "url": "attachment://img.png" }               // uploaded multipart part
```
Response-only fields (ignore on send): `proxy_url`, `width`, `height`, `content_type`, `loading_state`, `placeholder`, `attachment_id`, `flags` (1 = animated).

## Modals (label-based)

Response shape (type 9 = MODAL):

```json
{
  "type": 9,
  "data": {
    "custom_id": "ticket:modal",
    "title": "Open a support ticket",
    "components": [
      { "type": 10, "content": "Tell us what is wrong." },
      {
        "type": 18,
        "label": "Subject",
        "description": "Short summary",
        "component": {
          "type": 4, "custom_id": "ticket:subject", "style": 1,
          "min_length": 3, "max_length": 64, "required": true
        }
      }
    ]
  }
}
```

- `data.components` holds 1-5 top-level components; allowed top-level types in modals: **Action Row (1)**, **Label (18)**, **Text Display (10)**.
- Label (18) wraps exactly one input component:
  - 4 Text Input (`style` 1 short / 2 paragraph, `min_length`, `max_length`, `placeholder`, `required`, default value)
  - 3 String Select (`options` with `label`, `value`, `description`, `default`)
  - 5-8 User/Role/Mentionable/Channel Select
  - 19 File Upload (`min_values`/`max_values`)
  - 21 Radio Group, 22 Checkbox Group, 23 Checkbox (newer, modal-only)
- Text Display in a modal is static helper text above/below labels.
- Labels: `label` max 45 chars, `description` max 100 chars.
- Legacy action-row modal payloads (top-level rows of type 4 inputs) still work, but anything requiring the new input types must use Labels.

## Interaction response payloads for updating V2 messages

`InteractionCallbackData` (types 4/6/7 responses, message edits) accepts the same `flags: 32768` + `components` shape; `component` components update via edit-original (`PATCH /webhooks/@original`) or `PATCH /messages/:id` with the flag still set.

## Sending paths

| Path | Requirement |
|------|-------------|
| `POST /channels/:id/messages` | flags 32768 + components |
| `PATCH /channels/:id/messages/:mid` | keep the flag |
| Webhooks | append `?with_components=true` (also on thread-message sends) |
| `POST /interactions/:id/:token/callback` type 4 | data carries flags + components |
| Interaction response to update message (type 7) | data carries flags + components |

## Component limits

- 40 components total per message, counted at every level (Buttons count individually).
- 10 Container children.
- 3 Text Displays per Section.
- 10 Media Gallery items.
- 5 modal top-level components.
- Text Display `content` shares the message text budget; keep each under ~4000 chars and total content across displays within message limits.
- Select menus: 25 options max (unchanged).
