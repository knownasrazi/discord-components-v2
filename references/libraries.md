# Libraries

Same Components V2 payload in every major library. Versions verified by running each API locally (2026-10).

## Raw JSON

The source of truth. Copy from `payloads/` and edit.

```js
await rest.post(`/channels/${channelId}/messages`, {
  body: { flags: 32768, components: payloadJson },
});
```

Webhook variant: `POST /webhooks/:id/:token?with_components=true`.

## discord.js (@discordjs/builders 1.14.1 + discord-api-types 0.38.57)

```ts
import {
  ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder,
  SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder,
} from "@discordjs/builders";
import { ButtonStyle, MessageFlags } from "discord-api-types/v10";

const container = new ContainerBuilder()
  .setAccentColor(0xf1c40f)
  .addTextDisplayComponents((t) => t.setContent("## Ludlow Arms Shop\nGear rotates every Friday."))
  .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small).setDivider(true))
  .addSectionComponents((sec) =>
    sec
      .addTextDisplayComponents((t) => t.setContent("### Flame-Touched Blade\n**4,500g**"))
      .setThumbnailAccessory(new ThumbnailBuilder().setDescription("Blade").setURL("https://example.com/sword.png")),
  )
  .addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("shop:buy:blade").setLabel("Buy blade").setStyle(ButtonStyle.Success),
    ),
  );

channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
```

Notes: enums from `discord-api-types/v10`; `setContent()` not `.content()`; `addXComponents((b) => ...)` callback style; `setThumbnailAccessory` for sections, `setButtonAccessory` also exists.

## seyfert 5.2.1

```ts
import seyfert from "seyfert";

const { Container, TextDisplay, Section, Separator, Spacing, ActionRow, Button, ButtonStyle, MessageFlags } = seyfert;

const container = new Container({ accentColor: 0xf1c40f }).addComponents(
  new TextDisplay({ content: "## Ludlow Arms Shop\nGear rotates every Friday." }),
  new Separator({ divider: true, spacing: Spacing.Small }),
  new Section({
    components: [new TextDisplay({ content: "### Flame-Touched Blade\n**4,500g**" })],
    accessory: new Button({ custom_id: "shop:buy:blade", style: ButtonStyle.Success, label: "Buy blade" }),
  }),
  new ActionRow({ components: [new Button({ url: "https://example.com/armory", style: ButtonStyle.Link, label: "Armory docs" })] }),
);
```

Notes: classes not factory functions; `Spacing` enum; accent-color serialization bug (see gotchas #22); prefer default-import because the package is CJS.

## discord.py 2.7.1

```python
import discord
from discord import ui

class ShopCard(ui.LayoutView):
    def __init__(self) -> None:
        super().__init__(timeout=None)
        container = ui.Container(accent_color=discord.Color.gold())
        container.add_item(ui.TextDisplay("## Ludlow Arms Shop\nGear rotates every Friday."))
        container.add_item(ui.Separator(visible=True, spacing=discord.SeparatorSpacing.small))
        container.add_item(ui.Section(
            ui.TextDisplay("### Flame-Touched Blade\n**4,500g**"),
            accessory=ui.Thumbnail("https://picsum.photos/seed/sword9/240/240"),
        ))
        container.add_item(ui.ActionRow(
            ui.Button(style=discord.ButtonStyle.success, label="Buy blade", custom_id="shop:buy:blade"),
        ))
        self.add_item(container)

await channel.send(view=ShopCard())
```

Notes: `visible=` not `divider=`; `discord.SeparatorSpacing` enum; text displays positional in `ui.Section`, accessory keyword-only; `to_components()` emits correct snake_case.

## Other libraries

- **JDA / Discord4J / discordgo**: check for v2 component support before promising it to the user; if absent, send raw JSON through their REST escape hatches.
- **Modal labels** (Label 18, File Upload 19, Radio/Checkbox 21-23): library coverage is still uneven; fall back to raw JSON when a lib lacks a class.
