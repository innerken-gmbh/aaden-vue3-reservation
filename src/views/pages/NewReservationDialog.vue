<script setup>

import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";
import FormContainer from "../items/FormContainer.vue";
import {useDatePickerStore, useTimePickerStore} from "../../dataLayer/repository/reservationRepo";
import {checkTableTimeAvailable} from "../../dataLayer/api/reservationApi.js";
import {computed, watchEffect} from "vue";
import {storeToRefs} from "pinia";
import BaseDialog from "../components/BaseDialog.vue";
import {toDateDisplayFormat} from "../../dataLayer/repository/dateRepo.js";
import {useHomePageControllerStore} from "../../dataLayer/repository/homeController.js";
import {userId} from "../../main.js";

const controller = useHomePageControllerStore()
const datePicker = useDatePickerStore()
const timerPicker = useTimePickerStore()

const {personCount, date,} = storeToRefs(controller)
watchEffect(async () => {
  await refreshAvailableTimes()
})

async function refreshAvailableTimes() {
  if (controller.showNewReservationModal) {
    controller.startTime = null
    timerPicker.availableTimes =
        await checkTableTimeAvailable(date.value, personCount.value, userId)
    if (timerPicker.availableTimes.length > 0) {
      controller.startTime = timerPicker.availableTimes[0].startTime
    }
  }

}


async function selectTime() {
  controller.startTime = await timerPicker.selectTime()
  controller.showNewReservationModal = true
}

async function selectData() {
  controller.date = await datePicker.selectDate()
  controller.showNewReservationModal = true
}

const displayPerson = computed(() => {
  return 18
})

</script>

<template>
  <base-dialog v-model="controller.showNewReservationModal">
    <template #header>
      <template v-if="controller.reservationStep===0">
        {{ $t('NewReservation') }}
        <v-spacer />
      </template>
      <template v-else>
        <div>
          {{ controller.personCount }} {{ $t('People') }}
          <div class="text-body-2">
            <span class="font-weight-regular">{{ controller.startTime }}</span>@{{ controller.date }}
          </div>
        </div>
        <v-spacer />
        <v-icon
          size="32"
        >
          mdi-calendar-clock
        </v-icon>
      </template>
    </template>
    <template #default>
      <template v-if="controller.reservationStep===0">
        <div class="text-body-2">
          {{ $t('Guests') }}
          <div
            class="mt-2 text-body-1 font-weight-black"
            style="display: grid;grid-gap: 4px;
              width: 100%;
              grid-template-columns: repeat(auto-fill,36px)"
          >
            <v-card
              @click="controller.personCount=i"
              width="36"
              height="36"
              rounded="pill"
              :key="i"
              :color="controller.personCount===i?'peopleSelectorActiveColor':'peopleSelectorInactiveColor'"
              v-for="i in displayPerson"
              class="d-flex align-center justify-center"
            >
              {{ i }}
            </v-card>
          </div>
        </div>
        <inline-two-row-container class="mt-8">
          <form-container :label="$t('Date')">
            <div
              class="text-h5 font-weight-black d-flex align-center"
              @click="selectData"
            >
              {{ toDateDisplayFormat(controller.date) }}
            </div>
          </form-container>
          <form-container :label="$t('Time')">
            <div
              v-if="timerPicker.availableTimes.length>0"
              class="text-h5 font-weight-black d-flex align-center text-no-wrap"
              @click="selectTime"
            >
              {{ controller?.startTime ?? $t('Checking') }}
            </div>
            <div
              v-else
              class="text-h5 font-weight-black bg-error"
            >
              {{ $t('NotAvailable') }}
            </div>
          </form-container>
        </inline-two-row-container>
      </template>
      <template v-else>
        <inline-two-row-container>
          <form-container :label="$t('FirstName')">
            <v-text-field
              v-model="controller.reservationExtraInfo.firstName"
              placeholder="Max.."
            />
          </form-container>
          <form-container :label="$t('LastName')">
            <v-text-field
              v-model="controller.reservationExtraInfo.lastName"
              placeholder="Mustermann.."
            />
          </form-container>
        </inline-two-row-container>
        <inline-two-row-container>
          <form-container :label="$t('Mail')">
            <v-text-field
              v-model="controller.reservationExtraInfo.email"
              placeholder="Max.mustermann@example.com"
            />
          </form-container>
          <form-container :label="$t('Phone')">
            <v-text-field
              v-model="controller.reservationExtraInfo.tel"
              placeholder="0123-456789"
            />
          </form-container>
        </inline-two-row-container>
        <form-container :label="$t('Note')+'('+$t('optional')+')'">
          <v-textarea
            v-model="controller.reservationExtraInfo.note"
            auto-grow
            :placeholder="$t('ExtraAnnotate')"
          />
        </form-container>
        <v-chip
          @click="controller.reservationExtraInfo.useStroller
            =!controller.reservationExtraInfo.useStroller"
          variant="tonal"
          rounded="sm"
        >
          <template #prepend>
            <v-icon
              class="mr-2"
            >
              <template v-if="controller.reservationExtraInfo.useStroller">
                mdi-checkbox-marked
              </template>
              <template v-else>
                mdi-checkbox-blank-outline
              </template>
            </v-icon>
          </template>

          {{ $t('NeedStroller') }}
        </v-chip>
        <v-sheet
          rounded
          class="mt-4 bg-red pa-4 text-body-2 d-flex align-center"
          v-if="controller.error"
        >
          <v-icon class="mr-2">
            mdi-alert-circle
          </v-icon>
          {{ controller.errorMessage }}
        </v-sheet>
      </template>
    </template>
    <template #action>
      <v-btn
        block
        v-if="controller.reservationStep===1"
        :loading="controller.loading"
        @click="controller.addReservation()"
        size="large"
        :disabled="!controller.readyToSubmit"
        color="primary"
      >
        {{ $t('NewReservation') }}
      </v-btn>
      <v-btn
        v-else
        @click="controller.reservationStep=1"
        size="large"
        block
        color="primary"
        :disabled="!controller.startTime"
      >
        {{ $t('FillUpInformation') }}
        <template #append>
          <v-icon>mdi-arrow-right</v-icon>
        </template>
      </v-btn>
    </template>
  </base-dialog>
</template>

<style scoped>

</style>
