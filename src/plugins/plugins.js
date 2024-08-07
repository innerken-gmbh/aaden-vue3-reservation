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
import IKUtils from "innerken-js-utils";
import {LocalSettingManager} from "biewangle";

dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(isoWeek)
dayjs.extend(calendar)
export const deviceId = IKUtils.getQueryString('Base') || '0001'
const aadenTheme = {
    dark: true,
    colors: {
        background: '#0a1c30',//#060606,#0a1c30,#132438
        surface: '#35333e',// #30302e
        'on-surface': '#ffffff',// #e8eadd,#eff4f0
        primary: '#ffffff',// #e8eadd,#f9f6ef,#e5e5e5
        'on-primary': '#1b1c1d',
        secondary: '#51c293',// #54a560,#0bbo4a,#21bf73
        error: '#e74983',// e74983
        info: '#124bbe',// 124bbe
        cardGradientStart: '#a7a7a7',//#afc0da,#3c3c4b,#afc0da,dba7a2,#c1b9de,#e9cec6
        cardGradientEnd: '#2e303e',//'#132438,#3b606f,#475268,#5d486e,#2d2d2d

        cardOverTimeColor: 'indigo',//#d13873,#7a339e, 89cffd,#b766b5
        cardCheckedInColor: '#69a794',//196429,84dfff,#69a794
        cardOverlapColor: '#eb7695',//#7a339e,#93000a,#590212
        cardCancelledColor: '#ffffff00',//#cbcbcb,#2e303d
        gridOverlayColor: '#000000',
        gridStripeColor: '#000000',
        currentTimeMarkerColor: '#ffffff',
        peopleSelectorInactiveColor: '#ffffff',//#000000,
        peopleSelectorActiveColor: '#9cc0d7',//#000000,
        appBarColor: '#ffffff',
        cardNormalColor: '#ffffff',
    },
}
const aadenLightTheme = {
    dark: false,
    colors: {
        background: '#ffffff',//左边栏的颜色， #f6f6f6,#313742,#bacfe2,#9cc0d7
        surface: '#edf4f9',//底色 #e8eadd,#ccd0cf,#eff4f0,#f6f2e4,#fcf9f7//#f6f4fa,#edf4f9
        'on-surface': '#000000',//字体颜色 #30302e,#dbb2b3,#121315,#1b1c1d，#2b638b
        primary: '#ffffff',//'#b4c5ff #30302e,#e8dcd2,#f6f4fa,#dad8e5
        'on-primary': '#221534', //方框箭头的颜色#1b1c1d,#e7eaff,#b4c5ff,#124bbe,#221534
        secondary: '#51c293',// #54a560,#51c293
        error: '#d13873',// #e74983,#d13873(选一个)
        info: '#ffffff',// #124bbe,#2b5bce
        cardGradientStart: '#f5fbfa',//#ecc2b9,时间条颜色#2e3c67 #123456,#183561//#d6e3ff,#d7e3f1,#aac7ff,#d6e3ff
        cardGradientEnd: '#a4b7d7',//#553d79,时间条颜色 #edf4f9,
        cardOverTimeColor: '#b766b5',//red-darken-3，#5a2277#8154f4晚点的颜色,#e94e15，#ffb4ab，#ffdad5
        cardCheckedInColor: '#69a794',// green-darken-3,来的颜色,#62948d,#69a794
        cardOverlapColor: '#eb7695',// yellow-darken-3,重叠的颜色,#eebf63,#ecbc41,#ffd400
        //#ebc300,#d6ebe7,fffc9d
        cardCancelledColor: '#cbcbcb',// transparent,#44615f
        gridOverlayColor: '#edf4f9',//网线底色 #ffffff,,#edf4f9
        gridStripeColor: '#e0e0e0',//网线色 #9cc0d7,
        currentTimeMarkerColor: '#000000',//#000000,#364eb0
        peopleSelectorInactiveColor: '#f6f4fa',//#000000,
        peopleSelectorActiveColor: '#9cc0d7',//#000000,
        appBarColor: '#d7e3f1',//最上面#d7e3f1
        cardNormalColor: '#ffffff',
    },
}

export const linkColors = [//在这里添加颜色
    'green-darken-3',
    'red-darken-3',
    'pink-darken-3',
    'yellow-darken-3',
    'blue-darken-3',
    'white-darken-3',
    'indigo-darken-3',
    'purple-darken-3',
    //,#f94892,#89cffd,#00e0ff,#284fee,#03658e,#d4f513,#89ec56,#ffa98c,#f272f4,,#b62522
]

//const mainTheme = 'aadenLightTheme'
const mainTheme = 'aadenTheme'
export const Remember = LocalSettingManager.config({lang: "de", themMode: true})


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
        defaultTheme: Remember.themMode?'aadenTheme':'aadenLightTheme',
        themes: {
            aadenTheme,
            aadenLightTheme,
        },
    },
})


export const pinia = createPinia()

