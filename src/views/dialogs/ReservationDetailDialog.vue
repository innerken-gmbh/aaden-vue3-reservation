<script setup>
import {
  getReservationColor,
  ReservationStatus,
  useReservationStore
} from "../../dataLayer/repository/reservationRepo.js";
import {computed} from "vue";
import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";
import {toDateFormat, toOnlyTimeFormat} from "../../dataLayer/repository/dateRepo.js";
import BaseDialog from "../components/BaseDialog.vue";

const controller = useReservationStore()

const info = computed(() => {
  return controller.activeReservation
})

const canEdit = computed(() => {
  return info.value?.completed !== '1' && info.value?.cancelled !== '1'
})

const status = computed(() => {
  if (info.value?.completed === '1') {
    return ReservationStatus.Complete
  } else if (info.value?.cancelled === '1') {
    return ReservationStatus.Cancelled
  } else {
    return ReservationStatus.Normal
  }
})
const color = computed(() => {
  return getReservationColor(info.value)
})

async function onConfirm() {
  await controller.checkIn(info.value?.id)
  controller.showDetailDialog = false
}

async function onCancel() {
  await controller.cancel(info.value?.id)
  controller.showDetailDialog = false
}

</script>

<template>
  <base-dialog
    :header-color="color"
    :show-action="canEdit"
    v-model="controller.showDetailDialog"
  >
    <template #header>
      <div>
        <div>
          Reservation
        </div>
        <div class="text-body-2">
          #{{ controller.activeReservationId }}
        </div>
      </div>
      <v-spacer />
      <div class="text-body-1">
        {{ status }}
      </div>
    </template>
    <template v-if="info">
      <inline-two-row-container>
        <div class="text-h5 font-weight-black">
          <div class="text-body-2">
            {{ info.title || 'Mr/Mrs' }}
          </div>
          <div>
            {{ info.firstName }} {{ info.lastName }}
          </div>
        </div>
        <div class="text-h5 font-weight-black">
          <div class="text-body-2">
            {{ toDateFormat(info.fromDateTime) }}
          </div>
          <div class="text-no-wrap">
            {{ toOnlyTimeFormat(info.fromDateTime) }}
            <span class="text-body-2">
              to
              {{ toOnlyTimeFormat(info.toDateTime) }}
            </span>
          </div>
        </div>
      </inline-two-row-container>
      <inline-two-row-container class="mt-4">
        <div class="text-h5 font-weight-black">
          <div class="text-body-2">
            Table
          </div>
          <div>
            {{ info.tableNameNull }}
          </div>
        </div>
        <div class="text-h5 font-weight-black">
          <div class="text-body-2">
            Need stroller
          </div>
          <div>
            {{ info.useStroller === '1' ? 'Yes' : 'No' }}
          </div>
        </div>
      </inline-two-row-container>
      <div
        v-if="info.email"
        class="text-h5 font-weight-black mt-4"
      >
        <div class="text-body-2">
          Email
        </div>
        <div>
          {{ info.email }}
        </div>
      </div>
      <div
        v-if="info.tel"
        class="text-h5 font-weight-black mt-4"
      >
        <div class="text-body-2">
          Tel
        </div>
        <div>
          {{ info.tel }}
        </div>
      </div>
      <div
        v-if="info.note"
        class="text-h5 font-weight-black mt-4"
      >
        <div class="text-body-2">
          Note
        </div>
        <div>
          {{ info.note }}
        </div>
      </div>
    </template>
    <template #action>
      <v-btn
        @click="onCancel"
        :loading="controller.loading"
        color="primary"
        variant="outlined"
      >
        <template #prepend>
          <v-icon>mdi-cancel</v-icon>
        </template>
        Cancel
      </v-btn>
      <v-btn
        :loading="controller.loading"
        @click="onConfirm"
        color="primary"
        class="mt-2"
      >
        <template #prepend>
          <v-icon>mdi-check</v-icon>
        </template>
        Check in
      </v-btn>
    </template>
  </base-dialog>
</template>

<style scoped>

</style>
