# Recipe: announcement

Headed notice with timestamp countdown, change list, acknowledgment button, and a status link.

Rendered preview: [docs/mock/announcement.html](../docs/mock/announcement.html) (open in a browser).

Use when: maintenance windows, patch announcements, rule changes, event reminders.

## Raw payload

Canonical file: `payloads/announcement.json`.

```json
{
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "id": 1,
      "accent_color": 15158332,
      "components": [
        {
          "type": 10,
          "id": 2,
          "content": "## Server maintenance tonight\nDowntime window <t:1767187200:t> → <t:1767194400:t>. Expect 30-90 minutes of offline time."
        },
        { "type": 14, "id": 3, "divider": true, "spacing": 1 },
        {
          "type": 10,
          "id": 4,
          "content": "### What changes\n- Server merges: Vellmont + Kaelthas\n- New raid tier: The Drowned Chapel\n- Economy rebalance for consumables\n\n-# No character or inventory wipes"
        }
      ]
    },
    { "type": 14, "id": 5, "divider": false, "spacing": 1 },
    {
      "type": 1,
      "id": 6,
      "components": [
        { "type": 2, "style": 3, "label": "Got it", "custom_id": "maint:ack" },
        { "type": 2, "style": 5, "label": "Status page", "url": "https://status.example.com" }
      ]
    }
  ]
}
```

## discord.js

```ts
import {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize,
  ActionRowBuilder, ButtonBuilder,
} from "@discordjs/builders";
import { ButtonStyle, MessageFlags } from "discord-api-types/v10";

const container = new ContainerBuilder()
  .setAccentColor(0xe74c3c)
  .addTextDisplayComponents((t) =>
    t.setContent("## Server maintenance tonight\nDowntime window <t:1767187200:t> → <t:1767194400:t>. Expect 30-90 minutes of offline time."))
  .addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
  .addTextDisplayComponents((t) =>
    t.setContent("### What changes\n- Server merges: Vellmont + Kaelthas\n- New raid tier: The Drowned Chapel\n- Economy rebalance for consumables\n\n-# No character or inventory wipes"));

await channel.send({
  flags: MessageFlags.IsComponentsV2,
  components: [
    container,
    new SeparatorBuilder().setDivider(false),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("maint:ack").setLabel("Got it").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setLabel("Status page").setStyle(ButtonStyle.Link).setURL("https://status.example.com"),
    ),
  ],
});
```

On `maint:ack`, record the user and edit the message to move them out of the "unacknowledged" set:

```ts
acknowledged.add(interaction.user.id);
await message.edit({ flags: MessageFlags.IsComponentsV2, components: rebuild() });
```

## seyfert

```ts
import seyfert from "seyfert";
const { Container, TextDisplay, Separator, Spacing, ActionRow, Button, ButtonStyle } = seyfert;

const payload = [
  new Container({ accentColor: 0xe74c3c }).addComponents(
    new TextDisplay({ content: "## Server maintenance tonight\nDowntime window <t:1767187200:t> → <t:1767194400:t>. Expect 30-90 minutes of offline time." }),
    new Separator({ divider: true, spacing: Spacing.Small }),
    new TextDisplay({ content: "### What changes\n- Server merges: Vellmont + Kaelthas\n- New raid tier: The Drowned Chapel\n- Economy rebalance for consumables\n\n-# No character or inventory wipes" }),
  ),
  new Separator({ divider: false, spacing: Spacing.Small }),
  new ActionRow({
    components: [
      new Button({ custom_id: "maint:ack", style: ButtonStyle.Success, label: "Got it" }),
      new Button({ url: "https://status.example.com", style: ButtonStyle.Link, label: "Status page" }),
    ],
  }),
];
```

## discord.py

```python
import discord
from discord import ui

class MaintenanceNotice(ui.LayoutView):
    def __init__(self) -> None:
        super().__init__(timeout=None)
        c = ui.Container(accent_color=discord.Color.red())
        c.add_item(ui.TextDisplay("## Server maintenance tonight\nDowntime window <t:1767187200:t> → <t:1767194400:t>. Expect 30-90 minutes of offline time."))
        c.add_item(ui.Separator(visible=True, spacing=discord.SeparatorSpacing.small))
        c.add_item(ui.TextDisplay(
            "### What changes\n"
            "- Server merges: Vellmont + Kaelthas\n"
            "- New raid tier: The Drowned Chapel\n"
            "- Economy rebalance for consumables\n\n"
            "-# No character or inventory wipes"))
        self.add_item(c)
        self.add_item(ui.Separator(visible=False))
        self.add_item(ui.ActionRow(
            ui.Button(style=discord.ButtonStyle.success, label="Got it", custom_id="maint:ack"),
            ui.Button(style=discord.ButtonStyle.link, label="Status page", url="https://status.example.com"),
        ))

    @ui.button(label="Got it", style=discord.ButtonStyle.success, custom_id="maint:ack")
    async def acknowledge(self, interaction: discord.Interaction, button: ui.Button) -> None:
        await interaction.response.send_message("Noted - we will DM you when it is back up.", ephemeral=True)

await channel.send(view=MaintenanceNotice())
```

## Notes

- Timestamps `<t:unix:t>` render locally per viewer; add `:R` for relative ("in 3 hours").
- The container is red (`accent_color` 15158332) to signal urgency; use green for resolved-status posts.
- `-# No character or inventory wipes` as subtext is the classic "reassure people" line.
- Keep the ack row OUTSIDE the container if you plan to replace just the row state per user - per-user reactions don't edit shared messages for one viewer.
