<script setup>
import {useTimePickerStore} from "../../dataLayer/repository/reservationRepo.js";
import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";

const timePicker = useTimePickerStore()

function confirmTime(time) {
  timePicker.currentTime = time
  timePicker.confirm()
}
</script>

<template>
  <v-dialog
    v-model="timePicker.showPicker"
    max-width="500px"
  >
    <v-card class="pa-6">
      <div class="text-h4 font-weight-black">
        Select the Time
      </div>
      <inline-two-row-container
        style="max-height: 40vh;overflow-y: scroll"
        class="mt-8"
      >
        <v-card
          @click="confirmTime(t)"
          :color="timePicker.currentTime===t?'primary':'grey-darken-3'"
          :key="t"
          class="px-4 text-body-1 pa-2"
          v-for="t in timePicker.availableTimes"
        >
          {{ t }}
        </v-card>
      </inline-two-row-container>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
