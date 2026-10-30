import { createVocabularyLoader } from '../.vitepress/vocabulary-loader.ts'

export default createVocabularyLoader(new URL('../../content/grade5/vocabulary.md', import.meta.url), [
  { id: 'school', title: '学校で習う単語', count: 319, first: 1, last: 319 },
  { id: 'exam', title: '英検にでる単語', count: 251, first: 320, last: 570 },
  { id: 'idioms', title: '熟語', count: 30, first: 571, last: 600 }
])
