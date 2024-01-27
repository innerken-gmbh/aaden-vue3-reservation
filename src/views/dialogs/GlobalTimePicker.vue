<script setup>
import {useTimePickerStore} from "../../dataLayer/repository/reservationRepo.js";
import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";

const timePicker = useTimePickerStore()
</script>

<template>
  <v-dialog
    v-model="timePicker.showPicker"
    max-width="500px"
  >
    <v-card>
      <div class="text-h4 pa-4 font-weight-black">
        Select the Time
      </div>
      <inline-two-row-container
        style="max-height: 40vh;overflow-y: scroll"
        class="pa-4"
      >
        <v-card
          @click="timePicker.currentTime=t"
          :color="timePicker.currentTime===t?'white':'grey-darken-3'"
          :key="t"
          class="px-4 text-body-1 pa-2"
          v-for="t in timePicker.availableTimes"
        >
          {{ t }}
        </v-card>
      </inline-two-row-container>

      <v-btn
        class="mt-4"
        size="large"
        @click="timePicker.confirm()"
        color="white"
      >
        OK
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
