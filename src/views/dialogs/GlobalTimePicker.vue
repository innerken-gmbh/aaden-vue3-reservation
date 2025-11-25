<script setup>
import {useTimePickerStore} from "../../dataLayer/repository/reservationRepo.js";
import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";
import BaseDialog from "../components/BaseDialog.vue";
import PlaceHolder from "../components/PlaceHolder.vue";
import {useHomePageControllerStore} from "../../dataLayer/repository/homeController.js";

const timePicker = useTimePickerStore()

function confirmTime(time) {
  let timeValue = time;
  let shouldAdd24 = false;

  // Check if the time value contains a date part in parentheses (MM-DD)
  if (timeValue.includes('(')) {
    // Extract just the time part before the parenthesis
    timeValue = timeValue.split('(')[0].trim();
    // Since it has a date part, it's for the next day, so we need to add 24 to hours
    shouldAdd24 = true;
  }

  const [hours, minutes] = timeValue.split(':').map(Number);
  // If it's for the next day, add 24 to hours before subtracting the offset
  const adjustedHours = shouldAdd24 ? hours + 24 : hours;
  const newHours = (adjustedHours - (useHomePageControllerStore().userInfo.setting.businessHourOffset || 0)) % 24
  timePicker.currentTime = time
  useHomePageControllerStore().originStartTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
  console.log(useHomePageControllerStore().originStartTime, 'originStartTime1')
  timePicker.confirm()
}
</script>

<template>
  <base-dialog
    v-model="timePicker.showPicker"
  >
    <template #header>
      {{ $t('SelectPreferredTime') }}
      <v-spacer />
    </template>
    <inline-two-row-container
      v-if="timePicker.availableTimes.length>0"
      style="max-height: 60vh;overflow-y: scroll"
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
