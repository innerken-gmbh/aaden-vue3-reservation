import de from './translations/locales/de.json'
import en from './translations/locales/en.json'
import nl from './translations/locales/nl.json'
import dayNl from 'dayjs/locale/nl'
import dayDe from 'dayjs/locale/de'
import dayEn from 'dayjs/locale/en'
import dayjs from 'dayjs'
const supported = ['en', 'de', 'nl']
let locale = 'en'

try {
    const {0: browserLang} = navigator.language.split('-')

    if (supported.includes(browserLang)) {
        locale = localStorage.getItem('locale') ?? browserLang
        dayjs.locale(locale)
    }
} catch (e) {
    console.log(e)
}
export default {
    locale,
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
    ]
}

