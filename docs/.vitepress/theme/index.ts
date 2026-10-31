import DefaultTheme from 'vitepress/theme'
import './custom.css'

import WorkbookPager from './components/WorkbookPager.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) { app.component('WorkbookPager', WorkbookPager) }
}
