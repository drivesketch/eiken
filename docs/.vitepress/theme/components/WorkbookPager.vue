<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
type Page = { id: string; title: string; hasAnswer: boolean }
const props = defineProps<{ pages: Page[] }>()
const selected = ref(props.pages[0].id)
const showAll = ref(false)
const answerOpen = ref(false)
const index = computed(() => props.pages.findIndex(p => p.id === selected.value))
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
      <label>表示する内容
        <select :value="selected" :disabled="showAll" @change="choose(($event.target as HTMLSelectElement).value)">
          <option v-for="page in pages" :key="page.id" :value="page.id">{{ page.title }}</option>
        </select>
      </label>
      <div class="workbook-navigation">
        <button :disabled="showAll || index === 0" @click="choose(pages[index - 1].id)">← 前へ</button>
        <span aria-live="polite">{{ showAll ? '全体表示' : `${index + 1} / ${pages.length}` }}</span>
        <button :disabled="showAll || index === pages.length - 1" @click="choose(pages[index + 1].id)">次へ →</button>
      </div>
      <label class="workbook-all"><input v-model="showAll" type="checkbox"> 全体を表示（まとめて読む・印刷する）</label>
    </nav>
    <section v-for="page in pages" v-show="showAll || selected === page.id" :key="page.id" :aria-label="page.title" :data-workbook-page="page.id">
      <slot :name="page.id" />
      <details v-if="page.hasAnswer" :key="page.id + selected" :open="answerOpen" class="workbook-answer">
        <summary>解答例・説明を見る</summary>
        <slot :name="page.id + '-answer'" />
      </details>
    </section>
    <nav v-if="!showAll" class="workbook-navigation workbook-bottom" aria-label="前後の課へ移動">
      <button :disabled="index === 0" @click="choose(pages[index - 1].id)">← 前へ</button>
      <button :disabled="index === pages.length - 1" @click="choose(pages[index + 1].id)">次へ →</button>
    </nav>
  </div>
</template>

<style scoped>
.workbook-controls { scroll-margin-top: 90px; margin: 24px 0; padding: 20px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); }
.workbook-controls > label:first-child { display: grid; gap: 8px; font-size: 15px; }
select { width: 100%; min-width: 0; padding: 10px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font: inherit; }
.workbook-navigation { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; font-size: 15px; }
button { padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); color: var(--vp-c-brand-1); font: inherit; cursor: pointer; }
button:disabled { opacity: .4; cursor: default; }
button:focus-visible, select:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.workbook-all { display: flex; gap: 8px; align-items: center; margin-top: 16px; font-size: 13px; }
.workbook-answer { margin: 32px 0; padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; }
.workbook-answer summary { cursor: pointer; font-weight: 600; }
.workbook-bottom { margin: 32px 0; }
@media print { .workbook-controls, .workbook-bottom { display: none; } }
</style>
