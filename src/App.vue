<script setup>
import HomePage from './views/pages/HomePage.vue';
import {useHomePageControllerStore, useReservationStore, useScanQrStore} from "./dataLayer/repository/reservationRepo";
import GlobalDatePicker from "./views/dialogs/GlobalDatePicker.vue";
import GlobalTimePicker from "./views/dialogs/GlobalTimePicker.vue";
import ScanQRDialog from "./views/dialogs/ScanQRDialog.vue";
import ReservationDetailDialog from "./views/dialogs/ReservationDetailDialog.vue";
import image from './assets/calendar.png'
import {useDisplay} from "vuetify";

const homeController = useHomePageControllerStore()
const qrController = useScanQrStore()
const reservationStore = useReservationStore()
const {smAndUp} = useDisplay()
</script>

<template>
  <v-app>
    <v-app-bar
      flat
    >
      <div class="px-6 d-flex align-center flex-grow-1">
        <v-img
          class="mr-4 flex-grow-0"
          width="24"
          :src="image"
        />
        <div
          class="text-body-2"
          v-if="smAndUp"
        >
          <span class="font-weight-black">Aaden</span> POS
          <div class="text-caption mt-n1">
            v0.0.2
          </div>
        </div>
        <v-text-field
          v-model="reservationStore.search"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
        />
      </div>
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
      <home-page />
    </v-main>
    <scan-q-r-dialog />
    <global-date-picker />
    <global-time-picker />
    <reservation-detail-dialog />
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
