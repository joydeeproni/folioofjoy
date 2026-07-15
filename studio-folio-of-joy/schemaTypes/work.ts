import {defineType, defineField, defineArrayMember} from 'sanity'

// One ordered list; the array order is the marquee / carousel order on the site.
export const work = defineType({
  name: 'work',
  title: 'Work',
  type: 'document',
  fields: [
    defineField({
      name: 'items',
      title: 'Projects (in display order)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'workItem',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
            }),
            defineField({
              name: 'video',
              title: 'Video (optional — used instead of image)',
              type: 'file',
              options: {accept: 'video/*'},
            }),
            defineField({name: 'caption', title: 'Caption', type: 'text', rows: 2}),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: [
                  {title: 'Service (SVC)', value: 'SVC'},
                  {title: 'Joy (JOY)', value: 'JOY'},
                  {title: 'Business (BIZ)', value: 'BIZ'},
                  {title: 'Duty (DTY)', value: 'DTY'},
                ],
              },
            }),
            defineField({
              name: 'links',
              title: 'Links',
              description: 'Case study, live site, Behance, etc. Shown as chips in the detail view.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'link',
                  fields: [
                    defineField({name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required()}),
                    defineField({name: 'url', title: 'URL', type: 'url', validation: (rule) => rule.required()}),
                  ],
                  preview: {select: {title: 'label', subtitle: 'url'}},
                }),
              ],
            }),
          ],
          preview: {select: {title: 'caption', subtitle: 'category', media: 'image'}},
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Work'})},
})
