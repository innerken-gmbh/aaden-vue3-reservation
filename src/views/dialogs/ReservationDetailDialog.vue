<script setup>
import {useReservationStore} from "../../dataLayer/repository/reservationRepo.js";
import {computed} from "vue";
import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";
import {toDateFormat, toOnlyTimeFormat} from "../../dataLayer/repository/dateRepo.js";

const controller = useReservationStore()

const info = computed(() => {
  return controller.activeReservation
})

const status = computed(() => {
  if (info.value?.completed === '1') {
    return 'checkedIn'
  } else if (info.value?.cancelled === '1') {
    return 'cancelled'
  } else {
    return 'aktiv'
  }
})

async function onConfirm() {
  await controller.checkIn(info.value?.id)
  controller.showDetailDialog = false
}

</script>

<template>
  <v-dialog
    v-model="controller.showDetailDialog"
    max-width="500px"
  >
    <v-card class="pa-6">
      <div class="text-h4 d-flex align-center font-weight-black">
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
      </div>
      <v-card
        class="mt-4"
        v-if="info"
      >
        <inline-two-row-container>
          <div class="text-h5 font-weight-black">
            <div class="text-body-2">
              {{ info.title || 'kein Anrede' }}
            </div>
            <div>
              {{ info.firstName }} {{ info.lastName }}
            </div>
          </div>
          <div class="text-h5 font-weight-black">
            <div class="text-body-2">
              {{ toDateFormat(info.fromDateTime) }}
            </div>
            <div>
              {{ toOnlyTimeFormat(info.fromDateTime) }}
              to
              {{ toOnlyTimeFormat(info.toDateTime) }}
            </div>
          </div>
        </inline-two-row-container>
        <inline-two-row-container class="mt-4">
          <div class="text-h5 font-weight-black">
            <div class="text-body-2">
              Table name
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
        <div class="d-flex mt-8">
          <v-btn
            @click="onConfirm"
            v-if="info.completed!=='1'"
            color="white"
            class="mr-2 flex-grow-1"
          >
            <template #prepend>
              <v-icon>mdi-check</v-icon>
            </template>
            Check in
          </v-btn>
          <v-btn
            v-if="info.cancelled!=='1'"
            color="white"
            class="mr-2"
          >
            <template #prepend>
              <v-icon>mdi-cancel</v-icon>
            </template>
            Cancel
          </v-btn>
        </div>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
