import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {i18n, pinia, vuetify} from "./plugins/plugins.js";
import VueDraggableResizable from 'vue-draggable-resizable'
import VueDragscroll from "vue-dragscroll";
import './styles/main.scss';
import IKUtils from "innerken-js-utils";

const endLanguage = ['en', 'de', 'nl']
export let endLocale = ''
if (!endLanguage.includes(i18n.locale)) {
    endLocale = 'en'
} else {
    endLocale = i18n.locale
}
const id = IKUtils.getQueryString("userId")||1
console.log(id,'id')
export const userId = parseInt(id)


createApp(App)
    .use(vuetify)
    .use(i18n)
    .use(VueDragscroll)
    .use(pinia)
    .component("vue-draggable-resizable", VueDraggableResizable)
    .mount('#app')
