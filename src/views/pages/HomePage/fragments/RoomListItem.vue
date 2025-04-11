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
    rounded="lg"
    flat
  >
    <div class="d-flex align-center">
      <div class="text-body-1">
        {{ roomWithTimeInfo.room.tableName }}
      </div>
    </div>
    <div class="d-flex flex-column">
      <div class="text-body-2 ">
        <span
          class="text-green-darken-2 font-weight-black"
        >{{ priceDisplay(roomWithTimeInfo.room.pricePer15Min * 4) }}</span>/小时
      </div>
      <div class="text-body-2">
        最低消费 {{
          priceDisplay(roomWithTimeInfo.room.minConsumePrice)
        }}
      </div>
    </div>
  </v-card>
</template>

<style scoped>

</style>
