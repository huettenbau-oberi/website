import type { Block } from 'payload'

import { linkGroup } from '../../../fields/linkGroup'

export const CampHero: Block = {
  slug: 'campHero',
  interfaceName: 'CampHeroBlock',
  imageURL: '/blocks/camp-hero.svg',
  imageAltText: 'Full-width hero with countdown and call-to-action buttons',
  labels: {
    plural: 'Camp Heroes',
    singular: 'Camp Hero',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
    },
    {
      name: 'countdownLabel',
      type: 'text',
      label: 'Text Above Countdown',
      defaultValue: 'Only...',
      admin: {
        width: '50%',
      },
    },
    {
      name: 'countdownDate',
      type: 'date',
      label: 'Countdown Target Date',
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
      name: 'countdownSuffix',
      type: 'text',
      label: 'Text Below Countdown',
      defaultValue: '...until camp begins!',
    },
    {
      name: 'registrationText',
      type: 'text',
      label: 'Registration Text',
      admin: {
        description: 'e.g. "Registration opens on 12.12.2025 at 12:12."',
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
          required: true,
          label: 'Flyer Preview Image',
          admin: {
            width: '50%',
            description: 'Image displayed as the flyer preview',
          },
        },
        {
          name: 'flyerFile',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Flyer PDF / File',
          admin: {
            width: '50%',
            description: 'File opened when the flyer is clicked',
          },
        },
      ],
    },
  ],
}
