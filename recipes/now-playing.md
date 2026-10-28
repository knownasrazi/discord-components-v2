# Recipe: now playing

Album-art section, progress bar, transport buttons - one compact card.

Rendered preview: [docs/mock/now-playing.html](../docs/mock/now-playing.html) (open in a browser).

Use when: music bots, stream status, radio bots. Edit this message on track change instead of re-posting.

## Raw payload

Canonical file: `payloads/now-playing.json`.

```json
{
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "id": 1,
      "accent_color": 46536,
      "components": [
        {
          "type": 9,
          "id": 2,
          "accessory": {
            "type": 11,
            "media": { "url": "https://picsum.photos/seed/albumart/240/240" },
            "description": "Album art for Aurora Drift"
          },
          "components": [
            { "type": 10, "id": 3, "content": "### Now playing\n**Aurora Drift** — Neon Cartographer\n-# Requested by @Frostbyte" },
            { "type": 10, "id": 4, "content": "```\n▶ 01:12 ━━━━━━━●━━━━━━━━ 03:41\n```" }
          ]
        },
        {
          "type": 1,
          "id": 5,
          "components": [
            { "type": 2, "style": 2, "label": "Prev", "emoji": { "name": "⏮" }, "custom_id": "np:prev" },
            { "type": 2, "style": 2, "label": "Pause", "emoji": { "name": "⏸" }, "custom_id": "np:pause" },
            { "type": 2, "style": 2, "label": "Next", "emoji": { "name": "⏭" }, "custom_id": "np:next" },
            { "type": 2, "style": 2, "label": "Queue", "emoji": { "name": "🧵" }, "custom_id": "np:queue" }
          ]
        }
      ]
    }
  ]
}
```

## discord.js

```ts
import {
  ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, ActionRowBuilder, ButtonBuilder,
} from "@discordjs/builders";
import { ButtonStyle, MessageFlags } from "discord-api-types/v10";

function progressBar(position: number, duration: number) {
  const size = 14;
  const filled = Math.round((position / duration) * size);
  const line = "━".repeat(filled) + "●" + "━".repeat(size - filled);
  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return `\`\`\`\n▶ ${mmss(position)} ${line} ${mmss(duration)}\n\`\`\``;
}

const container = new ContainerBuilder()
  .setAccentColor(0x00b5c8)
  .addSectionComponents((sec) =>
    sec
      .addTextDisplayComponents((t) => t.setContent("### Now playing\n**Aurora Drift** — Neon Cartographer\n-# Requested by @Frostbyte"))
      .addTextDisplayComponents((t) => t.setContent(progressBar(72, 221)))
      .setThumbnailAccessory(
        new ThumbnailBuilder().setDescription("Album art for Aurora Drift").setURL("https://picsum.photos/seed/albumart/240/240"),
      ),
  )
  .addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("np:prev").setLabel("Prev").setEmoji({ name: "⏮" }).setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("np:pause").setLabel("Pause").setEmoji({ name: "⏸" }).setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("np:next").setLabel("Next").setEmoji({ name: "⏭" }).setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("np:queue").setLabel("Queue").setEmoji({ name: "🧵" }).setStyle(ButtonStyle.Secondary),
    ),
  );

await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
```

Update in place (position refresh):

```ts
const msg = await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
setInterval(() => {
  const updated = rebuild(positionSeconds + 1);
  void msg.edit({ flags: MessageFlags.IsComponentsV2, components: [updated] });
}, 10_000);
```

## seyfert

```ts
import seyfert from "seyfert";
const { Container, TextDisplay, Section, Thumbnail, ActionRow, Button, ButtonStyle } = seyfert;

const container = new Container({ accentColor: 0x00b5c8 }).addComponents(
  new Section({
    components: [
      new TextDisplay({ content: "### Now playing\n**Aurora Drift** — Neon Cartographer\n-# Requested by @Frostbyte" }),
      new TextDisplay({ content: "```\n▶ 01:12 ━━━━━━━●━━━━━━━━ 03:41\n```" }),
    ],
    accessory: new Thumbnail({ media: { url: "https://picsum.photos/seed/albumart/240/240" }, description: "Album art for Aurora Drift" }),
  }),
  new ActionRow({
    components: [
      new Button({ custom_id: "np:prev", style: ButtonStyle.Secondary, label: "Prev", emoji: { name: "⏮" } }),
      new Button({ custom_id: "np:pause", style: ButtonStyle.Secondary, label: "Pause", emoji: { name: "⏸" } }),
      new Button({ custom_id: "np:next", style: ButtonStyle.Secondary, label: "Next", emoji: { name: "⏭" } }),
      new Button({ custom_id: "np:queue", style: ButtonStyle.Secondary, label: "Queue", emoji: { name: "🧵" } }),
    ],
  }),
);
```

## discord.py

```python
import discord
from discord import ui

class NowPlaying(ui.LayoutView):
    def __init__(self, position: int, duration: int) -> None:
        super().__init__(timeout=None)
        filled = round(position / duration * 14)
        line = "━" * filled + "●" + "━" * (14 - filled)
        mmss = lambda s: f"{s // 60:02d}:{s % 60:02d}"
        bar = f"```\n▶ {mmss(position)} {line} {mmss(duration)}\n```"
        c = ui.Container(accent_color=discord.Color.from_str("#00B5C8"))
        c.add_item(ui.Section(
            ui.TextDisplay("### Now playing\n**Aurora Drift** — Neon Cartographer\n-# Requested by @Frostbyte"),
            ui.TextDisplay(bar),
            accessory=ui.Thumbnail("https://picsum.photos/seed/albumart/240/240", description="Album art for Aurora Drift"),
        ))
        c.add_item(ui.ActionRow(
            ui.Button(style=discord.ButtonStyle.secondary, label="Prev", custom_id="np:prev", emoji="⏮"),
            ui.Button(style=discord.ButtonStyle.secondary, label="Pause", custom_id="np:pause", emoji="⏸"),
            ui.Button(style=discord.ButtonStyle.secondary, label="Next", custom_id="np:next", emoji="⏭"),
            ui.Button(style=discord.ButtonStyle.secondary, label="Queue", custom_id="np:queue", emoji="🧵"),
        ))
        self.add_item(c)

await channel.send(view=NowPlaying(72, 221))
```

## Notes

- The progress bar is a monospace code block; Discord has no native progress component. `▶` becomes `⏸` when paused.
- Emoji buttons shorten the row so all four transport controls fit (5 per row max).
- Edit the same message on each tick; do not delete+repost (it reorders in chat and drops state).
