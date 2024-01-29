import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {pinia, vuetify} from "./plugins/plugins.js";
import VueDraggableResizable from 'vue-draggable-resizable'
import hillo from "hillo";
import VueDragscroll from "vue-dragscroll";
import './styles/main.scss';

hillo.initial('http://ik0001.ngrok.aaden.io/PHP/')
createApp(App)
    .use(vuetify)
    .use(VueDragscroll)
    .use(pinia)
    .component("vue-draggable-resizable", VueDraggableResizable)
    .mount('#app')
