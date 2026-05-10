import type { Block } from 'payload'

export const CampFacts: Block = {
  slug: 'campFacts',
  interfaceName: 'CampFactsBlock',
  labels: {
    singular: 'Camp Facts',
    plural: 'Camp Facts',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Fakten',
    },
    {
      name: 'facts',
      type: 'array',
      label: 'Facts',
      minRows: 1,
      maxRows: 8,
      fields: [
        {
          name: 'prefix',
          type: 'text',
          label: 'Label Above',
          admin: { description: 'e.g. "Zusammen mit"' },
        },
        {
          name: 'value',
          type: 'text',
          label: 'Value',
          required: true,
          admin: { description: 'The large number or text, e.g. "64"' },
        },
        {
          name: 'suffix',
          type: 'text',
          label: 'Label Below',
          admin: { description: 'e.g. "Kindern"' },
        },
      ],
    },
  ],
}
