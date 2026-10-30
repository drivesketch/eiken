<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Entry = { id: number; english: string; meaning: string }
type Group = { id: string; title: string; entries: Entry[] }
const props = defineProps<{ groups: Group[] }>()

const category = ref(props.groups[0]?.id ?? 'all')
const query = ref('')
const pageSize = ref(25)
const page = ref(0)
const revealed = ref(new Set<number>())

const allEntries = computed(() => props.groups.flatMap(group => group.entries))
const categoryTitle = computed(() => props.groups.find(group => group.id === category.value)?.title ?? 'すべての分類')
const categoryEntries = computed(() => category.value === 'all'
  ? allEntries.value
  : props.groups.find(group => group.id === category.value)?.entries ?? [])
const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase().trim()
const filtered = computed(() => {
  const terms = normalize(query.value).split(/\s+/).filter(Boolean)
  return categoryEntries.value.filter(entry => {
    const text = normalize(`${entry.id} ${entry.english} ${entry.meaning}`)
    return terms.every(term => text.includes(term))
  })
})
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const visible = computed(() => filtered.value.slice(page.value * pageSize.value, (page.value + 1) * pageSize.value))
const rangeStart = computed(() => filtered.value.length ? page.value * pageSize.value + 1 : 0)
const rangeEnd = computed(() => Math.min((page.value + 1) * pageSize.value, filtered.value.length))
const revealedCount = computed(() => visible.value.filter(entry => revealed.value.has(entry.id)).length)

watch([category, query, pageSize], () => {
  page.value = 0
  revealed.value = new Set()
}, { flush: 'sync' })
watch(page, () => { revealed.value = new Set() }, { flush: 'sync' })

function toggle(id: number) {
  const next = new Set(revealed.value)
  next.has(id) ? next.delete(id) : next.add(id)
  revealed.value = next
}
function revealRange() {
  revealed.value = new Set(visible.value.map(entry => entry.id))
}
</script>

<template>
  <section class="vocabulary-study" aria-label="単語と熟語の練習">
    <div class="vocab-overview">
      <span class="vocab-eyebrow">WORD PRACTICE</span>
      <span class="vocab-total">単語・熟語 <strong>{{ allEntries.length }}</strong> 項目</span>
    </div>

    <div class="vocab-categories" role="group" aria-label="学習する分類">
      <button v-for="group in groups" :key="group.id" type="button"
        :aria-pressed="category === group.id" @click="category = group.id">
        {{ group.title }} <span>{{ group.entries.length }}</span>
      </button>
      <button type="button" :aria-pressed="category === 'all'" @click="category = 'all'">
        すべての分類 <span>{{ allEntries.length }}</span>
      </button>
    </div>

    <div class="vocab-filters">
      <div class="vocab-search">
        <label for="vocab-query">単語を探す</label>
        <div class="vocab-search-field">
          <input id="vocab-query" v-model="query" type="search" placeholder="英語・日本語・番号で絞り込み"
            autocomplete="off" aria-controls="vocab-table" />
          <button v-if="query" type="button" class="vocab-clear" @click="query = ''">クリア</button>
        </div>
      </div>
      <div class="vocab-page-size">
        <label for="vocab-size">表示件数</label>
        <select id="vocab-size" v-model.number="pageSize">
          <option :value="25">25項目ずつ</option>
          <option :value="50">50項目ずつ</option>
          <option :value="allEntries.length">すべて表示</option>
        </select>
      </div>
    </div>

    <div class="vocab-range">
      <div>
        <h2 class="vocab-category-title">{{ categoryTitle }}</h2>
        <p class="vocab-status" role="status" aria-live="polite">
          {{ rangeStart }}–{{ rangeEnd }} / {{ filtered.length }} 項目<span v-if="query.trim()">（絞り込み中）</span>
        </p>
      </div>
      <div v-if="pageCount > 1" class="vocab-pagination" aria-label="上部の範囲切り替え">
        <button type="button" :disabled="page === 0" aria-label="前の範囲" @click="page--">←</button>
        <label class="vocab-sr-only" for="vocab-page">学習する範囲</label>
        <select id="vocab-page" v-model.number="page">
          <option v-for="(_, i) in pageCount" :key="i" :value="i">
            {{ i * pageSize + 1 }}–{{ Math.min((i + 1) * pageSize, filtered.length) }}
          </option>
        </select>
        <button type="button" :disabled="page >= pageCount - 1" aria-label="次の範囲" @click="page++">→</button>
      </div>
    </div>

    <div class="vocab-actions">
      <div class="vocab-bulk-buttons">
        <button class="vocab-primary" type="button" :disabled="!visible.length || revealedCount === visible.length"
          @click="revealRange">この範囲の訳を表示</button>
        <button type="button" :disabled="revealedCount === 0" @click="revealed = new Set()">訳を隠す</button>
      </div>
      <span class="vocab-revealed" role="status" aria-live="polite">訳を表示 {{ revealedCount }} / {{ visible.length }}</span>
    </div>

    <table v-if="visible.length" id="vocab-table" class="vocab-table">
      <caption class="vocab-sr-only">{{ categoryTitle }} {{ rangeStart }}～{{ rangeEnd }}項目</caption>
      <thead><tr><th scope="col">英単語・熟語</th><th scope="col">日本語訳</th></tr></thead>
      <tbody>
        <tr v-for="entry in visible" :key="entry.id" :data-vocab-id="entry.id">
          <th scope="row">
            <span class="vocab-word-number" :aria-label="`原本の番号 ${entry.id}`">{{ String(entry.id).padStart(3, '0') }}</span>
            <span class="vocab-word" lang="en">{{ entry.english }}</span>
          </th>
          <td>
            <button type="button" class="vocab-answer" :class="{ 'is-revealed': revealed.has(entry.id) }"
              :aria-expanded="revealed.has(entry.id)" :aria-controls="`vocab-answer-${entry.id}`"
              :aria-label="`${entry.english} の訳を${revealed.has(entry.id) ? '隠す' : '見る'}`" @click="toggle(entry.id)">
              <span v-if="!revealed.has(entry.id)" class="vocab-answer-prompt">訳を見る <span aria-hidden="true">＋</span></span>
              <span :id="`vocab-answer-${entry.id}`" class="vocab-meaning" :hidden="!revealed.has(entry.id)">{{ entry.meaning }}</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else id="vocab-table" class="vocab-empty">
      <p>見つかりませんでした。</p>
      <p>別の言葉で探すか、「すべての分類」に切り替えてみましょう。</p>
      <button type="button" @click="query = ''; category = 'all'">すべての単語に戻る</button>
    </div>

    <nav v-if="pageCount > 1" class="vocab-bottom-pagination" aria-label="下部の範囲切り替え">
      <button type="button" :disabled="page === 0" @click="page--">← 前の{{ pageSize }}項目</button>
      <span>{{ page + 1 }} / {{ pageCount }}</span>
      <button type="button" :disabled="page >= pageCount - 1" @click="page++">次の{{ pageSize }}項目 →</button>
    </nav>
    <p class="vocab-footnote">番号は原本と共通です。訳を確認したら、もう一度隠して答えてみよう。</p>
  </section>
