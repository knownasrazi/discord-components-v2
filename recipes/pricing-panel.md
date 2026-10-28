# Recipe: pricing panel

Three plan cards as sections with per-plan buttons, inside one accent container.

Rendered preview: [docs/mock/pricing-panel.html](../docs/mock/pricing-panel.html) (open in a browser).

Use when: subscription tiers, donation tiers, feature comparison.

## Raw payload

Canonical file: `payloads/pricing-panel.json`.

```json
{
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "id": 1,
      "accent_color": 3066993,
      "components": [
        {
          "type": 10,
          "id": 2,
          "content": "## Pick a plan\nAll plans include the full node pool, 24/7 uptime, and same-day support. Cancel anytime."
        },
        { "type": 14, "id": 3, "divider": true, "spacing": 1 },
        {
          "type": 9,
          "id": 4,
          "accessory": { "type": 2, "style": 2, "label": "Start free", "custom_id": "billing:start:free" },
          "components": [
            { "type": 10, "id": 5, "content": "### Free\n`$0 / month`\n- 1 node, shared CPU\n- 2GB RAM\n- Community support" }
          ]
        },
        {
          "type": 9,
          "id": 6,
          "accessory": { "type": 2, "style": 1, "label": "Get Pro", "custom_id": "billing:start:pro" },
          "components": [
            { "type": 10, "id": 7, "content": "### Pro\n`$9 / month`\n- 4 nodes, dedicated CPU\n- 8GB RAM, custom region\n- Priority support" }
          ]
        },
        {
          "type": 9,
          "id": 8,
          "accessory": { "type": 2, "style": 2, "label": "Contact sales", "custom_id": "billing:start:team" },
          "components": [
            { "type": 10, "id": 9, "content": "### Team\n`$29 / month`\n- 12 nodes, dedicated CPU\n- 32GB RAM, status webhook\n- 1h response SLA" }
          ]
        },
        { "type": 14, "id": 10, "divider": false, "spacing": 2 },
        {
          "type": 1,
          "id": 11,
          "components": [
            { "type": 2, "style": 1, "label": "Get Pro", "custom_id": "billing:start:pro" },
            { "type": 2, "style": 2, "label": "Compare plans", "custom_id": "billing:compare" },
            { "type": 2, "style": 5, "label": "Docs", "url": "https://example.com/docs" }
          ]
        }
      ]
    }
  ]
}
```

## discord.js

```ts
function plan(name: string, price: string, lines: string, btn: { label: string; id: string; style: ButtonStyle }) {
  return new SectionBuilder()
    .addTextDisplayComponents((t) => t.setContent(`### ${name}\n\`${price}\`\n${lines}`))
    .setButtonAccessory(
      new ButtonBuilder().setCustomId(btn.id).setLabel(btn.label).setStyle(btn.style),
    );
}

const container = new ContainerBuilder()
  .setAccentColor(0x2ecc71)
  .addTextDisplayComponents((t) =>
    t.setContent("## Pick a plan\nAll plans include the full node pool, 24/7 uptime, and same-day support. Cancel anytime."),
  )
  .addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
  .addSectionComponents(plan("Free", "$0 / month", "- 1 node, shared CPU\n- 2GB RAM\n- Community support",
    { label: "Start free", id: "billing:start:free", style: ButtonStyle.Secondary }))
  .addSectionComponents(plan("Pro", "$9 / month", "- 4 nodes, dedicated CPU\n- 8GB RAM, custom region\n- Priority support",
    { label: "Get Pro", id: "billing:start:pro", style: ButtonStyle.Primary }))
  .addSectionComponents(plan("Team", "$29 / month", "- 12 nodes, dedicated CPU\n- 32GB RAM, status webhook\n- 1h response SLA",
    { label: "Contact sales", id: "billing:start:team", style: ButtonStyle.Secondary }))
  .addSeparatorComponents((s) => s.setDivider(false).setSpacing(SeparatorSpacingSize.Large))
  .addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("billing:start:pro").setLabel("Get Pro").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("billing:compare").setLabel("Compare plans").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setLabel("Docs").setStyle(ButtonStyle.Link).setURL("https://example.com/docs"),
    ),
  );

