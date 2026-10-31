// Split only the web presentation; the authored Markdown remains one file.
export function paginateWorkbook(source: string): string {
  if (!/^# 英検[45]級 基本文型/m.test(source)) return source
  const sections = source.split(/(?=^## )/m)
  const title = sections.shift()!
  const answers = sections.find(s => s.startsWith('## Answer Key'))
  const answerIntro = answers?.split(/(?=^### (?:Passage|Lesson) \d+)/m)[0].replace(/^## Answer Key\s*/, '').trim() ?? ''
  const answerMap = new Map<string, string>()
  if (answers) {
    for (const part of answers.split(/(?=^### (?:Passage|Lesson) \d+)/m).slice(1)) {
      const match = part.match(/^### (Passage|Lesson) (\d+)/)!
      answerMap.set(`${match[1]}-${match[2]}`, (answerIntro ? answerIntro + '\n\n' : '') + part)
    }
  }
  const pages: { id: string; title: string; body: string; answer?: string }[] = []
  for (const section of sections) {
    const heading = section.split('\n')[0].slice(3)
    if (heading === 'Answer Key' || heading.startsWith('Final Check —')) continue
    const lesson = heading.match(/^(Passage|Lesson) (\d+)/)
    const id = lesson ? `${lesson[1].toLowerCase()}-${lesson[2]}` : heading === 'Final Check' ? 'final-check' : `guide-${pages.length}`
    if (lesson && !answerMap.has(`${lesson[1]}-${lesson[2]}`)) throw new Error(`Missing answer: ${heading}`)
    pages.push({ id, title: heading, body: section,
      answer: lesson ? answerMap.get(`${lesson[1]}-${lesson[2]}`) : heading === 'Final Check' ? sections.find(s => s.startsWith('## Final Check —')) : undefined })
  }
  const metadata = JSON.stringify(pages.map(({ id, title, answer }) => ({ id, title, hasAnswer: !!answer }))).replace(/'/g, '&#39;')
  const clean = (s: string) => s.trim().replace(/\n---\s*$/, '')
  return title + `\n<WorkbookPager :pages='${metadata}'>\n\n` + pages.map(p =>
    `<template #${p.id}>\n\n${clean(p.body)}\n\n</template>\n\n` +
    (p.answer ? `<template #${p.id}-answer>\n\n${clean(p.answer)}\n\n</template>\n\n` : '')
  ).join('') + '</WorkbookPager>\n'
}
