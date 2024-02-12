import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createPinia} from "pinia";
import {aliases, mdi} from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import calendar from 'dayjs/plugin/calendar'
import isoWeek from 'dayjs/plugin/isoWeek'
import dayjs from "dayjs";
import { createI18n } from 'vue-i18n'
import locales from '../locales'

dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(isoWeek)
dayjs.extend(calendar)
const aadenTheme = {
    dark: true,
    colors: {
        background: '#060606',
        surface: '#30302e',
        'on-surface': '#e8eadd',
        primary: '#e8eadd',
        secondary: '#54a560',
        error: '#e74983',
        info: '#124bbe',
    },
}

const aadenLightTheme = {
    dark: false,
    colors: {
        background: '#f6f6f6',
        surface: '#e8eadd',
        'on-surface': '#30302e',
        primary: '#30302e',
        secondary: '#54a560',
        error: '#e74983',
        info: '#124bbe',
    },
}

export const vuetify = createVuetify({
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
    defaults: {
        VBtn: {
            class: 'font-weight-black text-none'
        },
        VTextField: {
            variant: 'filled'
        }
    },
    components,
    directives,
    theme: {
        variations: {
            colors: ['primary', 'secondary', 'surface'],
            lighten: 5,
            darken: 5,
        },
        defaultTheme: 'aadenTheme',
        themes: {
            aadenTheme,
            aadenLightTheme
        },
    },
})

const {locale, availableLocales, fallbackLocale} = locales

const messages = {}

availableLocales.forEach((l) => {
    messages[l.code] = l.messages
})

export const i18n = createI18n({
    locale,
    fallbackLocale,
    messages,
    globalInjection: true
})

i18n.locales = availableLocales

export const pinia = createPinia()
