<script setup>

import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";
import FormContainer from "../items/FormContainer.vue";
import {
  useDatePickerStore,
  useHomePageControllerStore,
  useTimePickerStore
} from "../../dataLayer/repository/reservationRepo";
import {checkTableTimeAvailable} from "../../dataLayer/api/reservationApi.js";
import {watchEffect} from "vue";
import {storeToRefs} from "pinia";

const controller = useHomePageControllerStore()
const datePicker = useDatePickerStore()
const timerPicker = useTimePickerStore()

const {personCount, date} = storeToRefs(controller)
watchEffect(async () => {
  controller.startTime = null
  timerPicker.availableTimes = await checkTableTimeAvailable(date.value,
      '00:00', personCount.value, 1)
})

</script>

<template>
  <v-dialog
    persistent
    max-width="500"
    v-model="controller.showNewReservationModal"
  >
    <v-card class="pa-6 py-8">
      <template v-if="controller.reservationStep===0">
        <div class="text-h5 font-weight-black d-flex align-center">
          Create a new reservation
          <v-spacer />
          <v-icon
            @click="controller.showNewReservationModal=false"
            size="32"
          >
            mdi-close
          </v-icon>
        </div>
        <div class="text-body-1 mt-12">
          <div class="d-flex align-end">
            <div class="text-body-2">
              Person amount
              <div class="text-h4 font-weight-black">
                {{ controller.personCount }}
              </div>
            </div>
            <v-spacer />
            <v-btn
              flat
              @click="controller.minusPerson()"
              icon="mdi-minus"
              :rounded="0"
              class="bg-grey-darken-4"
            />
            <v-btn
              flat
              @click="controller.personCount++"
              icon="mdi-plus"
              :rounded="0"
              class="bg-grey-darken-3"
            />
          </div>
          <inline-two-row-container class="mt-8">
            <form-container label="Date">
              <div
                class="text-h5 font-weight-black d-flex align-center"
                @click="async ()=>controller.date=await datePicker.selectDate()"
              >
                {{ controller.date }}
                <v-spacer />
                <v-icon
                  size="24"
                  icon="mdi-arrow-right"
                />
              </div>
            </form-container>
            <form-container label="Time">
              <div
                class="text-h5 font-weight-black d-flex align-center"
                @click="async ()=>controller.startTime=await timerPicker.selectTime()"
              >
                {{ controller.startTime ?? 'Select a time' }}
                <v-spacer />
                <v-icon
                  size="24"
                  class="mr-4"
                  icon="mdi-arrow-right"
                />
              </div>
            </form-container>
          </inline-two-row-container>
        </div>
        <v-btn
          @click="controller.reservationStep=1"
          size="large"
          color="white"
          :disabled="!controller.startTime"
          class="mt-8"
        >
          Fill Detailed Information
          <template #append>
            <v-icon>mdi-arrow-right</v-icon>
          </template>
        </v-btn>
      </template>
      <template v-else-if="controller.reservationStep===1">
        <div class="text-h5 font-weight-black d-flex align-center">
          <div>
            {{ controller.personCount }} People
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
        </div>
        <div class="text-body-1 mt-12">
          <inline-two-row-container>
            <form-container label="First Name">
              <v-text-field
                v-model="controller.reservationExtraInfo.firstName"
                placeholder="Max.."
              />
            </form-container>
            <form-container label="Last Name">
              <v-text-field
                v-model="controller.reservationExtraInfo.lastName"
                placeholder="Mustermann.."
              />
            </form-container>
          </inline-two-row-container>
          <inline-two-row-container>
            <form-container label="Email">
              <v-text-field
                v-model="controller.reservationExtraInfo.email"
                placeholder="Max.mustermann@example.com"
              />
            </form-container>
            <form-container label="Tel">
              <v-text-field
                v-model="controller.reservationExtraInfo.tel"
                placeholder="0123-456789"
              />
            </form-container>
          </inline-two-row-container>
          <form-container label="Note">
            <v-textarea
              v-model="controller.reservationExtraInfo.note"
              auto-grow
              placeholder="Note about extra wishes"
            />
          </form-container>
          <v-chip
            @click="controller.reservationExtraInfo.useStroller=!controller.reservationExtraInfo.useStroller"
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

            Need Stroller
          </v-chip>
        </div>

        <v-btn
          :loading="controller.loading"
          @click="controller.addReservation()"
          size="large"
          color="white"
          class="mt-4"
        >
          Create Reservation
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
