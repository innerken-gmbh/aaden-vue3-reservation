<script setup>
import {useRoomPickerStore, useTimePickerStore} from "../../../../dataLayer/repository/reservationRepo.js";
import {useHomePageControllerStore} from "../../../../dataLayer/repository/homeController.js";
import {priceDisplay} from "../../../../dataLayer/api/reservationApi.js";

const props = defineProps(['roomWithTimeInfo'])
const roomPicker = useRoomPickerStore()

</script>

<template>
  <v-card
      class="pa-2"
    @click="roomPicker.selectRoom(roomWithTimeInfo)"
      variant="outlined"
    flat
  >
    <div class="d-flex align-center">
      <div class="text-body-1">
        {{ roomWithTimeInfo.room.tableName }}
      </div>
    </div>
    <div class="d-flex flex-column">
      <div class="text-body-2 d-flex align-center">
        <v-icon class="mr-4">mdi-human-male-female</v-icon>
        <v-spacer></v-spacer>
        <span
          class="font-weight-black"
        >{{ roomWithTimeInfo.room.seatCount }}</span>
      </div>
    </div>
  </v-card>
</template>

<style scoped>

</style>
