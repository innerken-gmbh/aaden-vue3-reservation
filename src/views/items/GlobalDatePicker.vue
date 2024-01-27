<script setup>
import {useDatePickerStore} from "../../dataLayer/repository/reservationRepo";
import {dateFormat, today} from "../../dataLayer/repository/dateRepo.js";
import dayjs from "dayjs";

const dateStore = useDatePickerStore()

function confirm() {
  dateStore.confirm()
}

</script>

<template>
  <v-dialog
    v-model="dateStore.showPicker"
    width="fit-content"
  >
    <v-card>
      <v-date-picker
        color="white"
        :min="today()"
        :max="dayjs(today()).add(14,'days').format(dateFormat)"
        v-model="dateStore.currentDate"
      />
      <v-btn
        @click="confirm"
        color="white"
        size="large"
      >
        OK
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
