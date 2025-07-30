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



const id = IKUtils.getQueryString("userId")
const keywords = IKUtils.getQueryString("Key")

function decryptCode(code) {
    let originalStr = '';
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const charCode = char.charCodeAt(0) - 65; // 0-25
        // 反向计算数字值
        const digit = (charCode - i * 3 + 26) % 26;
        originalStr += digit.toString();
    }

    // 去除前导0并转为数字
    return parseInt(originalStr);
}

export function getDeviceId() {
    if (id) {
        return id
    }
    if (keywords) {
        return decryptCode(keywords)
    }
    return 1
}

export const userId = getDeviceId()
dayjs.locale(Remember.lang)

createApp(App)
    .use(vuetify)
    .use(i18n)
    .use(VueDragscroll)
    .use(pinia)
    .component("vue-draggable-resizable", VueDraggableResizable)
    .mount('#app')
