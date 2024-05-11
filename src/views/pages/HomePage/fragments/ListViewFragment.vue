<script setup>

import {useReservationStore} from "../../../../dataLayer/repository/reservationRepo.js";
import PlaceHolder from "../../../components/PlaceHolder.vue";
import ReservationListItem from "../../../items/ReservationListItem.vue";
import {toOnlyTimeFormat} from "../../../../dataLayer/repository/dateRepo.js";
import {sortBy} from "lodash-es";

const reservationInfo = useReservationStore()

</script>

<template>
  <div
    class="mt-4  pb-16"
    style="overflow-y: scroll"
  >
    <div
      class="d-flex align-center mb-2"
      v-if="!reservationInfo.search"
    >
      <v-tabs
        v-model="reservationInfo.listViewTab"
      >
        <v-tab @click="reservationInfo.listViewTab=0">
          <v-icon
            start
          >
            mdi-view-list
          </v-icon>
          <div>
            {{ reservationInfo.listSorted[0].length }}
          </div>
        </v-tab>
        <v-tab @click="reservationInfo.listViewTab=1">
          <v-icon
            start
            v-if="reservationInfo.listSorted[1].length>0"
          >
            mdi-bell-badge-outline
          </v-icon>
          <v-icon
            start
            v-else
          >
            mdi-bell-outline
          </v-icon>
          {{ reservationInfo.listSorted[1].length }}
        </v-tab>
        <v-tab @click="reservationInfo.listViewTab=2">
          <v-icon start>
            mdi-dots-horizontal
          </v-icon>
          {{ reservationInfo.listSorted[2].length }}
        </v-tab>
      </v-tabs>
    </div>
    <div class="fullScreen">
      <template v-if="reservationInfo.filteredReservationList.length > 0">
        <template
          :key="time"
          v-for="time in sortBy(Object.keys(reservationInfo.groupedReservations))"
        >
          <div class="text-h5 mt-4 mb-1 px-2 font-weight-black">
            {{ toOnlyTimeFormat(time) }}
          </div>

          <reservation-list-item
            v-for="r in reservationInfo.groupedReservations[time]"
            :key="r.id"
            :info="r"
          />
        </template>
      </template>
      <place-holder
        icon="mdi-noodles"
        :hint="$t('NoReservationsATM')"
        v-else
      />
    </div>
  </div>
</template>

<style scoped>
.fullScreen{
  height:calc(100vh - 300px);
  height: calc(100dvh - 276px);
}
</style>
