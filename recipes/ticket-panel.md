# Recipe: ticket panel + modal

Support panel with rules, an open-ticket button that fires a label-based modal (short text + select + paragraph).

Rendered preview: [docs/mock/ticket-panel.html](../docs/mock/ticket-panel.html) (open in a browser).

Use when: support desks, applications, moderator requests. The modal payload is `payloads/ticket-panel.modal.json` and the full guide is `references/modals.md`.

## Raw payload (panel)

Canonical file: `payloads/ticket-panel.json`.

```json
{
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "id": 1,
      "accent_color": 3447003,
      "components": [
        {
          "type": 10,
          "id": 2,
          "content": "## Support Tickets\nOpen a ticket for anything account or billing related. One ticket per issue, please."
        },
        { "type": 14, "id": 3, "divider": true, "spacing": 1 },
        {
          "type": 10,
          "id": 4,
          "content": "- Before opening: check <#111222333444555888> for known issues\n- Tickets are private between you and staff\n- Abandoned tickets close after 48h of inactivity"
        },
        {
          "type": 1,
          "id": 5,
          "components": [
            { "type": 2, "style": 3, "label": "Open a ticket", "custom_id": "ticket:open" },
            { "type": 2, "style": 2, "label": "My tickets", "custom_id": "ticket:mine" },
            { "type": 2, "style": 5, "label": "FAQ", "url": "https://example.com/faq" }
          ]
        }
      ]
    }
  ]
}
```

## Raw payload (modal)

Canonical file: `payloads/ticket-panel.modal.json`.

```json
{
  "type": 9,
  "data": {
    "custom_id": "ticket:modal",
    "title": "Open a support ticket",
    "components": [
      { "type": 10, "id": 1, "content": "Tell us what is wrong. The more specific you are, the faster we can help." },
      {
        "type": 18,
        "id": 2,
        "label": "Subject",
        "description": "Short summary, shown in the staff queue",
        "component": {
          "type": 4,
          "custom_id": "ticket:subject",
          "style": 1,
          "min_length": 3,
          "max_length": 64,
          "placeholder": "Refund for order #2341",
          "required": true
        }
      },
      {
        "type": 18,
        "id": 4,
        "label": "Category",
        "component": {
          "type": 3,
          "custom_id": "ticket:category",
          "placeholder": "Where does this fit?",
          "required": true,
          "options": [
            { "label": "Billing", "value": "billing", "description": "Payments, invoices, refunds", "emoji": { "name": "💳" } },
            { "label": "Account", "value": "account", "description": "Login, verification, bans", "emoji": { "name": "👤" } },
            { "label": "Bug", "value": "bug", "description": "Something is broken", "emoji": { "name": "🐛" } },
            { "label": "Other", "value": "other", "description": "Anything else", "emoji": { "name": "❔" } }
          ]
        }
      },
      {
        "type": 18,
        "id": 6,
        "label": "Details",
        "description": "Include order numbers, timestamps, and what you already tried",
        "component": {
          "type": 4,
          "custom_id": "ticket:details",
          "style": 2,
          "min_length": 20,
          "max_length": 2000,
          "placeholder": "Describe the problem in as much detail as you can...",
          "required": true
        }
      }
    ]
  }
}
```

## discord.js

```ts
import {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize,
  ActionRowBuilder, ButtonBuilder,
  ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder,
} from "@discordjs/builders";
import { ButtonStyle, MessageFlags, TextInputStyle as TIS } from "discord-api-types/v10";

const panel = new ContainerBuilder()
  .setAccentColor(0x3498db)
  .addTextDisplayComponents((t) =>
    t.setContent("## Support Tickets\nOpen a ticket for anything account or billing related. One ticket per issue, please."))
  .addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
  .addTextDisplayComponents((t) =>
    t.setContent("- Before opening: check <#111222333444555888> for known issues\n- Tickets are private between you and staff\n- Abandoned tickets close after 48h of inactivity"))
  .addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("ticket:open").setLabel("Open a ticket").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("ticket:mine").setLabel("My tickets").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setLabel("FAQ").setStyle(ButtonStyle.Link).setURL("https://example.com/faq"),
    ),
  );

const modal = new ModalBuilder()
  .setCustomId("ticket:modal")
  .setTitle("Open a support ticket")
  .addLabelComponents((label) =>
    label
      .setLabel("Subject")
      .setDescription("Short summary, shown in the staff queue")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("ticket:subject")
          .setStyle(TIS.Short)
          .setMinLength(3)
          .setMaxLength(64)
          .setPlaceholder("Refund for order #2341")
          .setRequired(true),
      ),
  );

await channel.send({ flags: MessageFlags.IsComponentsV2, components: [panel] });
// on the button interaction:
await interaction.showModal(modal);
```

