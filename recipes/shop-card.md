# Recipe: shop card

A framed shop panel with accent color, item rows (text + thumbnail sections), buy buttons, and a docs link.

Rendered preview: [docs/mock/shop-card.html](../docs/mock/shop-card.html) (open in a browser).

Use when: trading cards, item shops, event reward showcases.

## Raw payload

```json
{
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "id": 1,
      "accent_color": 15844367,
      "components": [
        {
          "type": 9,
          "id": 2,
          "accessory": { "type": 2, "style": 1, "label": "Open shop", "custom_id": "shop:open" },
          "components": [
            { "type": 10, "id": 3, "content": "## Ludlow Arms Shop\nGear rotates every Friday 20:00 UTC. Stock shown below is what is left this week." }
          ]
        },
        { "type": 14, "id": 4, "divider": true, "spacing": 1 },
        {
          "type": 9,
          "id": 5,
          "accessory": {
            "type": 11,
            "media": { "url": "https://picsum.photos/seed/sword9/240/240" },
            "description": "Flame-Touched Blade icon"
          },
          "components": [
            { "type": 10, "id": 6, "content": "### Flame-Touched Blade\n- 42 ATK, +8 crit\n- One per customer\n**4,500g**" }
          ]
        },
        {
          "type": 9,
          "id": 7,
          "accessory": {
            "type": 11,
            "media": { "url": "https://picsum.photos/seed/shield4/240/240" },
            "description": "Aegis Bulwark icon"
          },
          "components": [
            { "type": 10, "id": 8, "content": "### Aegis Bulwark\n- 120 DEF, block stun\n- Tank only\n**6,200g**" }
          ]
        },
        { "type": 14, "id": 9, "divider": false, "spacing": 2 },
        {
          "type": 1,
          "id": 10,
          "components": [
            { "type": 2, "style": 3, "label": "Buy blade", "custom_id": "shop:buy:blade" },
            { "type": 2, "style": 3, "label": "Buy shield", "custom_id": "shop:buy:shield" },
            { "type": 2, "style": 2, "label": "Sell all", "custom_id": "shop:sell:all", "disabled": true },
            { "type": 2, "style": 5, "label": "Armory docs", "url": "https://example.com/armory" }
          ]
        }
      ]
    }
  ]
}
```

(Canonical file: `payloads/shop-card.json`.)

## discord.js

```ts
import {
  ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder,
  SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder,
} from "@discordjs/builders";
import { ButtonStyle, MessageFlags } from "discord-api-types/v10";

const container = new ContainerBuilder()
  .setAccentColor(0xf1c40f)
  .addSectionComponents((sec) =>
    sec
      .addTextDisplayComponents((t) => t.setContent("## Ludlow Arms Shop\nGear rotates every Friday 20:00 UTC."))
      .setButtonAccessory(
        new ButtonBuilder().setCustomId("shop:open").setLabel("Open shop").setStyle(ButtonStyle.Primary),
      ),
  )
  .addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
  .addSectionComponents((sec) =>
    sec
      .addTextDisplayComponents((t) => t.setContent("### Flame-Touched Blade\n- 42 ATK, +8 crit\n- One per customer\n**4,500g**"))
      .setThumbnailAccessory(new ThumbnailBuilder().setDescription("Flame-Touched Blade icon").setURL("https://picsum.photos/seed/sword9/240/240")),
  )
  .addSectionComponents((sec) =>
    sec
      .addTextDisplayComponents((t) => t.setContent("### Aegis Bulwark\n- 120 DEF, block stun\n- Tank only\n**6,200g**"))
      .setThumbnailAccessory(new ThumbnailBuilder().setDescription("Aegis Bulwark icon").setURL("https://picsum.photos/seed/shield4/240/240")),
  )
  .addSeparatorComponents((s) => s.setDivider(false).setSpacing(SeparatorSpacingSize.Large))
  .addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("shop:buy:blade").setLabel("Buy blade").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("shop:buy:shield").setLabel("Buy shield").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("shop:sell:all").setLabel("Sell all").setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setLabel("Armory docs").setStyle(ButtonStyle.Link).setURL("https://example.com/armory"),
    ),
  );

await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
```

## seyfert

