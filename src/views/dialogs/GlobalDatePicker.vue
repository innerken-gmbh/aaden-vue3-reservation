<script setup>
import {useDatePickerStore} from "../../dataLayer/repository/reservationRepo.js";
import {dateFormat, today} from "../../dataLayer/repository/dateRepo.js";
import dayjs from "dayjs";
import BaseDialog from "../components/BaseDialog.vue";

const dateStore = useDatePickerStore()

function confirm() {
  dateStore.confirm()
}

</script>

<template>
  <base-dialog
    v-model="dateStore.showPicker"
  >
    <v-card rounded="xl">
      <v-date-picker
        color="primary"
        :min="today()"
        :max="dayjs(today()).add(14,'days')
          .format(dateFormat)"
        v-model="dateStore.currentDate"
      />
      <v-btn
        @click="confirm"
        color="primary"
        size="large"
      >
        {{ $t('OK') }}
      </v-btn>
    </v-card>
  </base-dialog>
</template>

<style scoped>

</style>