(The Category select-label and Details paragraph-label are composed the same way with `StringSelectMenuBuilder` / `style: TIS.Paragraph`.)

## seyfert

```ts
import seyfert from "seyfert";
const { Container, TextDisplay, Separator, Spacing, ActionRow, Button, ButtonStyle, Label, TextInput, TextInputStyle, StringSelect } = seyfert;

// Note: pass `label:` to Label (the API field name). seyfert's own `text:` kwarg
// serializes as "text", which the API rejects - see gotchas #23.

const panel = new Container({ accentColor: 0x3498db }).addComponents(
  new TextDisplay({ content: "## Support Tickets\nOpen a ticket for anything account or billing related. One ticket per issue, please." }),
  new Separator({ divider: true, spacing: Spacing.Small }),
  new TextDisplay({ content: "- Before opening: check <#111222333444555888> for known issues\n- Tickets are private between you and staff\n- Abandoned tickets close after 48h of inactivity" }),
  new ActionRow({
    components: [
      new Button({ custom_id: "ticket:open", style: ButtonStyle.Success, label: "Open a ticket" }),
      new Button({ custom_id: "ticket:mine", style: ButtonStyle.Secondary, label: "My tickets" }),
      new Button({ url: "https://example.com/faq", style: ButtonStyle.Link, label: "FAQ" }),
    ],
  }),
);

const modal = {
  type: 9,
  data: {
    custom_id: "ticket:modal",
    title: "Open a support ticket",
    components: [
      new Label({
        label: "Subject",
        description: "Short summary, shown in the staff queue",
        component: new TextInput({
          custom_id: "ticket:subject", style: TextInputStyle.Short,
          min_length: 3, max_length: 64, placeholder: "Refund for order #2341", required: true,
        }),
      }),
    ],
  },
};
```

## discord.py

```python
import discord
from discord import ui

class TicketPanel(ui.LayoutView):
    def __init__(self) -> None:
        super().__init__(timeout=None)
        c = ui.Container(accent_color=discord.Color.blurple())
        c.add_item(ui.TextDisplay("## Support Tickets\nOpen a ticket for anything account or billing related. One ticket per issue, please."))
        c.add_item(ui.Separator(visible=True, spacing=discord.SeparatorSpacing.small))
        c.add_item(ui.TextDisplay(
            "- Before opening: check <#111222333444555888> for known issues\n"
            "- Tickets are private between you and staff\n"
            "- Abandoned tickets close after 48h of inactivity"))
        c.add_item(ui.ActionRow(
            ui.Button(style=discord.ButtonStyle.success, label="Open a ticket", custom_id="ticket:open"),
            ui.Button(style=discord.ButtonStyle.secondary, label="My tickets", custom_id="ticket:mine"),
            ui.Button(style=discord.ButtonStyle.link, label="FAQ", url="https://example.com/faq"),
        ))
        self.add_item(c)

class TicketModal(ui.Modal, title="Open a support ticket"):
    subject = ui.TextInput(label="Subject", placeholder="Refund for order #2341", min_length=3, max_length=64, style=discord.TextStyle.short)
    details = ui.TextInput(label="Details", style=discord.TextStyle.paragraph, min_length=20, max_length=2000)

    async def callback(self, interaction: discord.Interaction) -> None:
        await interaction.response.send_message(f"Ticket opened: {self.subject.value}", ephemeral=True)

await channel.send(view=TicketPanel())
```

## Notes

- The panel keeps rules OUTSIDE the CTA row so the buttons stay visually adjacent to the header.
- The modal has 4 top-level components (1 text display + 3 labels) - still under the 5 slot budget.
- Reading values on submit: `interaction.data.components[i].component.value` for text inputs, `.values` for selects (see `references/modals.md`).