```ts
import seyfert from "seyfert";

const { Container, TextDisplay, Section, Separator, Spacing, ActionRow, Button, ButtonStyle, MessageFlags } = seyfert;

const container = new Container({ accentColor: 0xf1c40f }).addComponents(
  new Section({
    components: [new TextDisplay({ content: "## Ludlow Arms Shop\nGear rotates every Friday 20:00 UTC." })],
    accessory: new Button({ custom_id: "shop:open", style: ButtonStyle.Primary, label: "Open shop" }),
  }),
  new Separator({ divider: true, spacing: Spacing.Small }),
  new Section({
    components: [new TextDisplay({ content: "### Flame-Touched Blade\n- 42 ATK, +8 crit\n- One per customer\n**4,500g**" })],
    accessory: new Thumbnail({ media: { url: "https://picsum.photos/seed/sword9/240/240" }, description: "Flame-Touched Blade icon" }),
  }),
  new Section({
    components: [new TextDisplay({ content: "### Aegis Bulwark\n- 120 DEF, block stun\n- Tank only\n**6,200g**" })],
    accessory: new Thumbnail({ media: { url: "https://picsum.photos/seed/shield4/240/240" }, description: "Aegis Bulwark icon" }),
  }),
  new Separator({ divider: false, spacing: Spacing.Large }),
  new ActionRow({
    components: [
      new Button({ custom_id: "shop:buy:blade", style: ButtonStyle.Success, label: "Buy blade" }),
      new Button({ custom_id: "shop:buy:shield", style: ButtonStyle.Success, label: "Buy shield" }),
      new Button({ custom_id: "shop:sell:all", style: ButtonStyle.Secondary, label: "Sell all", disabled: true }),
      new Button({ url: "https://example.com/armory", style: ButtonStyle.Link, label: "Armory docs" }),
    ],
  }),
);
```

Remember the accentColor serialization bug (gotchas #22) - patch `accent_color` into the JSON before sending raw.

## discord.py

```python
import discord
from discord import ui

class ShopCard(ui.LayoutView):
    def __init__(self) -> None:
        super().__init__(timeout=None)
        container = ui.Container(accent_color=discord.Color.gold())
        container.add_item(ui.Section(
            ui.TextDisplay("## Ludlow Arms Shop\nGear rotates every Friday 20:00 UTC."),
            accessory=ui.Button(style=discord.ButtonStyle.primary, label="Open shop", custom_id="shop:open"),
        ))
        container.add_item(ui.Separator(visible=True, spacing=discord.SeparatorSpacing.small))
        container.add_item(ui.Section(
            ui.TextDisplay("### Flame-Touched Blade\n- 42 ATK, +8 crit\n- One per customer\n**4,500g**"),
            accessory=ui.Thumbnail("https://picsum.photos/seed/sword9/240/240", description="Flame-Touched Blade icon"),
        ))
        container.add_item(ui.Section(
            ui.TextDisplay("### Aegis Bulwark\n- 120 DEF, block stun\n- Tank only\n**6,200g**"),
            accessory=ui.Thumbnail("https://picsum.photos/seed/shield4/240/240", description="Aegis Bulwark icon"),
        ))
        container.add_item(ui.Separator(visible=False, spacing=discord.SeparatorSpacing.large))
        container.add_item(ui.ActionRow(
            ui.Button(style=discord.ButtonStyle.success, label="Buy blade", custom_id="shop:buy:blade"),
            ui.Button(style=discord.ButtonStyle.success, label="Buy shield", custom_id="shop:buy:shield"),
            ui.Button(style=discord.ButtonStyle.secondary, label="Sell all", custom_id="shop:sell:all", disabled=True),
            ui.Button(style=discord.ButtonStyle.link, label="Armory docs", url="https://example.com/armory"),
        ))
        self.add_item(container)

await channel.send(view=ShopCard())
```

## Notes

- Two sections sharing thumbnails give a catalog row without tables; a third item pushes the container to 8 children, still under 10.
- The "Sell all" disabled button shows inventory gating; enable it when the player has items.
- Component count: 1 container + 1 section + 1 separator + 2 sections + 1 separator + 1 row + 4 buttons = 11.
