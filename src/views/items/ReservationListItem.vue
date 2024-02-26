<script setup>

import {ReservationStatus} from "../../dataLayer/repository/reservationDisplay.js";
import {toOnlyTimeFormat} from "../../dataLayer/repository/dateRepo.js";
import {useReservationStore} from "../../dataLayer/repository/reservationRepo.js";

const reservationInfo = useReservationStore()
defineProps({info: Object})
</script>

<template>
  <v-card
    color="surface"
    class="pa-3 px-4 mb-2 d-flex align-center"
    @click="reservationInfo.showReservationWithId(info.id)"
  >
    <div>
      <div
        :class="info.overTime?'text-error font-weight-black':''"
        class="text-body-2 "
      >
        {{ toOnlyTimeFormat(info.fromDateTime) }} - {{ toOnlyTimeFormat(info.toDateTime) }}
      </div>
      <div
        class="text-h5 mt-1 font-weight-black d-flex align-baseline"
      >
        {{ info.personCount }} <span
          :style="{
            color:info.shareColor
          }"
          class="text-body-1 mr-2 ml-1 font-weight-black"
          v-if="info.totalPerson"
        >/{{ info.totalPerson }} </span> P
        <div class="ml-4">
          {{ info.firstName }} {{ info.lastName }}
        </div>
      </div>
    </div>
    <v-spacer />
    <v-icon
      v-if="info.status===ReservationStatus.CheckIn"
      small
      class="ml-2"
    >
      mdi-check
    </v-icon>
    <v-icon
      v-if="info.status===ReservationStatus.Cancelled"
      small
      class="ml-2"
    >
      mdi-cancel
    </v-icon>
    <v-icon
      v-if="info.haveOverlap"
      small
      color="yellow"
      class="ml-2"
    >
      mdi-alert
    </v-icon>
    <v-icon
      v-if="info.haveShareTable"
      small
      :color="info.shareColor"
      class="ml-2"
    >
      mdi-link-variant
    </v-icon>
    <div
      class="text-h5 font-weight-black d-flex align-baseline ml-2"
    >
      <v-icon
        class="mr-2"
        size="24"
      >
        mdi-map-marker
      </v-icon>
      {{ info.tableName }}
    </div>
  </v-card>
</template>

<style scoped>

</style>
