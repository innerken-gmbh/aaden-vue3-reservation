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
      style="max-height: 60vh;overflow-y: scroll"
    >
      <v-card
        @click="confirmTime(t)"
        :color="timePicker.currentTime===t?'primary':'surface'"
        :key="t"
        elevation="0"
        class="px-4 text-body-1 pa-2"
        v-for="t in timePicker.availableTimes"
      >
        {{ t.substring(0, 5) }}
      </v-card>
    </inline-two-row-container>
    <place-holder
      v-else
      :title="'目前没有可用时间'"
    />
  </base-dialog>
</template>

<style scoped>

</style>
