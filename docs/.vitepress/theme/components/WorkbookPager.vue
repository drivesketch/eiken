<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
type Page = { id: string; title: string; hasAnswer: boolean }
const props = defineProps<{ pages: Page[] }>()
const lessons = computed(() => props.pages.filter(p => /^(passage-|lesson-|final-check$)/.test(p.id)))
const guides = computed(() => props.pages.filter(p => !lessons.value.includes(p)))
const selected = ref(lessons.value[0]?.id ?? props.pages[0].id)
const showAll = ref(false)
const answerOpen = ref(false)
const index = computed(() => lessons.value.findIndex(p => p.id === selected.value))
const previous = computed(() => index.value > 0 ? lessons.value[index.value - 1] : undefined)
const next = computed(() => lessons.value[index.value + 1])
const lessonLabel = computed(() => lessons.value[0]?.id.startsWith('passage-') ? 'Passage' : 'Lesson')
const shortTitle = (page: Page) => page.title.replace(/^(Passage|Lesson) \d+ — /, '')
const guideLabel = (page: Page) => page.title.includes('使い方') ? '使い方' : page.title.includes('見取り図') ? '学習の見取り図' : '進め方'
const controls = ref<HTMLElement>()
function syncHash() {
  const hash = decodeURIComponent(location.hash.slice(1))
  const target = document.getElementById(hash)
  const container = target?.closest('[data-workbook-page]') as HTMLElement | null
  const page = props.pages.find(p => hash === p.id || hash.startsWith(p.id + '-'))
    ?? props.pages.find(p => p.id === container?.dataset.workbookPage)
  if (page) { selected.value = page.id; answerOpen.value = hash.endsWith('-answer') || !!target?.closest('.workbook-answer') }
}
async function choose(id: string) {
  showAll.value = false
  selected.value = id
  answerOpen.value = false
  history.replaceState(null, '', '#' + id)
  await nextTick()
  controls.value?.scrollIntoView({ block: 'start' })
}
onMounted(() => { syncHash(); window.addEventListener('hashchange', syncHash) })
onBeforeUnmount(() => window.removeEventListener('hashchange', syncHash))
</script>

<template>
  <div class="workbook-pager">
    <nav ref="controls" class="workbook-controls" aria-label="学習する課を選ぶ">
      <div class="workbook-utilities">
        <div class="workbook-guides">
          <button v-for="page in guides" :key="page.id" type="button" :aria-pressed="!showAll && selected === page.id" @click="choose(page.id)">{{ guideLabel(page) }}</button>
        </div>
        <button type="button" class="workbook-view-toggle" :aria-pressed="showAll" @click="showAll = !showAll">{{ showAll ? '1課ずつ読む' : '全体を読む・印刷' }}</button>
      </div>
      <div class="workbook-lessons" role="group" :aria-label="lessonLabel + 'を選ぶ'">
        <span class="workbook-lesson-label">{{ lessonLabel }}</span>
        <button v-for="page in lessons" :key="page.id" type="button" :title="page.title" :aria-label="page.title" :aria-pressed="!showAll && selected === page.id" @click="choose(page.id)">{{ page.id === 'final-check' ? 'まとめ' : page.id.split('-')[1] }}</button>
      </div>
      <span class="workbook-sr-only" role="status">{{ showAll ? '全体表示' : pages.find(p => p.id === selected)?.title }}</span>
    </nav>
    <section v-for="page in pages" v-show="showAll || selected === page.id" :key="page.id" :aria-label="page.title" :data-workbook-page="page.id">
      <slot :name="page.id" />
      <details v-if="page.hasAnswer" :key="page.id + selected" :open="answerOpen" class="workbook-answer">
        <summary>解答例・説明を見る</summary>
        <slot :name="page.id + '-answer'" />
      </details>
    </section>
    <nav v-if="!showAll && (previous || next)" class="workbook-bottom" aria-label="前後の課へ移動">
      <button v-if="previous" type="button" class="workbook-previous" @click="choose(previous.id)"><span>← 前の課</span><strong>{{ shortTitle(previous) }}</strong></button>
      <button v-if="next" type="button" class="workbook-next" @click="choose(next.id)"><span>{{ index < 0 ? '練習を始める' : '次の課' }} →</span><strong>{{ shortTitle(next) }}</strong></button>
    </nav>
  </div>
</template>

<style scoped>
.workbook-controls { scroll-margin-top: 90px; margin: 24px 0 28px; padding-bottom: 20px; border-bottom: 1px solid var(--vp-c-divider); }
button { font: inherit; cursor: pointer; touch-action: manipulation; }
button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; }
.workbook-utilities { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 20px; margin-bottom: 12px; font-size: 13px; color: var(--vp-c-text-2); }
.workbook-guides { display: flex; flex-wrap: wrap; gap: 16px; }
.workbook-utilities button { min-height: 36px; text-align: left; }
.workbook-utilities button:hover, .workbook-utilities button[aria-pressed="true"] { color: var(--vp-c-brand-1); text-decoration: underline; text-underline-offset: 5px; }
.workbook-view-toggle { margin-left: auto; }
.workbook-lessons { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.workbook-lesson-label { margin-right: 4px; font-size: 13px; color: var(--vp-c-text-2); }
.workbook-lessons button { min-width: 42px; min-height: 42px; padding: 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 7px; color: var(--vp-c-text-1); background: var(--vp-c-bg); font-size: 15px; line-height: 24px; font-variant-numeric: tabular-nums; }
.workbook-lessons button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.workbook-lessons button[aria-pressed="true"] { border-color: var(--vp-c-brand-1); color: var(--vp-c-bg); background: var(--vp-c-brand-1); font-weight: 700; }
.workbook-answer { margin: 32px 0; padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; }
.workbook-answer summary { cursor: pointer; font-weight: 600; }
.workbook-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 36px 0; padding-top: 20px; border-top: 1px solid var(--vp-c-divider); }
.workbook-bottom button { display: flex; flex-direction: column; gap: 4px; min-width: 0; text-align: left; color: var(--vp-c-brand-1); }
.workbook-bottom span { font-size: 12px; color: var(--vp-c-text-2); }
.workbook-bottom strong { font-size: 15px; font-weight: 500; line-height: 1.6; }
.workbook-bottom button:hover strong { text-decoration: underline; text-underline-offset: 4px; }
.workbook-next { grid-column: 2; align-items: flex-end; text-align: right !important; }
.workbook-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 480px) {
  .workbook-guides { gap: 12px; }
  .workbook-lessons { gap: 6px; }
  .workbook-lesson-label { flex-basis: 100%; margin-bottom: 2px; }
}
@media print { .workbook-controls, .workbook-bottom { display: none; } }
</style>
