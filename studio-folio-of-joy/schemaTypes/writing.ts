import {defineType, defineField, defineArrayMember} from 'sanity'

export const writing = defineType({
  name: 'writing',
  title: 'Writing',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'number', title: 'Number', type: 'string', description: 'e.g. 01'}),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      description: 'Shown as the category label in place of a date',
      options: {
        list: [
          {title: 'Thoughts', value: 'Thoughts'},
          {title: 'Research', value: 'Research'},
          {title: 'Experiments', value: 'Experiments'},
          {title: 'Case Study', value: 'Case Study'},
        ],
      },
    }),
    defineField({name: 'postedOn', title: 'Posted on', type: 'string', description: 'e.g. July 13th, 2026'}),
    defineField({name: 'titled', title: 'Titled (label under TITLED)', type: 'string'}),
    defineField({name: 'subhead', title: 'Subhead (bold intro)', type: 'string'}),
    defineField({name: 'body', title: 'Body', type: 'array', of: [defineArrayMember({type: 'block'})]}),
    defineField({
      name: 'references',
      title: 'References',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Label', type: 'string'}),
            defineField({name: 'href', title: 'URL', type: 'string'}),
          ],
          preview: {select: {title: 'label'}},
        }),
      ],
    }),
    defineField({name: 'heroImage', title: 'Hero image', type: 'image', options: {hotspot: true}}),
  ],
  orderings: [
    {title: 'Number', name: 'numberAsc', by: [{field: 'number', direction: 'asc'}]},
  ],
  preview: {select: {title: 'title', subtitle: 'number'}},
})
