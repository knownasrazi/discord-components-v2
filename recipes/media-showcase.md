# Recipe: media showcase

A three-image gallery (with one spoiler) plus a caption section and an apply button.

Rendered preview: [docs/mock/media-showcase.html](../docs/mock/media-showcase.html) (open in a browser).

Use when: build showcases, art contests, before/after posts, photo dumps.

## Raw payload

Canonical file: `payloads/media-showcase.json`.

```json
{
  "flags": 32768,
  "components": [
    {
      "type": 12,
      "id": 1,
      "items": [
        {
          "media": { "url": "https://picsum.photos/seed/showcase1/800/500" },
          "description": "Cathedral plaza build, night cycle"
        },
        {
          "media": { "url": "https://picsum.photos/seed/showcase2/800/500" },
          "description": "Cathedral interior, chandelier view"
        },
        {
          "media": { "url": "https://picsum.photos/seed/showcase3/800/500" },
          "spoiler": true,
          "description": "Unreleased catacomb wing (spoiler)"
        }
      ]
    },
    { "type": 14, "id": 2, "divider": false, "spacing": 1 },
    {
      "type": 9,
      "id": 3,
      "accessory": {
        "type": 2,
        "style": 2,
        "label": "Apply for builder",
        "custom_id": "show:apply"
      },
      "components": [
        { "type": 10, "id": 4, "content": "## Build of the week: Hollow Cathedral\nBy **Marrowgate** and friends. Third image is a spoiler from the unreleased catacomb wing." }
      ]
    }
  ]
}
```

## discord.js

```ts
import {
  ContainerBuilder, TextDisplayBuilder, SectionBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MediaGalleryBuilder, MediaGalleryItemBuilder, ActionRowBuilder, ButtonBuilder,
} from "@discordjs/builders";
import { ButtonStyle, MessageFlags } from "discord-api-types/v10";

const gallery = new MediaGalleryBuilder().addItems(
  new MediaGalleryItemBuilder().setURL("https://picsum.photos/seed/showcase1/800/500").setDescription("Cathedral plaza build, night cycle"),
  new MediaGalleryItemBuilder().setURL("https://picsum.photos/seed/showcase2/800/500").setDescription("Cathedral interior, chandelier view"),
  new MediaGalleryItemBuilder().setURL("https://picsum.photos/seed/showcase3/800/500").setSpoiler(true).setDescription("Unreleased catacomb wing"),
);

const caption = new SectionBuilder()
  .addTextDisplayComponents((t) =>
    t.setContent("## Build of the week: Hollow Cathedral\nBy **Marrowgate** and friends. Third image is a spoiler from the unreleased catacomb wing."))
  .setButtonAccessory(
    new ButtonBuilder().setCustomId("show:apply").setLabel("Apply for builder").setStyle(ButtonStyle.Secondary),
  );

const components = [
  gallery,
  new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
  caption,
];

await channel.send({ flags: MessageFlags.IsComponentsV2, components });
```

## seyfert

```ts
import seyfert from "seyfert";
const { MediaGallery, MediaGalleryItem, Section, TextDisplay, Separator, Spacing, Button, ButtonStyle } = seyfert;

const components = [
  new MediaGallery({
    items: [
      new MediaGalleryItem({ media: { url: "https://picsum.photos/seed/showcase1/800/500" }, description: "Cathedral plaza build, night cycle" }),
      new MediaGalleryItem({ media: { url: "https://picsum.photos/seed/showcase2/800/500" }, description: "Cathedral interior, chandelier view" }),
      new MediaGalleryItem({ media: { url: "https://picsum.photos/seed/showcase3/800/500" }, spoiler: true, description: "Unreleased catacomb wing" }),
    ],
  }),
  new Separator({ divider: false, spacing: Spacing.Small }),
  new Section({
    components: [new TextDisplay({ content: "## Build of the week: Hollow Cathedral\nBy **Marrowgate** and friends." })],
    accessory: new Button({ custom_id: "show:apply", style: ButtonStyle.Secondary, label: "Apply for builder" }),
  }),
];
```

## discord.py

```python
import discord
from discord import ui

class Showcase(ui.LayoutView):
    def __init__(self) -> None:
        super().__init__(timeout=None)
        self.add_item(ui.MediaGallery(
            discord.MediaGalleryItem("https://picsum.photos/seed/showcase1/800/500", description="Cathedral plaza build, night cycle"),
            discord.MediaGalleryItem("https://picsum.photos/seed/showcase2/800/500", description="Cathedral interior, chandelier view"),
            discord.MediaGalleryItem("https://picsum.photos/seed/showcase3/800/500", description="Unreleased catacomb wing", spoiler=True),
        ))
        self.add_item(ui.Separator(visible=False, spacing=discord.SeparatorSpacing.small))
        self.add_item(ui.Section(
            ui.TextDisplay("## Build of the week: Hollow Cathedral\nBy **Marrowgate** and friends. Third image is a spoiler."),
            accessory=ui.Button(style=discord.ButtonStyle.secondary, label="Apply for builder", custom_id="show:apply"),
        ))

await channel.send(view=Showcase())
```

## Notes

- `spoiler: true` blurs just that gallery item until clicked - good for unreleased content without hiding the whole post.
- Gallery grids auto-arrange (1 item = full width, 2 = side by side, 3+ = grid); order matters.
- Add `attachments` multipart parts and use `attachment://name.png` instead of URLs when the media must be user-uploadable.
