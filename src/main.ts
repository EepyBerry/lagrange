import './assets/sass/index.scss'
import 'iconify-icon';
import ParameterTable from '@/components/elements/ParameterTable.vue'
import ParameterField from '@/components/elements/ParameterField.vue'
import ParameterDivider from '@/components/elements/ParameterDivider.vue'

import { createApp } from 'vue'
import App from './App.vue'
import SidebarSection from './components/elements/SidebarSection.vue';
import OverlaySpinner from './components/elements/OverlaySpinner.vue';

createApp(App)
  .component('SidebarSection', SidebarSection)
  .component('ParameterTable', ParameterTable)
  .component('ParameterField', ParameterField)
  .component('ParameterDivider', ParameterDivider)
  .component('OverlaySpinner', OverlaySpinner)
  .mount('#app')
