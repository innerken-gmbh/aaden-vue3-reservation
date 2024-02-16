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
import {createI18n} from 'vue-i18n'
import locales from '../locales'

dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(isoWeek)
dayjs.extend(calendar)
const aadenTheme = {
    dark: true,
    colors: {
        background: '#132438',// 060606
        surface: '#30302e',// 30302e
        'on-surface': '#e8eadd',// e8eadd,eff4f0
        primary: '#e8eadd',// e8eadd,f9f6ef,e5e5e5
        secondary: '#54a560',// 54a560,0bbo4a,21bf73
        error: '#e74983',// e74983
        info: '#124bbe',// 124bbe
        cardGradientStart: '#136da8',
        cardGradientEnd: '#edf4f9',
        cardOverTimeColor: 'red-darken-3',
        cardCheckedInColor: 'green-darken-3',
        cardOverlapColor: 'yellow-darken-3',
        cardCancelledColor: 'transparent',
        gridOverlayColor: '#ffffff',
        gridStripeColor: '#9cc0d7',
        currentTimeMarkerColor:'#000000',
        peopleSelectorInactiveColor:'#000000',//#000000,
        peopleSelectorActiveColor:'#000000',//#000000,
        appBarColor:'#000000'
    },
}

const aadenLightTheme = {
    dark: false,
    colors: {
        background: '#d6e3ff',// #f6f6f6,#313742,#bacfe2,#9cc0d7,左边栏的颜色
        surface: '#ffffff',// #e8eadd,#ccd0cf,#eff4f0,#f6f2e4,#fcf9f7,#f6f4fa,#edf4f9，底色,#ffffff
        'on-surface': '#221534',// #30302e,#dbb2b3,#121315,#1b1c1d，字体颜色#2b638b
        primary: '#d7e3f1',// #30302e,#e8dcd2,#f6f4fa,#dad8e5,#edf4f9,#d7e3f1,最上面,#415f91,#3d619b
        'on-primary':'#1b1c1d', //#1b1c1d，方框箭头的颜色
        secondary: '#54a560',// #54a560
        error: '#e74983',// #e74983
        info: '#124bbe',// #124bbe,
        cardGradientStart: '#edf4f9',// #123456,时间条的颜色前面的颜色,#183561,#d6e3ff,#d7e3f1,#aac7ff,#d6e3ff
        cardGradientEnd: '#d6e3ff',// #edf4f9,时间条的颜色
        cardOverTimeColor: '#E74983',//red-darken-3,#，晚点的颜色
        cardCheckedInColor: 'green-darken-3',// green-darken-3,
        cardOverlapColor: 'yellow-darken-3',// yellow-darken-3,
        cardCancelledColor: 'transparent',// transparent,
        gridOverlayColor: '#edf4f9',// #ffffff,网线底色
        gridStripeColor: '#9cc0d7',// #9cc0d7,
        currentTimeMarkerColor:'#000000',//#000000,
        peopleSelectorInactiveColor:'#000000',//#000000,
        peopleSelectorActiveColor:'#000000',//#000000,
        appBarColor:'#000000'
    },
}
const mainTheme = 'aadenLightTheme'
//const mainTheme='aadenTheme'

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
            class: 'font-weight-black text-none elevation-0'
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
        defaultTheme: mainTheme,
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
    messages
})

i18n.locales = availableLocales

export const pinia = createPinia()
