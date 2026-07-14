import {defineType, defineField, defineArrayMember} from 'sanity'

// Rich-text block used for the essay: normal paragraphs + inline links
// (e.g. the Photography → Instagram link) and light emphasis.
const essayBlock = defineArrayMember({
  type: 'block',
  styles: [{title: 'Normal', value: 'normal'}],
  lists: [],
  marks: {
    decorators: [
      {title: 'Emphasis', value: 'em'},
      {title: 'Strong', value: 'strong'},
    ],
    annotations: [
      defineArrayMember({
        name: 'link',
        type: 'object',
        title: 'Link',
        fields: [
          defineField({
            name: 'href',
            type: 'url',
            title: 'URL',
            validation: (rule) => rule.required(),
          }),
        ],
      }),
    ],
  },
})

export const about = defineType({
  name: 'about',
  title: 'About page',
  type: 'document',
  fields: [
    defineField({
      name: 'lede',
      title: 'Lede',
      type: 'string',
      description: 'The oversized opening line, e.g. “Hello, I’m Joy.”',
    }),
    defineField({name: 'subLede', title: 'Sub-lede', type: 'string'}),
    defineField({
      name: 'intro',
      title: 'Essay — before the quote',
      type: 'array',
      of: [essayBlock],
    }),
    defineField({name: 'quote', title: 'Pulled quote', type: 'text', rows: 3}),
    defineField({name: 'quoteAttribution', title: 'Quote attribution', type: 'string'}),
    defineField({
      name: 'outro',
      title: 'Essay — after the quote',
      type: 'array',
      of: [essayBlock],
    }),
  ],
  preview: {prepare: () => ({title: 'About page'})},
})
