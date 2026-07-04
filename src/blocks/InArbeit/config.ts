import type { Block } from 'payload'

export const InArbeit: Block = {
  slug: 'inArbeit',
  interfaceName: 'InArbeitBlock',
  imageURL: '/blocks/in-arbeit.svg',
  labels: {
    singular: 'In Arbeit',
    plural: 'In Arbeit',
  },
  admin: {
    group: 'Hüttenbau Custom',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'In Arbeit',
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      defaultValue: 'Hier wird noch gesägt und gehämmert. Schau bald wieder vorbei!',
      admin: {
        description: 'Short text shown below the title',
      },
    },
    {
      name: 'progress',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description:
          'Optional: construction progress in percent (0–100). Leave empty to hide the bar.',
      },
    },
    {
      name: 'eta',
      type: 'text',
      label: 'Expected completion',
      admin: {
        description: 'Optional, shown as a badge — e.g. "Fertig bis Sommer 2026"',
      },
    },
  ],
}
