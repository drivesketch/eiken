import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ja-JP',
  title: '英語の練習帳',
  description: '音読・質問・英文の組み替えで、基本の英語を自然に。',
  // GitHub Actions supplies the actual Pages base path. Local previews use /.
  base: process.env.PAGES_BASE_PATH || '/',
  head: [['meta', { name: 'robots', content: 'noindex, nofollow' }]],
  themeConfig: {
    nav: [{ text: '教材一覧', link: '/' }, { text: '5級の復習', link: '/grade5-review' }],
    sidebar: [{ text: '教材', items: [
      { text: 'この練習帳について', link: '/' },
      { text: '5級 基本文型・語法の復習', link: '/grade5-review' }
    ] }],
    outline: { level: [2, 2], label: 'このページの目次' },
    search: { provider: 'local' },
    docFooter: { prev: '前の教材', next: '次の教材' },
    sidebarMenuLabel: '教材を選ぶ',
    darkModeSwitchLabel: '表示テーマ',
    returnToTopLabel: 'ページの先頭へ'
  }
})
