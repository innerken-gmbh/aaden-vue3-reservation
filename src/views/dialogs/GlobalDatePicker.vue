<script setup>
import {useDatePickerStore} from "../../dataLayer/repository/reservationRepo.js";
import {dateFormat, today} from "../../dataLayer/repository/dateRepo.js";
import dayjs from "dayjs";
import BaseDialog from "../components/BaseDialog.vue";
import {useDisplay} from "vuetify";

const dateStore = useDatePickerStore()
const {xs} = useDisplay()
function confirm() {
  dateStore.confirm()
}

</script>

<template>
  <v-dialog
    :fullscreen="xs"
    v-model="dateStore.showPicker"
    max-width="500px"
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
  </v-dialog>
</template>

<style scoped>

</style>
