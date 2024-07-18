import {defineStore} from "pinia";
import {Remember} from "../../plugins/plugins.js";

export const useThemeStore = defineStore('theme', {
    state: () => ({
        currentTheme: Remember.themMode
    }),
    actions: {
        toggleTheme() {

            this.currentTheme = !this.currentTheme
            Remember.themMode = this.currentTheme
            console.log(Remember.themMode)
        }
    },
    getters: {
        themeName() {
            return this.currentTheme ? 'aadenTheme' : 'aadenLightTheme'
        }
    }

})
