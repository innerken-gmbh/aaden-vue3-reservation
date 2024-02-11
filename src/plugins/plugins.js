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
import {createI18n} from "vue-i18n";

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
        },
    },
})
export const i18n = createI18n({
    // something vue-i18n options here ...
})

export const pinia = createPinia()
