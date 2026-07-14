import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Singleton documents — one editable instance each, opened directly (no list).
const SINGLETONS = [
  {id: 'about', type: 'about', title: 'About page'},
  {id: 'inspiration', type: 'inspiration', title: 'Inspiration'},
  {id: 'work', type: 'work', title: 'Work'},
]

export default defineConfig({
  name: 'default',
  title: 'Folio Of Joy',

  projectId: 'ky6s08oc',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            ...SINGLETONS.map((s) =>
              S.listItem()
                .title(s.title)
                .id(s.id)
                .child(S.document().schemaType(s.type).documentId(s.id)),
            ),
            S.divider(),
            S.documentTypeListItem('writing').title('Writings'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Keep singletons out of the global “create new” menu.
    templates: (prev) => prev.filter((t) => !SINGLETONS.some((s) => s.type === t.schemaType)),
  },
})
