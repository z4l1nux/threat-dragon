import 'mutationobserver-shim';
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faEdit,
    faPlus,
    faTimes,
    faFileAlt,
    faSignInAlt,
    faSignOutAlt,
    faSave,
    faFile,
    faTrash,
    faUpload,
    faDownload,
    faFilePdf,
    faCaretUp,
    faCaretDown,
    faExclamationTriangle,
    faCheck,
    faRobot
} from '@fortawesome/free-solid-svg-icons';

import App from './App.vue';
import i18nFactory from './i18n/index.js';
import router from './router/index.js';
import storeFactory from './store/index.js';

import './plugins/bootstrap-vue.js';
import './plugins/fontawesome-vue.js';
import './plugins/toastification.js';

Vue.config.productionTip = false;

library.add(
    faEdit,
    faPlus,
    faTimes,
    faFileAlt,
    faSignInAlt,
    faSignOutAlt,
    faSave,
    faFile,
    faTrash,
    faUpload,
    faDownload,
    faFilePdf,
    faCaretUp,
    faCaretDown,
    faExclamationTriangle,
    faCheck,
    faRobot
);

new Vue({
    router: router.get(),
    store: storeFactory.get(),
    render: h => h(App),
    i18n: i18nFactory.get()
}).$mount('#app');