await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
```

## seyfert

```ts
import seyfert from "seyfert";
const { Container, TextDisplay, Section, Separator, Spacing, ActionRow, Button, ButtonStyle } = seyfert;

function plan(name, price, lines, btn) {
  return new Section({
    components: [new TextDisplay({ content: `### ${name}\n\`${price}\`\n${lines}` })],
    accessory: new Button({ custom_id: btn.id, style: btn.style, label: btn.label }),
  });
}

const container = new Container({ accentColor: 0x2ecc71 }).addComponents(
  new TextDisplay({ content: "## Pick a plan\nAll plans include the full node pool, 24/7 uptime, and same-day support. Cancel anytime." }),
  new Separator({ divider: true, spacing: Spacing.Small }),
  plan("Free", "$0 / month", "- 1 node, shared CPU\n- 2GB RAM\n- Community support",
    { id: "billing:start:free", style: ButtonStyle.Secondary, label: "Start free" }),
  plan("Pro", "$9 / month", "- 4 nodes, dedicated CPU\n- 8GB RAM, custom region\n- Priority support",
    { id: "billing:start:pro", style: ButtonStyle.Primary, label: "Get Pro" }),
  plan("Team", "$29 / month", "- 12 nodes, dedicated CPU\n- 32GB RAM, status webhook\n- 1h response SLA",
    { id: "billing:start:team", style: ButtonStyle.Secondary, label: "Contact sales" }),
  new Separator({ divider: false, spacing: Spacing.Large }),
  new ActionRow({
    components: [
      new Button({ custom_id: "billing:start:pro", style: ButtonStyle.Primary, label: "Get Pro" }),
      new Button({ custom_id: "billing:compare", style: ButtonStyle.Secondary, label: "Compare plans" }),
      new Button({ url: "https://example.com/docs", style: ButtonStyle.Link, label: "Docs" }),
    ],
  }),
);
```

## discord.py

```python
import discord
from discord import ui

def plan(name: str, price: str, lines: str, label: str, cid: str, style: discord.ButtonStyle) -> ui.Section:
    return ui.Section(
        ui.TextDisplay(f"### {name}\n`{price}`\n{lines}"),
        accessory=ui.Button(style=style, label=label, custom_id=cid),
    )

class Pricing(ui.LayoutView):
    def __init__(self) -> None:
        super().__init__(timeout=None)
        c = ui.Container(accent_color=discord.Color.green())
        c.add_item(ui.TextDisplay("## Pick a plan\nAll plans include the full node pool, 24/7 uptime, and same-day support. Cancel anytime."))
        c.add_item(ui.Separator(visible=True, spacing=discord.SeparatorSpacing.small))
        c.add_item(plan("Free", "$0 / month", "- 1 node, shared CPU\n- 2GB RAM\n- Community support", "Start free", "billing:start:free", discord.ButtonStyle.secondary))
        c.add_item(plan("Pro", "$9 / month", "- 4 nodes, dedicated CPU\n- 8GB RAM, custom region\n- Priority support", "Get Pro", "billing:start:pro", discord.ButtonStyle.primary))
        c.add_item(plan("Team", "$29 / month", "- 12 nodes, dedicated CPU\n- 32GB RAM, status webhook\n- 1h response SLA", "Contact sales", "billing:start:team", discord.ButtonStyle.secondary))
        c.add_item(ui.Separator(visible=False, spacing=discord.SeparatorSpacing.large))
        c.add_item(ui.ActionRow(
            ui.Button(style=discord.ButtonStyle.primary, label="Get Pro", custom_id="billing:start:pro"),
            ui.Button(style=discord.ButtonStyle.secondary, label="Compare plans", custom_id="billing:compare"),
            ui.Button(style=discord.ButtonStyle.link, label="Docs", url="https://example.com/docs"),
        ))
        self.add_item(c)

await channel.send(view=Pricing())
```

## Notes

- `divider: false` separators add vertical breathing room between the last card and the CTA row without drawing a line.
- The Pro card's button uses style 1 (primary/blue) to draw the eye; the others stay secondary.
- Component count: 1 container + 1 text + 1 sep + 3 sections + 3 buttons + 1 sep + 1 row + 3 buttons = 15.
