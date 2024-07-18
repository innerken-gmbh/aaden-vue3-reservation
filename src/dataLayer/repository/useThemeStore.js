import {defineStore} from "pinia";

export const useThemeStore = defineStore('theme', {
    state: () => ({
        currentTheme: true
    }),
    actions: {
        toggleTheme() {
            this.currentTheme = !this.currentTheme

        }
    },
    getters: {
        themeName() {
            return this.currentTheme ? 'aadenTheme' : 'aadenLightTheme'
        }
    }

})
