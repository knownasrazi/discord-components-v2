# Recipe: spoiler drop

Spoilered container with attached file, spoiler gallery images, and markdown spoilers in text.

Rendered preview: [docs/mock/spoiler-drop.html](../docs/mock/spoiler-drop.html) (open in a browser).

Use when: patch notes, gated content, secret reveals, paid drops.

## Raw payload

Canonical file: `payloads/spoiler-drop.json`. This payload expects a multipart upload: `patch-notes.txt` is attached with the request and referenced as `attachment://patch-notes.txt`.

```json
{
  "flags": 32768,
  "attachments": [
    { "id": 2, "filename": "patch-notes.txt", "description": "Patch notes for build 12.4" }
  ],
  "components": [
    {
      "type": 17,
      "id": 1,
      "accent_color": 3447003,
      "spoiler": true,
      "components": [
        {
          "type": 10,
          "id": 2,
          "content": "## ||Build 12.4 patch notes||\nFull notes attached. Highlights below."
        },
        { "type": 14, "id": 3, "divider": true, "spacing": 1 },
        {
          "type": 10,
          "id": 4,
          "content": "||- Frostbite nerf: 18% -> 12% slow\n- Shatter procs no longer ignore DR\n- New map rotation for ranked||"
        },
        { "type": 13, "id": 5, "file": { "url": "attachment://patch-notes.txt" }, "spoiler": true }
      ]
    }
  ]
}
```

## Sending with the attachment (multipart)

Raw REST multipart:

```http
POST /channels/:id/messages? X-Audit-Log-Reason: drop
Content-Type: multipart/form-data; boundary=delim

--delim
Content-Disposition: form-data; name="payload_json"
Content-Type: application/json

{ ...the payload above... }
--delim
Content-Disposition: form-data; name="files[2]"; filename="patch-notes.txt"
Content-Type: text/plain

<file bytes>
--delim--
```

- The attachments array entry `{"id": 2, ...}` binds the component reference `attachment://patch-notes.txt` to `files[2]`. Use `files[0]` with attachment id `0` for a single-file upload; the id just has to match.

## discord.js

```ts
const attachment = new AttachmentBuilder(Buffer.from(patchNotesText), { name: "patch-notes.txt" });

await channel.send({
  flags: MessageFlags.IsComponentsV2,
  files: [attachment],
  components: [
    new ContainerBuilder()
      .setAccentColor(0x3498db)
      .setSpoiler(true)
      .addTextDisplayComponents((t) => t.setContent("## ||Build 12.4 patch notes||\nFull notes attached. Highlights below."))
      .addSeparatorComponents((s) => s.setDivider(true))
      .addTextDisplayComponents((t) =>
        t.setContent("||- Frostbite nerf: 18% -> 12% slow\n- Shatter procs no longer ignore DR\n- New map rotation for ranked||"))
      .addFileComponents((f) => f.setSpoiler(true).setURL("attachment://patch-notes.txt")),
  ],
});
```

## seyfert

```ts
import seyfert from "seyfert";
const { Container, TextDisplay, Separator, Spacing, File } = seyfert;

const container = new Container({ accentColor: 0x3498db, spoiler: true }).addComponents(
  new TextDisplay({ content: "## ||Build 12.4 patch notes||\nFull notes attached. Highlights below." }),
  new Separator({ divider: true, spacing: Spacing.Small }),
  new TextDisplay({ content: "||- Frostbite nerf: 18% -> 12% slow\n- Shatter procs no longer ignore DR\n- New map rotation for ranked||" }),
  new File({ file: { url: "attachment://patch-notes.txt" }, spoiler: true }),
);
// attach the buffer via seyfert's file resolver (resolveFiles), then send
```

## discord.py

```python
import discord
from discord import ui

file = discord.File(io.BytesIO(patch_notes_text.encode()), filename="patch-notes.txt")

class Drop(ui.LayoutView):
    def __init__(self) -> None:
        super().__init__(timeout=None)
        c = ui.Container(accent_color=discord.Color.blurple(), spoiler=True)
        c.add_item(ui.TextDisplay("## ||Build 12.4 patch notes||\nFull notes attached. Highlights below."))
        c.add_item(ui.Separator(visible=True))
        c.add_item(ui.TextDisplay("||- Frostbite nerf: 18% -> 12% slow\n- Shatter procs no longer ignore DR\n- New map rotation for ranked||"))
        c.add_item(ui.File(discord.UnfurledMediaItem("attachment://patch-notes.txt"), spoiler=True))
        self.add_item(c)

await channel.send(view=Drop(), file=file)
```

## Notes

- Three spoiler layers: `||markdown||` per text span, `spoiler: true` per media item, `spoiler: true` on the whole Container (blurs everything).
- The flag cannot be removed from a spoilered message later; post a NEW message to unspoiler.
- File component requires the multipart upload - hotlinking https is rejected.
