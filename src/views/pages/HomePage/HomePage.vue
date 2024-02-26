<script setup>
import {
  useDatePickerStore,
  useDragStore,
  useReservationStore
} from "../../../dataLayer/repository/reservationRepo.js";
import dayjs from "dayjs";
import {
  dateFormat,
  toCalendarFormat,
  toOnlyTimeFormat,
  useCurrentTime
} from "../../../dataLayer/repository/dateRepo.js";
import NewReservationDialog from "../NewReservationDialog.vue";
import {onMounted, ref, watch, watchEffect} from "vue";
import {storeToRefs} from "pinia";
import PlaceHolder from "../../components/PlaceHolder.vue";
import {useDisplay} from "vuetify";
import IKUtils from "innerken-js-utils";
import ListViewFragment from "./fragments/ListViewFragment.vue";
import TimeLineViewFragment from "./fragments/TimeLineViewFragment.vue";
import {useReservationChangeVM} from "../../../dataLayer/repository/reservationChangesVM.js";


const reservationInfo = useReservationStore()
const changeVM = useReservationChangeVM()

const loading = ref(true)
const currentTimeX = ref(0)
const {currentTime} = useCurrentTime()

watchEffect(() => {
  currentTimeX.value = Math.ceil((dayjs(currentTime.value)
          .subtract(2, "hours")
          .diff(dayjs().set("hours", 5), 'minutes') / (19 * 60))
      * reservationInfo.containerWidth + reservationInfo.xSize)

})

const {date} = storeToRefs(reservationInfo)
watch(date, async () => {
  loading.value = true
  await changeVM.cancelAllChanges()
  await reservationInfo.reload()
  loading.value = false
})

async function init() {
  loading.value = true
  await reservationInfo.reload()
  loading.value = false
  await IKUtils.wait(2 * 1000)
}


onMounted(() => {
  init()
})
const datePicker = useDatePickerStore()

async function selectNewDate() {
  const newDate = await datePicker.selectDate()
  console.log(newDate, 'date')
  date.value = newDate
}

const {smAndUp} = useDisplay()

function toggleListView() {
  if (reservationInfo.search !== '') {
    reservationInfo.search = ''
  } else {
    reservationInfo.listView = !reservationInfo.listView
  }
}

</script>

<template>
  <v-container
    fluid
    class="pb-0"
  >
    <v-row>
      <v-col>
        <div class="text-h4 d-flex font-weight-black align-center">
          <v-btn
            class="mr-2"
            icon=""
            flat
            @click="toggleListView"
          >
            <v-icon>
              <template v-if="reservationInfo.listView">
                mdi-format-list-text
              </template>
              <template v-else>
                mdi-chart-timeline
              </template>
            </v-icon>
          </v-btn>
          <v-btn
            v-if="!reservationInfo.displayList"
            class="mr-2"
            icon=""
            flat
            @click="reservationInfo.showAll=!reservationInfo.showAll"
          >
            <v-icon>
              <template v-if="!reservationInfo.showAll">
                mdi-eye-closed
              </template>
              <template v-else>
                mdi-eye
              </template>
            </v-icon>
          </v-btn>
          <div
            v-if="smAndUp"
            class="text-body-2"
          >
            Updated@{{ toOnlyTimeFormat(currentTime) }}
          </div>
          <v-spacer />

          <v-btn
            icon=""
            flat
            @click="reservationInfo.date=dayjs(reservationInfo.date)
              .add(-1,'d')
              .format(dateFormat)"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <div
            class="d-flex mx-2 align-center"
            @click="selectNewDate"
          >
            <template v-if="smAndUp">
              <div
                class="text-caption"
              >
                {{ dayjs(reservationInfo.date).format('MMMM') }}
              </div>
              <div

                class="font-weight-black text-h5 mx-2"
              >
                {{ dayjs(reservationInfo.date).format('DD') }}
              </div>
              <div
                class="text-body-2 font-weight-black"
              >
                {{
                  toCalendarFormat(reservationInfo.date)
                }}
              </div>
            </template>
            <template v-else>
              <div>
                <div
                  class="font-weight-black text-body-1"
                >
                  {{ dayjs(reservationInfo.date).format('MMM DD') }}
                </div>
              </div>
            </template>
          </div>
          <v-btn
            flat
            icon=""
            @click="reservationInfo.date=dayjs(reservationInfo.date)
              .add(1,'d').format(dateFormat)"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <template v-if="loading">
      <place-holder
        title=" "
        hint=" "
        icon="mdi-cloud"
      >
        <v-progress-circular indeterminate />
      </place-holder>
    </template>
    <template v-else>
      <time-line-view-fragment
        :current-time-x="currentTimeX"
        v-if="!reservationInfo.displayList"
      />
      <list-view-fragment v-else />
    </template>
  </v-container>
  <new-reservation-dialog />
</template>

<style scoped>
div {
  overscroll-behavior: none;
}

::-webkit-scrollbar {
  display: none;
}


</style>
