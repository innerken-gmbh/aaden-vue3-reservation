<script setup>
import HomePage from './views/pages/HomePage.vue';
import {useHomePageControllerStore, useScanQrStore} from "./dataLayer/repository/reservationRepo";
import GlobalDatePicker from "./views/dialogs/GlobalDatePicker.vue";
import GlobalTimePicker from "./views/dialogs/GlobalTimePicker.vue";
import ScanQRDialog from "./views/dialogs/ScanQRDialog.vue";
import ReservationDetailDialog from "./views/dialogs/ReservationDetailDialog.vue";

const homeController = useHomePageControllerStore()
const qrController = useScanQrStore()
</script>

<template>
  <v-app>
    <v-app-bar
      flat
    >
      <v-app-bar-nav-icon />
      <div class="flex-grow-1">
        <v-text-field
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
