<script setup>

import {toOnlyTimeFormat} from "../../../../dataLayer/repository/dateRepo.js";
import {
  ReservationIcon,
  ReservationStatus,
  useReservationStore
} from "../../../../dataLayer/repository/reservationRepo.js";
import {useDisplay} from "vuetify";
import PlaceHolder from "../../../components/PlaceHolder.vue";

const reservationInfo = useReservationStore()
const {smAndUp} = useDisplay()
</script>

<template>
  <div
    class="mt-4"
    style="max-height: calc(100dvh - 160px);overflow-y: scroll"
  >
    <div
      class="d-flex align-center mb-2"
      v-if="!reservationInfo.search"
    >
      <v-card
        style="width: fit-content"
        class="d-flex"
        variant="outlined"
      >
        <v-card
          @click="reservationInfo.listViewTab=t"
          :key="t"
          rounded="0"
          :variant="reservationInfo.listViewTab===t?'flat':'outlined'"
          :color="reservationInfo.listViewTab===t?'primary':''"
          v-for="t in Object.values(ReservationStatus)"
          class="pa-1 px-3 d-flex align-center text-body-2"
        >
          <v-icon
            size="18"
            :class="smAndUp?'mr-2':''"
          >
            {{ ReservationIcon[t] }}
          </v-icon>
          <template v-if="smAndUp">
            {{ $t(t) }}
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
    <template v-if="reservationInfo.filteredReservationList.length > 0">
      <v-card
        color="surface"
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
          v-if="r.status===ReservationStatus.CheckIn"
          small
          class="ml-2"
        >
          mdi-check
        </v-icon>
        <v-icon
          v-if="r.status===ReservationStatus.Cancelled"
          small
          class="ml-2"
        >
          mdi-cancel
        </v-icon>
        <v-icon
          v-if="r.haveOverlap"
          small
          color="yellow"
          class="ml-2"
        >
          mdi-alert
        </v-icon>
        <v-icon
          v-if="r.haveShareTable"
          small
          :color="r.shareColor"
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
          {{ r.tableNameNull }}
        </div>
      </v-card>
    </template>

    <place-holder
      icon="mdi-noodles"
      :hint="$t('NoReservationsATM')"
      v-else
    />
  </div>
</template>

<style scoped>

</style>
