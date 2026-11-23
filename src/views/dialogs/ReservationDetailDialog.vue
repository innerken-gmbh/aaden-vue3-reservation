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
import {
  cancelWithFullRefund,
  changeSeatPlan,
  confirm,
  getFullRefundCheck,
  priceDisplay,
  resendConfirmEmail
} from "../../dataLayer/api/reservationApi.js";
import EventLogListItem from "../items/EventLogListItem.vue";
import {storeToRefs} from "pinia";
import EditReservationInfoDialog from "./EditReservationInfoDialog.vue";
import {useI18n} from "vue-i18n";

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

const showEditInfoDialog = ref(false);

function editInfo() {
  showEditInfoDialog.value = true;
}


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

const emailLoading = ref(false)

async function resendEmail() {
  try {
    emailLoading.value = true
    await resendConfirmEmail(info.value.id)
    emailLoading.value = false
  } catch (e) {
    console.log(e,'e')
  }

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

// 全额退定金（POS-1041）：能不能退、退多少由服务端判断，打开详情时问一次，点之前弹确认框
const {t} = useI18n()
const refundCheck = ref(null)
const showRefundConfirm = ref(false)
const refundLoading = ref(false)
// 确认框里的结果：{type: 'success' | 'warning' | 'error', text}
const refundResult = ref(null)

async function loadRefundCheck() {
  refundCheck.value = null
  const id = info.value?.id
  if (!id) return
  try {
    const check = await getFullRefundCheck(id)
    if (info.value?.id === id) refundCheck.value = check
  } catch (e) {
    console.log(e, 'fullRefundCheck')
  }
}

watch(() => [showDetailDialog.value, info.value?.id], ([show]) => {
  if (show) loadRefundCheck()
}, {immediate: true})

// 没有线上定金的不显示按钮；已退过的灰掉写原因；已取消的整个操作区本来就不显示
const showRefundButton = computed(() => {
  const check = refundCheck.value
  return !!check && (check.allowed || check.blockedReason === 'ALREADY_REFUNDED')
})

function refundBlockedText(reason) {
  return t('FullRefundBlocked_' + reason, {amount: priceDisplay(String(refundCheck.value?.refundedAmount ?? ''))})
}

const refundMethodText = computed(() => {
  const method = refundCheck.value?.paymentMethodType
  if (!method) return t('PaymentMethod_original')
  const key = 'PaymentMethod_' + method
  const label = t(key)
  return label === key ? method : label
})

function openRefundConfirm() {
  refundResult.value = null
  showRefundConfirm.value = true
}

async function onFullRefund() {
  const id = info.value?.id
  refundLoading.value = true
  try {
    const res = await cancelWithFullRefund(id)
    if (res?.code === 200) {
      refundResult.value = res.data?.refunded
        ? {type: 'success', text: t('FullRefundDone', {amount: priceDisplay(String(res.data.amount))})}
        : {type: 'warning', text: t('FullRefundFailedButCancelled')}
      await controller.reload()
    } else if (res?.code === 409) {
      refundResult.value = {type: 'error', text: refundBlockedText(res.message)}
      await loadRefundCheck()
      await controller.reload()
    } else {
      refundResult.value = {type: 'error', text: t('FullRefundError', {message: res?.message ?? ''})}
    }
  } catch (e) {
    refundResult.value = {type: 'error', text: t('FullRefundError', {message: e?.message ?? String(e)})}
  } finally {
    refundLoading.value = false
  }
}

function closeRefundConfirm() {
  showRefundConfirm.value = false
  // 退成功或已经被别人取消：详情里的状态已经不对了，一起关掉
  if (refundResult.value && refundResult.value.type !== 'error' || refundCheck.value?.blockedReason === 'CANCELLED') {
    controller.showDetailDialog = false
  }
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
          #{{ controller.activeReservationId }}/{{ $t(status) }}<span v-if="controller.paymentIntentId">{{controller.paymentIntentId}}</span>
        </div>
        <div class="text-body-2">
          <span>{{priceDisplay(info.totalPrice)}}</span>
        </div>
      </div>
      <v-spacer />
      <v-btn
          v-if="status===ReservationStatus.Confirmed"
          @click="resendEmail"
          icon=""
          :loading="emailLoading"
          color="white"
      >
        <v-icon>mdi-email-fast-outline</v-icon>
      </v-btn>
      <v-btn
          @click="editInfo"
          icon=""
          color="white"
      >
        <v-icon>mdi-lead-pencil</v-icon>
      </v-btn>
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
          <template v-if="showRefundButton">
            <div class="mt-2">
              <v-btn
                @click="openRefundConfirm"
                :disabled="!refundCheck.allowed"
                :loading="refundLoading"
                color="error"
                variant="outlined"
                block
              >
                <template #prepend>
                  <v-icon>mdi-cash-refund</v-icon>
                </template>
                {{ $t('FullRefund') }} {{ priceDisplay(String(refundCheck.amount)) }}
              </v-btn>
              <div
                v-if="!refundCheck.allowed"
                class="text-caption text-medium-emphasis mt-1"
              >
                {{ refundBlockedText(refundCheck.blockedReason) }}
              </div>
            </div>
          </template>
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

  <!-- 全额退定金确认（POS-1041） -->
  <v-dialog
    v-model="showRefundConfirm"
    max-width="440px"
    persistent
  >
    <v-card
      rounded="xl"
      class="pa-6"
    >
      <div class="text-h6 font-weight-black">
        {{ $t('FullRefundConfirmTitle') }}
      </div>
      <template v-if="!refundResult">
        <div class="mt-4">
          <div class="text-body-2">
            {{ $t('FullRefundAmount') }}
          </div>
          <div class="text-h5 font-weight-black">
            {{ priceDisplay(String(refundCheck?.amount ?? '')) }}
          </div>
        </div>
        <div class="mt-3">
          <div class="text-body-2">
            {{ $t('FullRefundTo') }}
          </div>
          <div class="text-body-1 font-weight-bold">
            {{ $t('FullRefundToMethod', {method: refundMethodText}) }}
          </div>
          <div
            v-if="info?.email"
            class="text-body-2"
          >
            {{ info.firstName }} {{ info.lastName }} · {{ info.email }}
          </div>
        </div>
        <v-alert
          class="mt-4"
          type="warning"
          variant="tonal"
          density="compact"
        >
          {{ $t('FullRefundCancelNotice') }}
        </v-alert>
        <div class="mt-4 d-flex">
          <v-btn
            variant="text"
            :disabled="refundLoading"
            @click="showRefundConfirm=false"
          >
            {{ $t('Back') }}
          </v-btn>
          <v-spacer />
          <v-btn
            color="error"
            :loading="refundLoading"
            @click="onFullRefund"
          >
            {{ $t('FullRefundConfirm') }}
          </v-btn>
        </div>
      </template>
      <template v-else>
        <v-alert
          class="mt-4"
          :type="refundResult.type"
          variant="tonal"
        >
          {{ refundResult.text }}
        </v-alert>
        <div class="mt-4 d-flex">
          <v-spacer />
          <v-btn
            color="primary"
            @click="closeRefundConfirm"
          >
            {{ $t('OK') }}
          </v-btn>
        </div>
      </template>
    </v-card>
  </v-dialog>

  <!-- Edit Reservation Info Dialog -->
  <edit-reservation-info-dialog
    v-model="showEditInfoDialog"
    :reservation-info="info"
  />
</template>

<style scoped>

</style>
