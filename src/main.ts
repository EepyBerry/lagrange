import './assets/sass/index.scss'
import 'iconify-icon';

import { createApp } from 'vue'
import App from './App.vue'
import SidebarSection from '@/components/elements/SidebarSection.vue';
import OverlaySpinner from '@/components/elements/OverlaySpinner.vue';
import ParameterTable from '@/components/elements/ParameterTable.vue'
import ParameterField from '@/components/elements/ParameterField.vue'
import ParameterRadio from '@/components/elements/ParameterRadio.vue';
import ParameterRadioOption from '@/components/elements/ParameterRadioOption.vue';
import ParameterDivider from '@/components/elements/ParameterDivider.vue'

createApp(App)
  .component('SidebarSection', SidebarSection)
  .component('ParameterTable', ParameterTable)
  .component('ParameterField', ParameterField)
  .component('ParameterRadio', ParameterRadio)
  .component('ParameterRadioOption', ParameterRadioOption)
  .component('ParameterDivider', ParameterDivider)
  .component('OverlaySpinner', OverlaySpinner)
  .mount('#app')