</template>

<style scoped>
.vocabulary-study { margin: 28px 0 32px; }
.vocabulary-study button, .vocabulary-study select, .vocabulary-study input { font: inherit; }
.vocabulary-study button, .vocabulary-study select { cursor: pointer; }
.vocabulary-study button { touch-action: manipulation; }
.vocabulary-study :is(button, select, input):focus-visible { outline: 3px solid var(--vp-c-brand-1); outline-offset: 3px; }
.vocabulary-study button:disabled { cursor: default; opacity: .42; }
.vocab-overview { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
.vocab-eyebrow { color: var(--vp-c-brand-1); font-size: 12px; font-weight: 700; letter-spacing: .15em; }
.vocab-total { color: var(--vp-c-text-2); font-size: 14px; }
.vocab-total strong { color: var(--vp-c-text-1); font-size: 25px; font-variant-numeric: tabular-nums; }
.vocab-categories { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 24px; }
.vocab-categories button { display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 12px 14px; text-align: left; font-size: 14px; background: var(--vp-c-bg); color: var(--vp-c-text-2); }
.vocab-categories button span { font-size: 12px; font-variant-numeric: tabular-nums; opacity: .8; }
.vocab-categories button[aria-pressed="true"] { border-color: var(--vp-c-brand-1); background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent); color: var(--vp-c-brand-1); font-weight: 700; }
.vocab-filters { display: flex; gap: 16px; padding-bottom: 24px; border-bottom: 1px solid var(--vp-c-divider); }
.vocab-search { flex: 1; min-width: 0; }
.vocab-filters label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--vp-c-text-2); }
.vocab-search-field { display: flex; align-items: center; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg-soft); }
.vocab-search-field input { width: 100%; min-width: 0; padding: 10px 12px; font-size: 14px; background: transparent; border-radius: 6px; }
.vocab-search-field input::-webkit-search-cancel-button { display: none; }
.vocab-search-field input::placeholder { color: var(--vp-c-text-2); opacity: 1; }
.vocab-clear { padding: 8px; flex-shrink: 0; font-size: 12px !important; color: var(--vp-c-brand-1); }
.vocab-page-size select, .vocab-pagination select { border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg-soft); padding: 10px 12px; font-size: 14px; }
.vocab-range { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 24px 0 16px; }
.vocab-category-title { margin: 0 !important; padding: 0 !important; font-size: 19px; line-height: 1.5; letter-spacing: normal; }
.vocab-status { margin: 4px 0 0 !important; font-size: 13px; color: var(--vp-c-text-2); font-variant-numeric: tabular-nums; }
.vocab-pagination { display: flex; align-items: center; gap: 6px; }
.vocab-pagination button { min-width: 36px; min-height: 42px; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
.vocab-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.vocab-bulk-buttons { display: flex; gap: 8px; }
.vocab-bulk-buttons button, .vocab-empty button { padding: 9px 12px; border: 1px solid var(--vp-c-divider); border-radius: 6px; font-size: 13px; font-weight: 600; }
.vocab-bulk-buttons .vocab-primary { color: var(--vp-button-brand-text); background: var(--vp-c-brand-3); border-color: var(--vp-c-brand-3); }
.vocab-revealed { color: var(--vp-c-text-2); font-size: 12px; font-variant-numeric: tabular-nums; }
.vocab-table { display: table; width: 100%; table-layout: fixed; margin: 0 !important; border-collapse: collapse; font-size: 16px; }
.vocab-table thead th { background: var(--vp-c-bg-soft); padding: 10px 14px; font-size: 12px; font-weight: 600; color: var(--vp-c-text-2); text-align: left; }
.vocab-table th, .vocab-table td { border: 0; border-bottom: 1px solid var(--vp-c-divider); vertical-align: middle; }
.vocab-table thead th:first-child { width: 48%; }
.vocab-table tbody tr { background: transparent; border: 0; }
.vocab-table tbody th { padding: 14px; text-align: left; font-weight: 500; }
.vocab-word-number { display: inline-block; width: 34px; margin-right: 8px; vertical-align: baseline; font-size: 11px; font-weight: 400; color: var(--vp-c-text-2); font-variant-numeric: tabular-nums; }
.vocab-word { font-family: Arial, sans-serif; font-size: 20px; overflow-wrap: anywhere; }
.vocab-table tbody td { padding: 6px 0 6px 8px; }
.vocab-answer { display: block; width: 100%; min-height: 44px; padding: 8px 12px; border-radius: 6px; text-align: left; line-height: 1.7; }
.vocab-answer:not(.is-revealed) { background: var(--vp-c-bg-soft); color: var(--vp-c-brand-1); }
.vocab-answer-prompt { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
.vocab-answer-prompt > span { font-size: 18px; }
.vocab-meaning { color: var(--vp-c-text-1); overflow-wrap: anywhere; }
.vocab-answer:hover { box-shadow: inset 0 0 0 1px var(--vp-c-brand-1); }
.vocab-bottom-pagination { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 20px; font-size: 13px; }
.vocab-bottom-pagination button { min-height: 44px; padding: 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
.vocab-bottom-pagination > span { color: var(--vp-c-text-2); font-variant-numeric: tabular-nums; }
.vocab-footnote { font-size: 12px; color: var(--vp-c-text-2); margin: 16px 0 0 !important; }
.vocab-empty { padding: 32px 16px; background: var(--vp-c-bg-soft); border-radius: 8px; text-align: center; }
.vocab-empty p { font-size: 14px; margin: 0 0 12px; }
.vocab-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 600px) {
  .vocab-filters { gap: 10px; }
  .vocab-search-field input { font-size: 16px; padding: 10px 8px; }
  .vocab-search-field input::placeholder { font-size: 12px; }
  .vocab-page-size select { padding: 10px 6px; }
  .vocab-categories button { padding: 10px; font-size: 12px; }
  .vocab-category-title { font-size: 16px; }
  .vocab-range { gap: 8px; flex-wrap: wrap; }
  .vocab-pagination { gap: 4px; }
  .vocab-pagination button { min-width: 30px; }
  .vocab-pagination select { padding: 10px 6px; font-size: 12px; }
  .vocab-word-number { display: block; margin: 0; line-height: 1.5; }
  .vocab-table tbody th { padding: 12px 8px; }
  .vocab-word { font-size: 19px; }
  .vocab-table thead th:first-child { width: 44%; }
  .vocab-table tbody td { padding-left: 6px; }
  .vocab-answer { font-size: 14px; padding: 8px; }
  .vocab-bulk-buttons button { padding: 9px 10px; font-size: 12px; }
  .vocab-bottom-pagination button { padding: 8px; font-size: 12px; }
}
@media print {
  .vocab-categories, .vocab-filters, .vocab-pagination, .vocab-actions, .vocab-bottom-pagination { display: none; }
  .vocab-answer-prompt { display: none; }
  .vocab-meaning[hidden] { display: inline !important; }
  .vocab-answer { background: transparent !important; padding: 0; }
  .vocab-table tr { break-inside: avoid; }
  .vocab-word { font-size: 13pt; }
}
</style>
