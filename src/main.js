import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {pinia, vuetify} from "./plugins/plugins.js";
import VueDraggableResizable from 'vue-draggable-resizable'
import hillo from "hillo";


hillo.initial('http://192.168.1.178/PHP/')
createApp(App)
    .use(vuetify)
    .use(pinia)
    .component("vue-draggable-resizable", VueDraggableResizable)
    .mount('#app')
