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
import logo from './assets/calendar.png'
import NotificationsDialog from "./views/dialogs/NotificationsDialog.vue";
import PlaceHolder from "./views/components/PlaceHolder.vue";
import {onMounted} from "vue";

const homeController = useHomePageControllerStore()
const qrController = useScanQrStore()
const reservationStore = useReservationStore()
const theme = useThemeStore()
const vuetifyTheme = useTheme()
onMounted(()=>{
  homeController.getUserInfo()
})
function toggleTheme() {
  theme.toggleTheme()
  vuetifyTheme.global.name.value = theme.themeName
}
</script>

<template>
  <v-app>
    <template v-if="homeController.userInfo">
      <v-app-bar
        flat
        color="appBarColor"
      >
        <template v-if="!reservationStore.showSearch">
          <v-app-bar-nav-icon>
            <v-img
              :width="24"
              :src="logo"
            />
          </v-app-bar-nav-icon>
          <v-app-bar-title>
            Aaden POS
          </v-app-bar-title>
        </template>
        <template v-else>
          <v-app-bar-title>
            <v-text-field
              autofocus
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
        </template>

        <template v-if="!reservationStore.showSearch">
          <v-btn
            @click="toggleTheme()"
            icon=""
          >
            <v-icon>mdi-theme-light-dark</v-icon>
          </v-btn>
          <v-btn
            @click="reservationStore.showSearch=true"
            icon=""
          >
            <v-icon>mdi-magnify</v-icon>
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
        </template>
        <template v-else>
          <v-btn
            @click="reservationStore.showSearch=false"
            icon=""
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
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
        <notifications-dialog />
        <scan-q-r-dialog />
        <global-date-picker />
        <global-time-picker />
        <reservation-detail-dialog />
      </v-main>
    </template>
    <template v-else>
      <place-holder
        :title="$t('UserNotFound')"
        :hint="$t('MaybeTheLinkIsBroken')"
      >
        <v-btn class="mt-4">
          {{ $t('Refresh') }}
        </v-btn>
      </place-holder>
    </template>
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
