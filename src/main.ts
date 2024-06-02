import './assets/sass/index.scss'
import 'iconify-icon';
import ParameterTable from '@/components/elements/ParameterTable.vue'
import ParameterField from '@/components/elements/ParameterField.vue'
import ParameterDivider from '@/components/elements/ParameterDivider.vue'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App)
  .component('ParameterTable', ParameterTable)
  .component('ParameterField', ParameterField)
  .component('ParameterDivider', ParameterDivider)
  .mount('#app')
