# Recipe: welcome card

Full-width banner image, server intro with an icon thumbnail, and verify/rules buttons.

Rendered preview: [docs/mock/welcome-card.html](../docs/mock/welcome-card.html) (open in a browser).

Use when: onboarding posts, welcome threads, server descriptions.

## Raw payload

Canonical file: `payloads/welcome-card.json`.

```json
{
  "flags": 32768,
  "components": [
    {
      "type": 12,
      "id": 1,
      "items": [
        {
          "media": { "url": "https://picsum.photos/seed/bannercastle/1200/300" },
          "description": "Welcome banner of a castle at dusk"
        }
      ]
    },
    { "type": 14, "id": 2, "divider": false, "spacing": 2 },
    {
      "type": 9,
      "id": 3,
      "accessory": {
        "type": 11,
        "media": { "url": "https://picsum.photos/seed/servericon/160/160" },
        "description": "Server icon"
      },
      "components": [
        {
          "type": 10,
          "id": 4,
          "content": "## Welcome to Frosthelm\nRead the rules in <#111222333444555666>, grab roles in <#111222333444555999>, and say hi in <#111222333444555777>.\n\nReact raids start on the 15th. See the pinned guide for loot rules."
        }
      ]
    },
    {
      "type": 1,
      "id": 5,
      "components": [
        { "type": 2, "style": 3, "label": "Verify", "custom_id": "welcome:verify" },
        { "type": 2, "style": 5, "label": "Rules", "url": "https://example.com/rules" }
      ]
    }
  ]
}
```

## discord.js

```ts
import {
  ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder,
  MediaGalleryBuilder, MediaGalleryItemBuilder, SeparatorBuilder,
  SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder,
} from "@discordjs/builders";
import { ButtonStyle, MessageFlags } from "discord-api-types/v10";

const banner = new MediaGalleryBuilder().addItems(
  new MediaGalleryItemBuilder()
    .setURL("https://picsum.photos/seed/bannercastle/1200/300")
    .setDescription("Welcome banner of a castle at dusk"),
);

const intro = new SectionBuilder()
  .addTextDisplayComponents((t) =>
    t.setContent("## Welcome to Frosthelm\nRead the rules in <#111222333444555666>, grab roles in <#111222333444555999>, and say hi in <#111222333444555777>.\n\nReact raids start on the 15th. See the pinned guide for loot rules."),
  )
  .setThumbnailAccessory(
    new ThumbnailBuilder().setDescription("Server icon").setURL("https://picsum.photos/seed/servericon/160/160"),
  );

const components = [
  banner,
  new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Large),
  intro,
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("welcome:verify").setLabel("Verify").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setLabel("Rules").setStyle(ButtonStyle.Link).setURL("https://example.com/rules"),
  ),
];

await channel.send({ flags: MessageFlags.IsComponentsV2, components });
```

Note: this recipe keeps top-level components outside a Container for a borderless look - the gallery renders edge-to-edge. Wrap everything in one Container if you want a card frame.

## seyfert

```ts
import seyfert from "seyfert";
const { MediaGallery, MediaGalleryItem, TextDisplay, Section, Thumbnail, Separator, Spacing, ActionRow, Button, ButtonStyle } = seyfert;

const components = [
  new MediaGallery({ items: [new MediaGalleryItem({ media: { url: "https://picsum.photos/seed/bannercastle/1200/300" }, description: "Welcome banner of a castle at dusk" })] }),
  new Separator({ divider: false, spacing: Spacing.Large }),
  new Section({
    components: [new TextDisplay({ content: "## Welcome to Frosthelm\nRead the rules in <#111222333444555666>, grab roles in <#111222333444555999>, and say hi in <#111222333444555777>." })],
    accessory: new Thumbnail({ media: { url: "https://picsum.photos/seed/servericon/160/160" }, description: "Server icon" }),
  }),
  new ActionRow({
    components: [
      new Button({ custom_id: "welcome:verify", style: ButtonStyle.Success, label: "Verify" }),
      new Button({ url: "https://example.com/rules", style: ButtonStyle.Link, label: "Rules" }),
    ],
  }),
];
```

## discord.py

```python
import discord
from discord import ui

class Welcome(ui.LayoutView):
    def __init__(self) -> None:
        super().__init__(timeout=None)
        self.add_item(ui.MediaGallery(discord.MediaGalleryItem("https://picsum.photos/seed/bannercastle/1200/300", description="Welcome banner of a castle at dusk")))
        self.add_item(ui.Separator(visible=False, spacing=discord.SeparatorSpacing.large))
        self.add_item(ui.Section(
            ui.TextDisplay("## Welcome to Frosthelm\nRead the rules in <#111222333444555666>, grab roles in <#111222333444555999>, and say hi in <#111222333444555777>."),
            accessory=ui.Thumbnail("https://picsum.photos/seed/servericon/160/160", description="Server icon"),
        ))
        self.add_item(ui.ActionRow(
            ui.Button(style=discord.ButtonStyle.success, label="Verify", custom_id="welcome:verify"),
            ui.Button(style=discord.ButtonStyle.link, label="Rules", url="https://example.com/rules"),
        ))

await channel.send(view=Welcome())
```

## Notes

- A 1-item Media Gallery is the cheapest full-width banner; a File component cannot show external URLs.
- Channel mentions (`<#...>`) make onboarding links scannable without URLs.
- Component count: 1 gallery + 1 sep + 1 section + 1 thumb + 1 row + 2 buttons = 7.
