import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {deviceId, pinia, vuetify} from "./plugins/plugins.js";
import VueDraggableResizable from 'vue-draggable-resizable'
import hillo from "hillo";
import VueDragscroll from "vue-dragscroll";
import './styles/main.scss';
import {i18n} from "./plugins/plugins.js";
const endLanguage = ['en', 'de', 'nl']
export let endLocale = ''
if (!endLanguage.includes(i18n.locale)) {
    endLocale = 'en'
} else {
    endLocale = i18n.locale
}




createApp(App)
    .use(vuetify)
    .use(i18n)
    .use(VueDragscroll)
    .use(pinia)
    .component("vue-draggable-resizable", VueDraggableResizable)
    .mount('#app')
