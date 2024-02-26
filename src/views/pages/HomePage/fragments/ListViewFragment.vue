<script setup>

import {useReservationStore} from "../../../../dataLayer/repository/reservationRepo.js";
import PlaceHolder from "../../../components/PlaceHolder.vue";
import ReservationListItem from "../../../items/ReservationListItem.vue";

const reservationInfo = useReservationStore()
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
      <v-tabs
        v-model="reservationInfo.listViewTab"
      >
        <v-tab :value="0">
          <v-icon
            start
          >
            mdi-view-list
          </v-icon>
          <div>
            {{ reservationInfo.listSorted[0].length }}
          </div>
        </v-tab>
        <v-tab :value="1">
          <v-icon start>
            mdi-bell-badge-outline
          </v-icon>
          {{ reservationInfo.listSorted[1].length }}
        </v-tab>
        <v-tab :value="2">
          <v-icon start>
            mdi-dots-horizontal
          </v-icon>
          {{ reservationInfo.listSorted[2].length }}
        </v-tab>
      </v-tabs>
    </div>
    <template v-if="reservationInfo.filteredReservationList.length > 0">
      <reservation-list-item
        v-for="r in reservationInfo.filteredReservationList"
        :key="r.id"
        :info="r"
      />
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
