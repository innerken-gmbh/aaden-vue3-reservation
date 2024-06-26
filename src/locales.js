import de from './translations/locales/de.json'
import en from './translations/locales/en.json'
import nl from './translations/locales/nl.json'
import zh from './translations/locales/zh.json'
import dayNl from 'dayjs/locale/nl'
import dayDe from 'dayjs/locale/de'
import dayEn from 'dayjs/locale/en'
import dayZh from 'dayjs/locale/zh'
import {Remember} from "./plugins/plugins.js";


export default {
    locale: Remember.lang,
    fallbackLocale: 'en',
    availableLocales: [
        {
            code: 'de',
            flag: 'de',
            label: 'Deutsch',
            dayJS: dayDe,
            messages: de
        }, {
            code: 'en',
            flag: 'us',
            dayJS: dayEn,
            label: 'English',
            messages: en
        }, {
            code: 'nl',
            flag: 'nl',
            dayJS: dayNl,
            label: 'Nederland',
            messages: nl
        },
        {
            code: 'zh',
            flag: 'cn',
            dayJS: dayZh,
            label: '中文',
            messages: zh
        }
    ]
}

