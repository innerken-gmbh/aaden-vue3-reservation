<script setup>
import {useNotificationStore} from "../../dataLayer/repository/homeController.js";
import {useReservationStore} from "../../dataLayer/repository/reservationRepo.js";
import {toBeautiful} from "../../dataLayer/repository/dateRepo.js";

defineProps({info: Object})
const controller = useNotificationStore()
const infoController = useReservationStore()
</script>

<template>
  <v-card
    elevation="0"
    color="surface-lighten-1"
    class="pa-4 mb-2"
  >
    <div class="d-flex align-start">
      <div>
        <div class="text-body-2">
          {{ toBeautiful(info.createdAt) }}
        </div>

        <div class="text-body-1 font-weight-black">
          {{ $t(info.eventType) }}
        </div>


        <div class="text-body-2">
          {{ $t(info.createdUser) }}
        </div>
        <div class="text-body-2">
          {{ info.note }}
        </div>
      </div>
      <v-spacer />
    </div>
    <div class="mt-2 d-flex">
      <v-spacer />
      <v-btn
        class="mr-2"
        density="default"
        @click="infoController.showReservationWithId(info.reference)"
        icon=""
        v-if="info.reference&&!infoController.showDetailDialog"
      >
        <v-icon>mdi-open-in-app</v-icon>
      </v-btn>
      <v-btn
        density="default"
        @click="controller.readNotification(info)"
        icon=""
        v-if="!info.checked"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>

</style>
