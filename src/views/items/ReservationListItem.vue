<script setup>

import {ReservationStatus} from "../../dataLayer/repository/reservationDisplay.js";
import {toOnlyTimeFormat} from "../../dataLayer/repository/dateRepo.js";
import {useReservationStore} from "../../dataLayer/repository/reservationRepo.js";
import {useDisplay} from "vuetify";

const reservationInfo = useReservationStore()
defineProps({info: Object})
const {mdAndUp}=useDisplay()
</script>

<template>
  <v-card
    color="surface-lighten-1"
    class="pa-3 px-4 mb-2 text-body-1"
    @click="reservationInfo.showReservationWithId(info.id)"
  >
    <div class="d-flex align-center">
      <div
        class="text-body-1 mt-1 font-weight-black d-flex align-baseline"
      >
        {{ info.personCount }}P
        <div class="ml-2 text-body-2 font-weight-black">
          {{ info.firstName }} {{ info.lastName }}
        </div>
      </div>

      <v-spacer />
      <div
        v-if="mdAndUp"
        class="mr-4 text-body-2 font-weight-black"
      >
        Tel: {{ info.tel }}
      </div>
      <div
        style="display: grid;grid-auto-flow: column;grid-gap: 8px;width: fit-content"
        class="text-body-2"
      >
        <div
          class="font-weight-black"
        >
          <v-icon>
            mdi-map-marker
          </v-icon>
          {{ info.tableName }}
        </div>
        <v-icon
          v-if="info.haveShareTable"
        >
          mdi-link-variant
        </v-icon>
        <v-icon
          v-if="info.status===ReservationStatus.CheckIn"
        >
          mdi-check
        </v-icon>
        <v-icon
          v-if="info.status===ReservationStatus.Cancelled"
        >
          mdi-cancel
        </v-icon>
        <v-icon
          v-if="info.haveOverlap"
          color="yellow"
        >
          mdi-alert
        </v-icon>

        <div
          :class="info.overTime?'bg-error px-1 rounded':''"
          class="text-body-2 d-flex align-center"
        >
          to {{ toOnlyTimeFormat(info.toDateTime) }}
        </div>
      </div>
    </div>

    <div
      v-if="info.note"
      class="mt-2  d-flex align-center font-weight-regular text-caption"
    >
      <v-icon
        class="mr-2"
      >
        mdi-text
      </v-icon>
      {{ info.note }}
    </div>
  </v-card>
</template>

<style scoped>

</style>
