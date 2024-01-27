<script setup>

import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";
import FormContainer from "../items/FormContainer.vue";
import {useDatePickerStore, useHomePageControllerStore} from "../../dataLayer/repository/reservationRepo";

const controller = useHomePageControllerStore()
const datePicker = useDatePickerStore()
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
            <form-container label="Time">
              <div
                class="text-h5 font-weight-black d-flex align-center"
                @click="async ()=>controller.date=await datePicker.selectDate()"
              >
                {{ controller.startTime }}
                <v-spacer />
                <v-icon
                  size="24"
                  class="mr-4"
                  icon="mdi-arrow-right"
                />
              </div>
            </form-container>
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
          </inline-two-row-container>
        </div>
        <v-btn
          @click="controller.reservationStep=1"
          size="large"
          color="white"
          class="mt-8"
        >
          Check Available Slots
        </v-btn>
      </template>
      <template v-else-if="controller.reservationStep===1">
        <div class="text-h5 font-weight-black d-flex align-center">
          {{ controller.startTime }}
          <div class="text-body-2">
            @{{ reservationInfo.date }}
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
                placeholder="Max.."
              />
            </form-container>
            <form-container label="Last Name">
              <v-text-field
                placeholder="Mustermann.."
              />
            </form-container>
          </inline-two-row-container>
          <inline-two-row-container>
            <form-container label="Email">
              <v-text-field
                placeholder="Max.mustermann@example.com"
              />
            </form-container>
            <form-container label="Tel">
              <v-text-field
                placeholder="0123-456789"
              />
            </form-container>
          </inline-two-row-container>
          <form-container label="Note">
            <v-textarea
              auto-grow
              placeholder="Note about extra wishes"
            />
          </form-container>
          <v-chip
            @click="controller.useStroller=!controller.useStroller"
            variant="tonal"
            rounded="sm"
          >
            <template #prepend>
              <v-icon
                class="mr-2"
                v-if="controller.useStroller"
              >
                mdi-check-circle
              </v-icon>
            </template>

            Need Stroller
          </v-chip>
        </div>

        <v-btn
          @click="controller.reservationStep=1"
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
