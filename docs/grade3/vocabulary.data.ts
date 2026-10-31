import { createVocabularyLoader } from '../.vitepress/vocabulary-loader.ts'

export default createVocabularyLoader(new URL('../../content/grade3/vocabulary.md', import.meta.url),
  Array.from({ length: 12 }, (_, i) => ({
    id: `section-${i + 1}`,
    title: `Section ${i + 1}`,
    count: 100,
    first: i * 100 + 1,
    last: (i + 1) * 100
  }))
)
