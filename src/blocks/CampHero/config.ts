import type { Block } from 'payload'

import { linkGroup } from '../../fields/linkGroup'

export const CampHero: Block = {
  slug: 'campHero',
  interfaceName: 'CampHeroBlock',
  labels: {
    plural: 'Camp Heroes',
    singular: 'Camp Hero',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Untertitel',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'countdownDate',
          type: 'date',
          label: 'Countdown-Zieldatum',
          required: true,
          admin: {
            width: '50%',
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'dd.MM.yyyy HH:mm',
            },
          },
        },
        {
          name: 'countdownLabel',
          type: 'text',
          label: 'Text über Countdown',
          defaultValue: 'Nur noch...',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'countdownSuffix',
      type: 'text',
      label: 'Text unter Countdown',
      defaultValue: '...bis zum Lagerbeginn!',
    },
    {
      name: 'registrationText',
      type: 'text',
      label: 'Anmeldungstext',
      admin: {
        description: 'z.B. "Die Anmeldung wird am 12.12.2025 um 12:12 freigeschaltet."',
      },
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        label: 'Buttons',
        maxRows: 4,
      },
    }),
    {
      type: 'row',
      fields: [
        {
          name: 'flyerImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Flyer Vorschaubild',
          admin: {
            width: '50%',
            description: 'Bild das als Flyer-Vorschau angezeigt wird',
          },
        },
        {
          name: 'flyerFile',
          type: 'upload',
          relationTo: 'media',
          label: 'Flyer PDF / Datei',
          admin: {
            width: '50%',
            description: 'Datei die beim Klick auf den Flyer geöffnet wird',
          },
        },
      ],
    },
  ],
}
