import './assets/sass/index.scss'
import 'iconify-icon';

import { createApp } from 'vue'
import App from './App.vue'
import router from './router.config';
import SidebarSection from '@/components/elements/SidebarSection.vue';
import OverlaySpinner from '@/components/elements/OverlaySpinner.vue';
import ParameterTable from '@/components/elements/ParameterTable.vue'
import ParameterField from '@/components/parameters/ParameterField.vue'
import ParameterRadio from '@/components/parameters/ParameterRadio.vue';
import ParameterRadioOption from '@/components/parameters/ParameterRadioOption.vue';
import ParameterDivider from '@/components/parameters/ParameterDivider.vue'
import ParameterColorRamp from './components/parameters/ParameterColorRamp.vue';
import ParameterColor from './components/parameters/ParameterColor.vue';
import { createHead } from '@unhead/vue';

createApp(App)
  .use(router)
  .use(createHead())
  .component('SidebarSection', SidebarSection)
  .component('ParameterTable', ParameterTable)
  .component('ParameterField', ParameterField)
  .component('ParameterRadio', ParameterRadio)
  .component('ParameterRadioOption', ParameterRadioOption)
  .component('ParameterColor', ParameterColor)
  .component('ParameterColorRamp', ParameterColorRamp)
  .component('ParameterDivider', ParameterDivider)
  .component('OverlaySpinner', OverlaySpinner)
  .mount('#app')
