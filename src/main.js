import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {pinia, Remember, vuetify} from "./plugins/plugins.js";
import VueDraggableResizable from 'vue-draggable-resizable'
import VueDragscroll from "vue-dragscroll";
import './styles/main.scss';
import IKUtils from "innerken-js-utils";
import dayjs from "dayjs";
import {i18n} from "./plugins/i18n.js";



const id = IKUtils.getQueryString("userId") || 1
console.log(id, 'id')
export const userId = parseInt(id)
dayjs.locale(Remember.lang)

createApp(App)
    .use(vuetify)
    .use(i18n)
    .use(VueDragscroll)
    .use(pinia)
    .component("vue-draggable-resizable", VueDraggableResizable)
    .mount('#app')
