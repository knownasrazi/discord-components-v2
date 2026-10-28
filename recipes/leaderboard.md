# Recipe: leaderboard

A ranked list with avatar thumbnails per entry, plus a compact trailing block for the rest of the pack.

Rendered preview: [docs/mock/leaderboard.html](../docs/mock/leaderboard.html) (open in a browser).

Use when: season ladders, top donors, contribution rankings.

## Raw payload

Canonical file: `payloads/leaderboard.json` (below).

```json
{
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "id": 1,
      "accent_color": 10181046,
      "components": [
        {
          "type": 9,
          "id": 2,
          "accessory": { "type": 2, "style": 2, "label": "Refresh", "custom_id": "lb:refresh" },
          "components": [
            { "type": 10, "id": 3, "content": "## Season 12 Leaderboard\nUpdated **every 10 minutes**. Season ends <t:1798761600:R>." }
          ]
        },
        { "type": 14, "id": 4, "divider": true, "spacing": 1 },
        {
          "type": 9,
          "id": 5,
          "accessory": {
            "type": 11,
            "media": { "url": "https://picsum.photos/seed/av1/96/96" },
            "description": "Avatar of Frostbyte"
          },
          "components": [
            { "type": 10, "id": 6, "content": "**1.** Frostbyte — `12,340 pts`\n-# 34 wins, 2 losses" }
          ]
        },
        {
          "type": 9,
          "id": 7,
          "accessory": {
            "type": 11,
            "media": { "url": "https://picsum.photos/seed/av2/96/96" },
            "description": "Avatar of Marrowgate"
          },
          "components": [
            { "type": 10, "id": 8, "content": "**2.** Marrowgate — `11,918 pts`\n-# 31 wins, 5 losses" }
          ]
        },
        {
          "type": 9,
          "id": 9,
          "accessory": {
            "type": 11,
            "media": { "url": "https://picsum.photos/seed/av3/96/96" },
            "description": "Avatar of QuietAnvil"
          },
          "components": [
            { "type": 10, "id": 10, "content": "**3.** QuietAnvil — `10,002 pts`\n-# 28 wins, 7 losses" }
          ]
        },
        { "type": 10, "id": 11, "content": "**4.** Durandal — `9,410 pts`\n**5.** Glasspetal — `8,393 pts`\n-# Your rank: **#41** (2,140 pts)" }
      ]
    }
  ]
}
```

## discord.js

```ts
import {
  ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder,
  SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder,
} from "@discordjs/builders";
import { ButtonStyle, MessageFlags } from "discord-api-types/v10";

function entry(rank: number, name: string, pts: string, sub: string, avatarUrl: string) {
  return new SectionBuilder()
    .addTextDisplayComponents((t) => t.setContent(`**${rank}.** ${name} — \`${pts}\`\n-# ${sub}`))
    .setThumbnailAccessory(new ThumbnailBuilder().setDescription(`Avatar of ${name}`).setURL(avatarUrl));
}

const container = new ContainerBuilder()
  .setAccentColor(0x9b59b6)
  .addSectionComponents((sec) =>
    sec
      .addTextDisplayComponents((t) => t.setContent("## Season 12 Leaderboard\nUpdated **every 10 minutes**. Season ends <t:1798761600:R>."))
      .setButtonAccessory(new ButtonBuilder().setCustomId("lb:refresh").setLabel("Refresh").setStyle(ButtonStyle.Secondary)),
  )
  .addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
  .addSectionComponents(entry(1, "Frostbyte", "12,340", "34 wins, 2 losses", "https://picsum.photos/seed/av1/96/96"))
  .addSectionComponents(entry(2, "Marrowgate", "11,918", "31 wins, 5 losses", "https://picsum.photos/seed/av2/96/96"))
  .addSectionComponents(entry(3, "QuietAnvil", "10,002", "28 wins, 7 losses", "https://picsum.photos/seed/av3/96/96"))
  .addTextDisplayComponents((t) =>
    t.setContent("**4.** Durandal — `9,410 pts`\n**5.** Glasspetal — `8,393 pts`\n-# Your rank: **#41** (2,140 pts)"),
  );

await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
```

## seyfert

```ts
import seyfert from "seyfert";

const { Container, TextDisplay, Section, Separator, Spacing, Button, ButtonStyle } = seyfert;

function entry(rank, name, pts, sub, avatarUrl) {
  return new Section({
    components: [new TextDisplay({ content: `**${rank}.** ${name} — \`${pts}\`\n-# ${sub}` })],
    accessory: new Thumbnail({ media: { url: avatarUrl }, description: `Avatar of ${name}` }),
  });
}

const container = new Container({ accentColor: 0x9b59b6 }).addComponents(
  new Section({
    components: [new TextDisplay({ content: "## Season 12 Leaderboard\nUpdated **every 10 minutes**. Season ends <t:1798761600:R>." })],
    accessory: new Button({ custom_id: "lb:refresh", style: ButtonStyle.Secondary, label: "Refresh" }),
  }),
  new Separator({ divider: true, spacing: Spacing.Small }),
  entry(1, "Frostbyte", "12,340", "34 wins, 2 losses", "https://picsum.photos/seed/av1/96/96"),
  entry(2, "Marrowgate", "11,918", "31 wins, 5 losses", "https://picsum.photos/seed/av2/96/96"),
  entry(3, "QuietAnvil", "10,002", "28 wins, 7 losses", "https://picsum.photos/seed/av3/96/96"),
  new TextDisplay({ content: "**4.** Durandal — `9,410 pts`\n**5.** Glasspetal — `8,393 pts`\n-# Your rank: **#41** (2,140 pts)" }),
);
```

## discord.py

```python
import discord
from discord import ui

def entry(rank: int, name: str, pts: str, sub: str, avatar_url: str) -> ui.Section:
    return ui.Section(
        ui.TextDisplay(f"**{rank}.** {name} — `{pts}`\n-# {sub}"),
        accessory=ui.Thumbnail(avatar_url, description=f"Avatar of {name}"),
    )

class Leaderboard(ui.LayoutView):
    def __init__(self) -> None:
        super().__init__(timeout=None)
        container = ui.Container(accent_color=discord.Color.purple())
        container.add_item(ui.Section(
            ui.TextDisplay("## Season 12 Leaderboard\nUpdated **every 10 minutes**. Season ends <t:1798761600:R>."),
            accessory=ui.Button(style=discord.ButtonStyle.secondary, label="Refresh", custom_id="lb:refresh"),
        ))
        container.add_item(ui.Separator(visible=True, spacing=discord.SeparatorSpacing.small))
        container.add_item(entry(1, "Frostbyte", "12,340", "34 wins, 2 losses", "https://picsum.photos/seed/av1/96/96"))
        container.add_item(entry(2, "Marrowgate", "11,918", "31 wins, 5 losses", "https://picsum.photos/seed/av2/96/96"))
        container.add_item(entry(3, "QuietAnvil", "10,002", "28 wins, 7 losses", "https://picsum.photos/seed/av3/96/96"))
        container.add_item(ui.TextDisplay(
            "**4.** Durandal — `9,410 pts`\n**5.** Glasspetal — `8,393 pts`\n-# Your rank: **#41** (2,140 pts)"
        ))
        self.add_item(container)

await channel.send(view=Leaderboard())
```

## Notes

- One Text Display carries ranks 4+ (with a subtext line for the viewer's own rank) to save component budget.
- `<t:1798761600:R>` renders a live countdown; users see it in their timezone.
- The Refresh button re-resolves and edits the message instead of posting a duplicate.
