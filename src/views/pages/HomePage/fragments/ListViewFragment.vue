<script setup>

import {toOnlyTimeFormat} from "../../../../dataLayer/repository/dateRepo.js";
import {
  ReservationIcon,
  ReservationStatus,
  useReservationStore
} from "../../../../dataLayer/repository/reservationRepo.js";
import {useDisplay} from "vuetify";

const reservationInfo = useReservationStore()
const {smAndUp} = useDisplay()
</script>

<template>
  <div
    class="mt-4"
    style="max-height: calc(100vh - 160px);overflow-y: scroll"
  >
    <div class="d-flex align-center">
      <v-card
        style="width: fit-content"
        class="d-flex mb-2"
        variant="outlined"
      >
        <v-card
          @click="reservationInfo.listViewTab=t"
          :key="t"
          variant="flat"
          :color="reservationInfo.listViewTab===t?'primary':''"
          v-for="t in Object.values(ReservationStatus)"
          class="pa-2 px-4 d-flex align-center"
        >
          <v-icon class="mr-2">
            {{ ReservationIcon[t] }}
          </v-icon>
          <template v-if="smAndUp">
            {{ t }}
          </template>
        </v-card>
      </v-card>
      <v-spacer />
      <v-card

        rounded="pill"
        class="text-body-1 pa-1 px-3"
        color="primary"
      >
        {{ reservationInfo.filteredReservationList.length }}({{ reservationInfo.reservationTotalPersonCount }} P)
      </v-card>
    </div>

    <v-card
      color="grey-darken-3"
      class="pa-3 px-4 mb-2 d-flex align-center"
      v-for="r in reservationInfo.filteredReservationList"
      :key="r.id"
      @click="reservationInfo.showReservationWithId(r.remoteId)"
    >
      <div>
        <div
          :class="r.overTime?'text-error font-weight-black':''"
          class="text-body-2 "
        >
          {{ toOnlyTimeFormat(r.fromDateTime) }} - {{ toOnlyTimeFormat(r.toDateTime) }}
        </div>
        <div
          class="text-h5 mt-1 font-weight-black d-flex align-baseline"
        >
          {{ r.personCount }} <span
            :style="{
              color:r.shareColor
            }"
            class="text-body-1 mr-2 ml-1 font-weight-black"
            v-if="r.totalPerson"
          >/{{ r.totalPerson }} </span> P
          <div class="ml-4">
            {{ r.firstName }} {{ r.lastName }}
          </div>
        </div>
      </div>
      <v-spacer />
      <v-icon
        v-if="r.haveOverlap"
        small
        color="yellow"
        class="ml-2"
      >
        mdi-flash-triangle
      </v-icon>
      <v-icon
        v-if="r.haveShareTable"
        small
        class="ml-2"
      >
        mdi-link-variant
      </v-icon>
      <v-icon
        v-if="r.cancelled==='1'"
        small
        color="primary"
        class="ml-2"
      >
        mdi-cancel
      </v-icon>
      <v-icon
        v-if="r.completed==='1'"
        small
        class="ml-2"
      >
        mdi-check
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
        {{ r.tableNameNull }}
      </div>
    </v-card>
  </div>
</template>

<style scoped>

</style>
