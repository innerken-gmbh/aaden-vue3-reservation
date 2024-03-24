<script setup>
import {useTimePickerStore} from "../../dataLayer/repository/reservationRepo.js";
import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";
import BaseDialog from "../components/BaseDialog.vue";
import PlaceHolder from "../components/PlaceHolder.vue";

const timePicker = useTimePickerStore()

function confirmTime(time) {
  timePicker.currentTime = time
  timePicker.confirm()
}
</script>

<template>
  <base-dialog
    v-model="timePicker.showPicker"
  >
    <template #header>
      {{ $t('SelectPreferredTime') }}
    </template>
    <inline-two-row-container
      v-if="timePicker.availableTimes.length>0"
      style="max-height: 60dvh;overflow-y: scroll"
    >
      <v-card
        @click="confirmTime(t.startTime)"
        :color="timePicker.currentTime===t?'primary':'surface'"
        :key="t"
        elevation="0"
        class="px-4 text-body-1 pa-2 d-flex"
        v-for="t in timePicker.availableTimes"
      >
        <div class="font-weight-black">
          {{ t.startTime }}
        </div>

        <v-spacer />
        <div class="text-body-2">
          ⌛{{ t.eatingTimeMinute }}m
        </div>
      </v-card>
    </inline-two-row-container>
    <place-holder
      v-else
      :title="$t('CurrentlyNoAppointmentsAvailable')"
    />
  </base-dialog>
</template>

<style scoped>

</style>
