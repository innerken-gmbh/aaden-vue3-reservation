import {createI18n} from "vue-i18n";
import locales from "../locales.js";

const {
    locale, availableLocales,
    fallbackLocale
} = locales

export const messages = {}

availableLocales
    .forEach((l) => {
    messages[l.code] = l.messages
})

export const i18n = createI18n({
    locale,
    fallbackLocale,
    messages
})


