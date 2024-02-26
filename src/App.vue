<script setup>
import HomePage from './views/pages/HomePage/HomePage.vue';
import {useReservationStore, useScanQrStore} from "./dataLayer/repository/reservationRepo";
import GlobalDatePicker from "./views/dialogs/GlobalDatePicker.vue";
import GlobalTimePicker from "./views/dialogs/GlobalTimePicker.vue";
import ScanQRDialog from "./views/dialogs/ScanQRDialog.vue";
import ReservationDetailDialog from "./views/dialogs/ReservationDetailDialog.vue";
import {useThemeStore} from "./dataLayer/repository/useThemeStore.js";
import {useTheme} from "vuetify";
import {useHomePageControllerStore} from "./dataLayer/repository/homeController.js";

const homeController = useHomePageControllerStore()
const qrController = useScanQrStore()
const reservationStore = useReservationStore()
const theme = useThemeStore()
const vuetifyTheme = useTheme()

function toggleTheme() {
  theme.toggleTheme()
  vuetifyTheme.global.name.value = theme.themeName
}


</script>

<template>
  <v-app>
    <v-app-bar
      flat
      color="appBarColor"
    >
      <v-app-bar-title>
        <v-text-field
          v-model="reservationStore.search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          flat
          :placeholder="$t('SearchHere')"
          density="compact"
          clearable
          hide-details
        />
      </v-app-bar-title>
      <v-btn
        @click="toggleTheme()"
        icon=""
      >
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
      <v-btn
        @click="homeController.showNewModal()"
        icon=""
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        @click="qrController.scanQR()"
        icon=""
      >
        <v-icon>mdi-qrcode-scan</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <div
        style="width: 100%;height: 100%;"
        class="bg-appBarColor pt-2"
      >
        <div
          style="border-top-left-radius: 24px;z-index: 2;overflow: visible;min-height: calc(100svh - 72px);
          border-top-right-radius: 24px;"
          class="bg-surface"
        >
          <home-page />
        </div>
      </div>

      <scan-q-r-dialog />
      <global-date-picker />
      <global-time-picker />
      <reservation-detail-dialog />
    </v-main>
  </v-app>
</template>

<style scoped>
</style>
<style>
::-webkit-scrollbar {
  display: none;
}

body {
  user-select: none;
}
</style>
