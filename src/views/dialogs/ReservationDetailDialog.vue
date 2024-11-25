<script setup>
import {useReservationStore, useTableSelectorStore} from "../../dataLayer/repository/reservationRepo.js";
import {computed, ref, watch} from "vue";
import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";
import {timeFormat, toDateDisplayFormat, toOnlyTimeFormat} from "../../dataLayer/repository/dateRepo.js";
import BaseDialog from "../components/BaseDialog.vue";
import dayjs from "dayjs";
import {
  getReservationStatusColor,
  reservationCanEdit,
  ReservationStatus
} from "../../dataLayer/repository/reservationDisplay.js";
import {changeSeatPlan, confirm} from "../../dataLayer/api/reservationApi.js";
import EventLogListItem from "../items/EventLogListItem.vue";
import {storeToRefs} from "pinia";

const tableSelector = useTableSelectorStore()
const controller = useReservationStore()
const {showDetailDialog} = storeToRefs(controller)

const info = computed(() => {
  return controller.activeReservation
})

const canEdit = computed(() => {
  return reservationCanEdit(info.value)
})

const canCheckIn = computed(() => {
  return dayjs().format('YYYY-MM-DD') === dayjs(info.value?.fromDateTime).format('YYYY-MM-DD');
})

const status = computed(() => {
  return info.value?.status ?? ''
})
const color = computed(() => {
  return getReservationStatusColor(info.value)
})

const currentDiningTime = computed(() => {
  return dayjs(info.value?.toDateTime).diff(info.value?.fromDateTime, 'minute')
})

const overrideDiningTime = ref(0)

watch(currentDiningTime, (val) => {
  overrideDiningTime.value = val
})
watch(showDetailDialog, (val) => {

  if (val) overrideDiningTime.value = currentDiningTime.value
})


const timeChanged = computed(() => {
  return currentDiningTime.value !== overrideDiningTime.value
})

const overrideTime = computed(() => {
  return timeChanged.value ? dayjs(info.value.fromDateTime).add(overrideDiningTime.value, 'minute').format(timeFormat) : null;
})


async function changeTable() {
  const newTableArr = await tableSelector.scanQR(info.value.seatPlan.length)
  const oldSeatPlan = info.value.seatPlan
  oldSeatPlan.forEach((r, i) => {
    r.tableId = newTableArr[i]
  })
  await controller.actionAnd(async () =>{
    await changeSeatPlan(info.value.id, oldSeatPlan)
    controller.showDetailDialog = false
  }

)
}

async function onConfirm() {
  if (status.value === ReservationStatus.Confirmed) {

    await controller.checkIn(info.value?.id)
  } else {
    await controller.actionAnd(
        async () => {
          await confirm(info.value.id)
        }
    )
  }

  controller.showDetailDialog = false
}

async function onChangeTime() {
  await controller.changeEatingTime(info.value.id, overrideDiningTime.value / 15)
  controller.showDetailDialog = false
}

async function onCancel() {
  await controller.cancel(info.value?.id)
  controller.showDetailDialog = false
}

</script>

<template>
  <base-dialog
    :header-color="color==='transparent'?'white':color"
    :show-action="canEdit||controller.showLogs"
    v-model="controller.showDetailDialog"
  >
    <template #header>
      <div>
        <div>
          {{ $t('Reservation') }}
        </div>
        <div class="text-body-2">
          #{{ controller.activeReservationId }}/{{ $t(status) }}
        </div>
      </div>
      <v-spacer />
      <v-btn
        @click="controller.showLogs=!controller.showLogs"
        icon=""
        color="white"
        v-if="info?.logs?.length>0"
      >
        <v-icon>mdi-message-processing</v-icon>
      </v-btn>
    </template>
    <template v-if="controller.showLogs">
      <template
        v-for="e in info?.logs??[]"
        :key="e.id"
      >
        <event-log-list-item :info="e" />
      </template>
    </template>
    <template v-else-if="info">
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


      <inline-two-row-container class="mt-4">
        <div
          class="text-h5 font-weight-black"
          @click="changeTable()"
        >
          <div class="text-body-2">
            {{ $t('Table') }}
          </div>
          <div>
            {{ info.tableName }} / {{ info.personCount }} P
          </div>
        </div>
        <div class="text-h5 font-weight-black">
          <div class="text-body-2">
            {{ $t('NeedStroller') }}
          </div>
          <div>
            {{ info.useStroller.toString() === '1' ? $t('Yes') : $t('No') }}
          </div>
        </div>
      </inline-two-row-container>
      <div
        class="d-flex align-end  mt-4"
        v-if="info.email"
      >
        <div

          class="text-h5 font-weight-black"
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
        class="d-flex align-end mt-4"
        v-if="info.tel"
      >
        <div

          class="text-h5 font-weight-black "
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
      <div class="d-flex align-end  mt-4">
        <div
          class="text-h5 font-weight-black"
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
      <template v-if="controller.showLogs">
        <v-btn
          :loading="controller.loading"
          @click="controller.showLogs=false"
          color="primary"
          block
        >
          <template #prepend>
            <v-icon>mdi-arrow-left</v-icon>
          </template>
          {{ $t('Back') }}
        </v-btn>
      </template>
      <template v-else>
        <template v-if="timeChanged">
          <v-btn
            :loading="controller.loading"
            @click="onChangeTime"
            color="primary"
            block
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
            block
          >
            <template #prepend>
              <v-icon>mdi-cancel</v-icon>
            </template>
            {{ $t('Cancel') }}
          </v-btn>
          <template v-if="status===ReservationStatus.Created">
            <div class="mt-2">
              <v-btn
                :loading="controller.loading"
                @click="onConfirm"
                color="primary"
                block
              >
                <template #prepend>
                  <v-icon>mdi-check</v-icon>
                </template>
                {{ $t('Accept') }}
              </v-btn>
            </div>
          </template>
          <template v-else>
            <div class="mt-2">
              <v-btn
                :loading="controller.loading"
                @click="onConfirm"
                :disabled="!canCheckIn"
                color="primary"
                block
              >
                <template #prepend>
                  <v-icon>mdi-check</v-icon>
                </template>
                {{ $t('CheckIn') }}
              </v-btn>
            </div>
          </template>
        </template>
      </template>
    </template>
  </base-dialog>
</template>

<style scoped>

</style>
