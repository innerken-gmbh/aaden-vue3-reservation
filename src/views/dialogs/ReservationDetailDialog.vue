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
import {i18n} from "../../plugins/i18n.js";

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
// 这个库的 vue-i18n 是 legacy 模式，不能用 useI18n()，和 homeController 一样用 i18n.global.t
const t = (key, values) => i18n.global.t(key, values)
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

// 没有线上定金的不显示按钮；已退过、支付待核对或有争议的灰掉写原因；已取消、到店、没来的整个操作区本来就不显示
const showRefundButton = computed(() => {
  const check = refundCheck.value
  return !!check && (check.allowed || ['ALREADY_REFUNDED', 'PAYMENT_NOT_REFUNDABLE'].includes(check.blockedReason))
})

// 金额按支付的币种显示：欧元照这个库的老格式（30,00 €），别的币种写代码
function moneyDisplay(amount, currency) {
  if (!currency || currency.toUpperCase() === 'EUR') return priceDisplay(String(amount ?? ''))
  const n = parseFloat(amount)
  return (isNaN(n) ? ' - ' : n.toFixed(2).replace('.', ',')) + ' ' + currency.toUpperCase()
}

const KNOWN_BLOCKS = ['CANCELLED', 'STATUS_NOT_ALLOWED', 'NO_ONLINE_DEPOSIT', 'PAYMENT_NOT_REFUNDABLE', 'ALREADY_REFUNDED']

// 用最新的 refundCheck 里的金额（409 之后先 loadRefundCheck 再调）
function refundBlockedText(reason) {
  if (!KNOWN_BLOCKS.includes(reason)) return t('FullRefundNotDone')
  const check = refundCheck.value
  return t('FullRefundBlocked_' + reason, {amount: moneyDisplay(check?.refundedAmount, check?.currency)})
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

// 刷新可退状态和列表。断网时这两步自己也会失败：吞掉，不能让异常盖过要给店员看的结果
async function refreshAfterRefund() {
  await loadRefundCheck()
  try {
    await controller.reload()
  } catch (e) {
    console.log(e, 'reload after refund')
  }
}

async function onFullRefund() {
  const id = info.value?.id
  refundLoading.value = true
  try {
    const res = await cancelWithFullRefund(id)
    if (res?.code === 200) {
      refundResult.value = res.data?.refunded
        ? {type: 'success', text: t('FullRefundDone', {amount: moneyDisplay(res.data.amount, res.data.currency)})}
        : {type: 'warning', text: t('FullRefundFailedButCancelled')}
      // 预订已取消：刷新后 refundCheck 是 CANCELLED，关确认框时连详情一起关
      await refreshAfterRefund()
    } else if (res?.code === 409) {
      await refreshAfterRefund()
      refundResult.value = {type: 'error', text: refundBlockedText(res.message)}
    } else if (res?.code) {
      // 服务端处理了但报错（比如 Stripe 暂时连不上）：整个取消已回滚，可以重试，重试不会重复退。
      // 服务端的 message 是中文日志，不往德、英、荷界面上放
      await refreshAfterRefund()
      refundResult.value = {type: 'error', text: t('FullRefundNotDone')}
    } else {
      await refreshAfterRefund()
      refundResult.value = {type: 'warning', text: t('FullRefundUncertain')}
    }
  } catch (e) {
    // 网络断了、超时、网关报错：不知道服务端退没退，刷新后让店员看状态
    console.log(e, 'cancelWithFullRefund')
    await refreshAfterRefund()
    refundResult.value = {type: 'warning', text: t('FullRefundUncertain')}
  } finally {
    refundLoading.value = false
  }
}

function closeRefundConfirm() {
  showRefundConfirm.value = false
  // 已经取消了（自己退成、退款失败但已取消、别人先退了）：详情里的状态已经不对了，一起关掉
  if (refundResult.value?.type === 'success' || refundCheck.value?.blockedReason === 'CANCELLED') {
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
                {{ $t('FullRefund') }} {{ moneyDisplay(refundCheck.amount, refundCheck.currency) }}
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
            {{ moneyDisplay(refundCheck?.amount, refundCheck?.currency) }}
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
