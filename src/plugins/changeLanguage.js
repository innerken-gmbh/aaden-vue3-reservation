
import dayjs from "dayjs";
import {Remember} from "./plugins.js";
import {i18n} from "./i18n.js";

export function changeLanguage(locale) {
    try {
        i18n.global.locale = locale
        Remember.lang = locale
        dayjs.locale(locale)
    } catch (e) {
        console.log(e)
    }
}
