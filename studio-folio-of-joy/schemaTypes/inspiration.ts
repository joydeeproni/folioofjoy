import {defineType, defineField, defineArrayMember} from 'sanity'

// A single editable list; the site groups items by category in a fixed order
// (Creatives → Companies → Artists → Style) when rendering.
export const inspiration = defineType({
  name: 'inspiration',
  title: 'Inspiration',
  type: 'document',
  fields: [
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'item',
          fields: [
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {list: ['Creatives', 'Companies', 'Artists', 'Style']},
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'note', title: 'Note', type: 'string'}),
            defineField({name: 'url', title: 'Link', type: 'url'}),
          ],
          preview: {select: {title: 'name', subtitle: 'category'}},
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Inspiration list'})},
})
