# Label-based modals

Modals got rebuilt alongside Components V2: instead of flat action rows of text inputs, modal `components` now hold **Label (18)** wrappers around one input each. Legacy action-row modals keep working, but File Uploads and Radio/Checkbox groups only exist through labels.

## Full worked example

Payload (`payloads/ticket-panel.modal.json`, typechecked):

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
            { "label": "Billing", "value": "billing" },
            { "label": "Account", "value": "account" },
            { "label": "Bug", "value": "bug" },
            { "label": "Other", "value": "other" }
          ]
        }
      },
      {
        "type": 18,
        "id": 6,
        "label": "Details",
        "component": {
          "type": 4,
          "custom_id": "ticket:details",
          "style": 2,
          "min_length": 20,
          "max_length": 2000,
          "required": true
        }
      }
    ]
  }
}
```

## Label rules

- 1-5 top-level components per modal; each Label wraps exactly one input component.
- `label` max 45 chars, `description` max 100 chars, modal `title` max 45 chars.
- Allowed inside Label: Text Input (4), String Select (3), User/Role/Mentionable/Channel Select (5-8), File Upload (19), Radio Group (21), Checkbox Group (22), Checkbox (23).
- Text Display (10) is allowed directly in modal `components` for static helper text (counts toward the 5-slot budget).

## Reading the submission

The interaction data comes back as component values:

```json
{
  "custom_id": "ticket:modal",
  "components": [
    {
      "id": 2,
      "type": 18,
      "component": {
        "id": 3,
        "type": 4,
        "custom_id": "ticket:subject",
        "value": "Refund for order #2341"
      }
    },
    {
      "id": 4,
      "type": 18,
      "component": {
        "id": 5,
        "type": 3,
        "custom_id": "ticket:category",
        "values": ["billing"]
      }
    }
  ]
}
```

- Text Input / Radio Group: `value` (string; Radio returns `null` if nothing selected).
- Selects and Checkbox Group: `values` (array of strings; Checkbox Group can be `[]`).
- Checkbox: `value` (boolean; checkboxes cannot be `required` - use a single-option Checkbox Group with `required` instead).
- File Upload: `values` holds attachment snowflakes you resolve from `data.resolved.attachments`.
- File Upload accepts `file_types` (max 10 entries: `image`, `video`, `audio`, or dot-prefixed extensions like `.pdf`; matching is by extension only) and `min_values`/`max_values` (0-10; `min_values` must be >= 1 unless `required` is false).
- Radio Group options: 2-10; Checkbox Group options: 1-10 with optional `min_values` (0-10) / `max_values`.

## When to use labels vs legacy rows

- New code: use Labels - they are required for anything beyond text inputs, and static Text Display helper text is nice.
- Legacy rows (top-level Action Rows containing Text Inputs) still submit fine, but they cannot host selects-with-labels, file uploads, or the newer input types.

## Library notes

- **discord.js 1.14.x builders**: `ModalBuilder.addLabelComponents((label) => label.setLabel("Subject").setDescription("...").setTextInputComponent(new TextInputBuilder()...))`. `ModalBuilder.toJSON()` emits the data object; wrap it as `{ type: 9, data }` for raw REST, or just call `interaction.showModal(modal)`.
- **discord.py 2.7**: `ui.Label(text="Subject", component=ui.TextInput(...))` - the constructor kwarg is `text` (serializes correctly to the `label` API field). Legacy `ui.TextInput(label=...)` declared directly on a `ui.Modal` still works for text-only modals.
- **seyfert 5.2.1**: pass the API field name to the constructor - `new Label({ label: "Subject", component })`. seyfert's own `text:` kwarg serializes as `"text"` and the API rejects it (gotchas #23).
