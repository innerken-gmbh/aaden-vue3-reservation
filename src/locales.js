import de from './translations/locales/de.json'
import en from './translations/locales/en.json'
import nl from './translations/locales/nl.json'

const supported = ['en', 'de', 'nl']
let locale = 'en'

try {
    const {0: browserLang} = navigator.language.split('-')

    if (supported.includes(browserLang)) {
        locale = localStorage.getItem('locale') ?? browserLang
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
            messages: de
        }, {
            code: 'en',
            flag: 'us',
            label: 'English',
            messages: en
        }, {
            code: 'nl',
            flag: 'nl',
            label: 'Nederland',
            messages: nl
        },
    ]
}

