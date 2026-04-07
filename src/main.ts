import './assets/sass/index.scss';
import 'iconify-icon';
import OverlaySpinner from '@components/global/elements/OverlaySpinner.vue';
import ParameterCategory from '@components/global/parameters/ParameterCategory.vue';
import ParameterCheckbox from '@components/global/parameters/ParameterCheckbox.vue';
import ParameterColor from '@components/global/parameters/ParameterColor.vue';
import ParameterColorRamp from '@components/global/parameters/ParameterColorRamp.vue';
import ParameterDivider from '@components/global/parameters/ParameterDivider.vue';
import ParameterGrid from '@components/global/parameters/ParameterGrid.vue';
import ParameterGroup from '@components/global/parameters/ParameterGroup.vue';
import ParameterRadio from '@components/global/parameters/ParameterRadio.vue';
import ParameterRadioOption from '@components/global/parameters/ParameterRadioOption.vue';
import ParameterSlider from '@components/global/parameters/ParameterSlider.vue';
import { createHead } from '@unhead/vue/client';
import { createApp } from 'vue';
import App from './App.vue';
import * as i18nConfig from './i18n.config';
import router from './router.config';

createApp(App)
  .use(router)
  .use(i18nConfig.i18n)
  .use(createHead())
  .component('ParameterSlider', ParameterSlider)
  .component('ParameterRadio', ParameterRadio)
  .component('ParameterRadioOption', ParameterRadioOption)
  .component('ParameterColor', ParameterColor)
  .component('ParameterColorRamp', ParameterColorRamp)
  .component('ParameterDivider', ParameterDivider)
  .component('ParameterCategory', ParameterCategory)
  .component('ParameterCheckbox', ParameterCheckbox)
  .component('ParameterGroup', ParameterGroup)
  .component('ParameterGrid', ParameterGrid)
  .component('OverlaySpinner', OverlaySpinner)
  .mount('#app');
