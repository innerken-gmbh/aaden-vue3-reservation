import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {i18n, pinia, vuetify} from "./plugins/plugins.js";
import VueDraggableResizable from 'vue-draggable-resizable'
import hillo from "hillo";
import VueDragscroll from "vue-dragscroll";

hillo.initial('http://ik9002.ngrok.aaden.io/PHP/')
createApp(App)
    .use(vuetify)
    .use(VueDragscroll)
    .use(pinia)
    .component("vue-draggable-resizable", VueDraggableResizable)
    .mount('#app')
