<script setup>
import {
  getReservationColor,
  ReservationStatus,
  useReservationStore
} from "../../dataLayer/repository/reservationRepo.js";
import {computed, ref, watch} from "vue";
import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";
import {
  timeFormat,
  timestampTemplate,
  toDateDisplayFormat,
  toOnlyTimeFormat
} from "../../dataLayer/repository/dateRepo.js";
import BaseDialog from "../components/BaseDialog.vue";
import dayjs from "dayjs";

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

const currentDiningTime = computed(() => {
  return dayjs(info.value?.toDateTime).diff(info.value?.fromDateTime, 'minute')
})

const overrideDiningTime = ref(0)

watch(currentDiningTime, (val) => {
  overrideDiningTime.value = val
})

const timeChanged = computed(() => {
  return currentDiningTime.value !== overrideDiningTime.value
})

const overrideTime = computed(() => {
  return timeChanged.value ? dayjs(info.value.fromDateTime).add(overrideDiningTime.value, 'minute').format(timeFormat) : null;
})

async function onConfirm() {
  await controller.checkIn(info.value?.id)
  controller.showDetailDialog = false
}

async function onChangeTime() {
  info.value.toDateTime = dayjs(info.value.fromDateTime)
      .add(overrideDiningTime.value, 'minute')
      .format(timestampTemplate)
  await controller.moveReservation(info.value)
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
          {{ $t('Reservation') }}
        </div>
        <div class="text-body-2">
          #{{ controller.activeReservationId }}
        </div>
      </div>
      <v-spacer />
      <div class="text-body-1">
        {{ $t(status) }}
      </div>
    </template>
    <template v-if="info">
      <inline-two-row-container>
        <div class="text-h5 font-weight-black">
          <div class="text-body-2">
            {{ info.title || $t('FormOfAddress') }}
          </div>
          <div>
            {{ info.firstName }} {{ info.lastName }}
          </div>
        </div>
        <div class="text-h5 font-weight-black">
          <div class="text-body-2">
            {{ toDateDisplayFormat(info.fromDateTime) }}
          </div>
          <div class="text-no-wrap">
            {{ toOnlyTimeFormat(info.fromDateTime) }}
            <span class="text-body-2">
              {{ $t('to') }}
              <template v-if="overrideTime">
                {{ overrideTime }}
              </template>
              <template v-else>
                {{ toOnlyTimeFormat(info.toDateTime) }}
              </template>

            </span>
          </div>
        </div>
      </inline-two-row-container>
      <div class="d-flex align-center">
        <div
          class="text-h5 font-weight-black mt-4"
        >
          <div class="text-body-2">
            {{ $t('DiningTime') }}
          </div>
          <div class="d-flex">
            <div v-if="!timeChanged">
              {{ currentDiningTime }} min
            </div>
            <div v-else>
              {{ currentDiningTime }} min -> {{ overrideDiningTime }} min
            </div>
          </div>
        </div>
        <v-spacer />
        <template v-if="canEdit">
          <v-btn
            flat
            @click="overrideDiningTime<=30?null:overrideDiningTime-=15"
            icon="mdi-minus"
            size="36"
          />
          <v-btn
            flat
            @click="overrideDiningTime+=15"
            icon="mdi-plus"
            size="36"
          />
        </template>
      </div>

      <inline-two-row-container class="mt-4">
        <div class="text-h5 font-weight-black">
          <div class="text-body-2">
            {{ $t('Table') }}
          </div>
          <div>
            {{ info.tableNameNull }}
          </div>
        </div>
        <div class="text-h5 font-weight-black">
          <div class="text-body-2">
            {{ $t('NeedStroller') }}
          </div>
          <div>
            {{ info.useStroller === '1' ? $t('Yes') : $t('No') }}
          </div>
        </div>
      </inline-two-row-container>
      <div
        class="d-flex align-center"
        v-if="info.email"
      >
        <div

          class="text-h5 font-weight-black mt-4"
        >
          <div class="text-body-2">
            {{ $t('Mail') }}
          </div>
          <div>
            {{ info.email }}
          </div>
        </div>
        <v-spacer />
        <v-btn
          :href="'mailto:'+info.email"
          icon="mdi-email"
        />
      </div>

      <div
        class="d-flex align-center"
        v-if="info.tel"
      >
        <div

          class="text-h5 font-weight-black mt-4"
        >
          <div class="text-body-2">
            {{ $t('Phone') }}
          </div>
          <div>
            {{ info.tel }}
          </div>
        </div>
        <v-spacer />
        <v-btn
          :href="'tel:'+info.tel"
          icon="mdi-phone"
        />
      </div>

      <div
        v-if="info.note"
        class="text-h5 font-weight-black mt-4"
      >
        <div class="text-body-2">
          {{ $t('Note') }}
        </div>
        <div>
          {{ info.note }}
        </div>
      </div>
    </template>
    <template #action>
      <template v-if="timeChanged">
        <v-btn
          :loading="controller.loading"
          @click="onChangeTime"
          color="primary"
          block
          class="mt-2"
        >
          <template #prepend>
            <v-icon>mdi-check</v-icon>
          </template>
          {{ $t('Save') }}
        </v-btn>
      </template>
      <template v-else>
        <v-btn
          @click="onCancel"
          :loading="controller.loading"
          color="primary"
          variant="outlined"
        >
          <template #prepend>
            <v-icon>mdi-cancel</v-icon>
          </template>
          {{ $t('Cancel') }}
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
          {{ $t('CheckIn') }}
        </v-btn>
      </template>
    </template>
  </base-dialog>
</template>

<style scoped>

</style>
