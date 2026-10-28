# Gotchas

Things that will bite you. All verified by running the actual libraries against the API types (see `payloads/` and the smoke notes in `references/libraries.md`).

## Flag and payload

1. **Forgetting `"flags": 32768`** - any payload containing a component with `type >= 9` is rejected with `Invalid Form Body` if the flag is missing. The flag must be on the message, not on components.
2. **`content`/`embeds` and the flag** - you cannot mix: with IS_COMPONENTS_V2 set, `content`, `embeds`, `poll`, and `stickers` all throw. If you need an image, use a Media Gallery; if you need text, use a Text Display.
3. **Editing away the flag** - editing a V2 message without the flag errors; keep sending `flags: 32768` on every edit.
4. **Webhooks need `?with_components=true`** on the send URL, otherwise components are silently dropped.
5. **40-component budget** - nesting counts everything. A container with a section + 3 text displays + a row of 5 buttons = 11 components. Design cards within budget.
6. **`id` fields are optional but recommended** - stable integer ids per component make edit-targeting and component routing sane.

## Nesting mistakes

7. **Buttons/selects directly in a Container** - rejected. Wrap in an Action Row (type 1) or use a Section accessory for a single button.
8. **Nested Containers** - not allowed; flatten instead.
9. **Thumbnail outside a Section** - Thumbnail is an accessory type; it cannot stand alone. Use a 1-item Media Gallery if you need a lone image.
10. **Section without an accessory** - `accessory` is required on Section; if you do not want media, use a disabled button or restructure with plain Text Displays.
11. **File component with an https URL** - File (type 13) only accepts `attachment://<filename>`; the file must be part of the same multipart request.
12. **Attachment not referenced** - uploaded files not referenced by any component are silently not displayed; every shown attachment needs its `attachment://` mention.

## Text and media

13. **Markdown still applies** - Text Display content supports headers (`#`, `##`, `###`), subtext (`-# `), timestamps (`<t:unix:F>`), mentions, spoilers, and quotes. This is the same parser as message content, so unescaped `@everyone` mentions still ping unless `allowed_mentions` is set.
14. **Long text** - keep each Text Display under ~4000 chars; the per-message content budget still applies across all displays.
15. **Animated media flag** - `flags: 1` on an unfurled media item marks animated media; it is response-only, do not send it.

## Library-specific (verified)

### discord.js (@discordjs/builders 1.14.1)

16. **Enums are not re-exported** - `ButtonStyle`, `MessageFlags`, `SeparatorSpacingSize` come from `discord-api-types/v10`, not from `@discordjs/builders`. Importing them from builders fails at runtime.
17. **`TextDisplayBuilder` method is `setContent()`** - there is no `.content()`. Same for thumbnails: `.setURL()`, `.setDescription()`.
18. **`discord.js` message flags** - when sending, pass `MessageFlags.IsComponentsV2` in `flags`; the builders package does not auto-set it.
19. **`setEmoji` needs an object** - `ButtonBuilder.setEmoji({ name: "â®" })`; passing a plain string throws a shapeshift ValidationError ("Expected the value to be an object").
20. **`discord-api-types` subpath imports** - root imports (`from 'discord-api-types'`) fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`; always use `discord-api-types/v10`.
21. **`ModalBuilder.toJSON()` emits the data object** - the raw interaction response needs `{ type: 9, data: modal.toJSON() }`; `interaction.showModal()` does the wrapping for you.

### seyfert 5.2.1

22. **Accent color bug** - `new Container({ accentColor })` serializes as `accentColor`, but the API field is `accent_color`. No key transform exists in the dist, so the accent bar is silently dropped when the payload is sent. Workaround: patch the JSON after `toJSON()` (`p.accent_color = p.accentColor; delete p.accentColor`) or set accent via raw REST.
23. **Label serialization bug** - seyfert's documented constructor kwarg is `text`, but `new Label({ text, component }).toJSON()` serializes the wrapper as `"text"`, and the API field is `"label"` - the modal is rejected or loses its label. Passing the API field name directly works because data is passed through verbatim: `new Label({ label: "Subject", component })` serializes as `"label"`.
24. **Components are classes** - `new TextDisplay({ content })`, `new Section({ components, accessory })`, `new ActionRow({ components })`, `new Button({ custom_id, style, label })`. They are not factory functions.
25. **Separator enum is `Spacing`** (`Spacing.Small = 1`, `Spacing.Large = 2`), not `SeparatorSpacingSize`.
26. **CommonJS interop** - the package is CJS; under ESM, named imports of some members fail (`SeparatorSpacingSize` was not found). Prefer `import seyfert from "seyfert"` and destructure.
27. **Button helpers** - there are no `Button.custom(...)`/`Button.link(...)` statics; construct `new Button({...})` with `style: ButtonStyle.Success` / `ButtonStyle.Link`.

### discord.py 2.7.1

28. **`ui.Separator` takes `visible=`** - not `divider`. `ui.Separator(visible=False, spacing=discord.SeparatorSpacing.small)`.
29. **Enum name** - `discord.SeparatorSpacing` (small/large), not `SeparatorSpacingSize`.
30. **Section signature** - `ui.Section(ui.TextDisplay(...), accessory=ui.Thumbnail(...))`; text displays are positional, the accessory is keyword-only.
31. **Sending** - use `channel.send(view=layout_view)`; `ui.LayoutView.to_components()` already emits correct snake_case (`accent_color` present), unlike seyfert.

## Modals

32. **Legacy action-row modals** still work, but Label-based inputs (Label 18 wrapping Text Input 4, selects, File Upload 19, Radio 21, Checkbox 22/23) require the modal's `components` to contain Labels at top level.
33. **Label text limits** - `label` max 45 chars, `description` max 100 chars; modal `title` max 45.
34. **File Upload requires special permissions** - files arrive as interaction data under `data.resolved.attachments`, not message attachments; filter with `file_types` (`image`, `video`, `audio`, or `.ext` entries, max 10).
35. **Modal top-level Text Display** - static text is allowed inside modal `components` (type 10) but counts toward the 5-slot budget.

## Rendering quirks

36. **Spoiler containers blur everything** - `spoiler: true` on Container blurs all children until clicked; a spoiler Media Gallery item blurs only that image.
37. **Separator `divider: false`** - renders pure spacing (useful between plan cards); `divider: true` draws the line.
38. **Progress bars** - Discord has no progress component; the standard trick is a code block with `â”` and `â—` (see `now-playing.json`).
