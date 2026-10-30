import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

type Definition = { id: string; title: string; count: number; first: number; last: number }

export function createVocabularyLoader(sourceUrl: URL, definitions: Definition[]) {
  const source = fileURLToPath(sourceUrl)
  return {
    watch: [source],
    load() {
      const groups = definitions.map(definition => ({
        ...definition,
        entries: [] as { id: number; english: string; meaning: string }[]
      }))
      let current: typeof groups[number] | undefined
      const ids = new Set<number>()

      for (const line of readFileSync(source, 'utf8').split(/\r?\n/)) {
        if (line.startsWith('## ')) {
          current = groups.find(group => group.title === line.slice(3).trim())
          if (!current) throw new Error(`Unknown vocabulary section: ${line}`)
        }
        if (!/^\|\s*\d/.test(line)) continue
        const cells = line.split('|').slice(1, -1).map(cell => cell.trim())
        const [rawId, english, meaning] = cells
        const id = Number(rawId)
        if (!current || cells.length !== 3 || !Number.isInteger(id) || !english || !meaning) {
          throw new Error(`Invalid vocabulary row: ${line}`)
        }
        if (ids.has(id) || id < current.first || id > current.last) {
          throw new Error(`Duplicate or out-of-range vocabulary number: ${id}`)
        }
        ids.add(id)
        current.entries.push({ id, english, meaning })
      }

      for (const group of groups) {
        if (group.entries.length !== group.count || group.entries.some((entry, i) => entry.id !== group.first + i)) {
          throw new Error(`Vocabulary coverage mismatch: ${group.title} (expected ${group.count})`)
        }
      }
      return groups
    }
  }
}
