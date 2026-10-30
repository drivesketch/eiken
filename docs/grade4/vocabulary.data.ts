import { createVocabularyLoader } from '../.vitepress/vocabulary-loader.ts'

export default createVocabularyLoader(new URL('../../content/grade4/vocabulary.md', import.meta.url), [
  { id: 'school', title: '学校で習う単語', count: 349, first: 1, last: 349 },
  { id: 'exam', title: '英検にでる単語', count: 251, first: 350, last: 600 },
  { id: 'idioms', title: '熟語', count: 100, first: 601, last: 700 }
])
