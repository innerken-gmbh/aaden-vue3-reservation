<script setup>
import {useDatePickerStore} from "../../dataLayer/repository/reservationRepo.js";
import {dateFormat, today} from "../../dataLayer/repository/dateRepo.js";
import dayjs from "dayjs";
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
    <v-card
      width="100%"
    >
      <v-date-picker
        width="100%"
        color="primary"
        :min="today()"
        v-model="dateStore.currentDate"
      />
      <v-spacer />
      <div>
        <v-btn
          block
          @click="confirm"
          color="primary"
          size="large"
        >
          {{ $t('OK') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
