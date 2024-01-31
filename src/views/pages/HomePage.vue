<script setup>
import {useReservationStore} from "../../dataLayer/repository/reservationRepo.js";
import dayjs from "dayjs";
import {dateFormat, timestampTemplate, useCurrentTime} from "../../dataLayer/repository/dateRepo.js";
import ReservationCard from "../items/ReservationCard.vue";
import NewReservationDialog from "./NewReservationDialog.vue";
import {moveReservation} from "../../dataLayer/api/reservationApi.js";
import {onMounted, ref, watchEffect} from "vue";


const reservationInfo = useReservationStore()
const currentTimeX = ref(0)
const {currentTime} = useCurrentTime()
watchEffect(() => {
  currentTimeX.value = Math.ceil((dayjs(currentTime.value).subtract(2, "hours")
          .diff(dayjs().set("hours", 5), 'minutes') / (19 * 60))
      * reservationInfo.containerWidth)
})
const container = ref(null)

function resetCurrentScrollPos() {
  container.value?.scroll({top: 0, left: currentTimeX.value - (window.innerWidth / 2)})
}


async function init() {
  await reservationInfo.reload()
  resetCurrentScrollPos()

}


async function onMoveReservation(r, positionInfo) {
  const [x, y] = positionInfo
  const timeSlot = reservationInfo.timeSlots.at(x / reservationInfo.xSize)
  const table = reservationInfo.tableList.at(y / reservationInfo.ySize)
  const reservationLength = Math.abs(dayjs(r.fromDateTime).diff(dayjs(r.toDateTime), 'minutes'))
  const [hour, minute] = timeSlot.split(':')
  const newStart = dayjs(r.fromDateTime).set('hour', hour).set('minute', minute)
  const newEnd = newStart.add(reservationLength, 'minutes').format(timestampTemplate)
  await moveReservation(r.id, table.tableId, newStart.format(timestampTemplate), newEnd)
  await reservationInfo.reload()
}

onMounted(() => {
  init()
})

</script>

<template>
  <v-container
    fluid
    class="pb-0"
  >
    <v-row>
      <v-col>
        <div class="text-h4 d-flex font-weight-black align-center">
          Reservations
          <v-spacer />
          <v-btn
            class="mr-2"
            icon=""
            flat
            @click="resetCurrentScrollPos"
          >
            <v-icon>mdi-crosshairs-gps</v-icon>
          </v-btn>
          <v-btn
            icon=""
            flat
            @click="reservationInfo.date=dayjs(reservationInfo.date)
              .add(-1,'d')
              .format(dateFormat)"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <div class="d-flex mx-2 align-center">
            <div class="text-caption">
              {{ dayjs(reservationInfo.date).format('dddd') }}
            </div>
            <div class="font-weight-black text-h5 mx-2">
              {{ dayjs(reservationInfo.date).format('DD') }}
            </div>
            <div class="text-body-2 font-weight-black">
              {{ dayjs(reservationInfo.date).format('MMMM') }}
            </div>
          </div>
          <v-btn
            flat
            class="bg-grey-darken-4"
            icon=""
            @click="reservationInfo.date=dayjs(reservationInfo.date)
              .add(1,'d').format(dateFormat)"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <div
      style="width: calc(100% + 24px);position: relative;"
      class="ml-n4 mt-8 pl-4 d-flex align-start"
    >
      <div
        class="flex-grow-1"
        ref="container"
        style="display: grid;grid-gap: 0;position: relative;width: 0;overflow-x: scroll;
        height:calc(100vh - 170px);"
        :style="{gridTemplateColumns:'repeat('+reservationInfo.timeSlots.length+','+reservationInfo.xSize+'px)',
                 gridTemplateRows:'repeat('+(reservationInfo.tableList.length+2)+','+reservationInfo.ySize+'px)',
        }"
      >
        <div
          style="position: sticky;top: 0;grid-column: 1 / -1;z-index: 8"
        >
          <div
            style="width: 100%;position: relative;display: grid;"
            :style="{gridTemplateColumns:'repeat('+reservationInfo.timeSlots.length+','+reservationInfo.xSize+'px)',
                     gridTemplateRows:'repeat(1,'+reservationInfo.ySize+'px)',
            }"
          >
            <div
              style="position: absolute;width:4px;height: 12px;z-index: 20;top:16px;left: 0;
"
              :style="{
                transform: `translateX(${currentTimeX}px)`
              }"
              class="bg-white rounded-b-pill"
            />
            <template
              :key="i"
              v-for="(t,i) in reservationInfo.bigTime"
            >
              <div
                class="pa-2 text-body-1 d-flex align-center bg-black"
                style="width: 100%;height: 100%;grid-column:span 4;position: sticky;top:0;z-index: 6;
             box-sizing:border-box;
"
              >
                {{ t }}
              </div>
            </template>
          </div>
        </div>

        <template
          v-for="t in reservationInfo.seatedInfo"
          :key="t.time"
        >
          <div
            class="pa-1 d-flex align-center justify-center text-center
             text-caption bg-grey-darken-4"
            style="width: 100%;height: 100%;grid-column:span 2;position: relative"
            :style="{
              borderLeft:t.time.endsWith('00')?'3px inset rgba(0,0,0,.2) !important':
                '2px inset rgba(0,0,0,.2) !important'
            }"
          >
            <div
              class="bg-amber"
              style="position: absolute;bottom: 0;left: 0;right: 0;"
              :style="{
                height:t.ratio+'%'
              }"
            />
            <div
              style="z-index: 2"
              class="font-weight-black"
            >
              {{ t.count }}
            </div>
          </div>
        </template>
        <div
          style="position: sticky; z-index: 4;
          left: 0;
          width: 72px;
          background: linear-gradient(to right , rgba(0,0,0,.7),
             rgba(0,0,0,.1))"
          class="d-flex align-center pl-2 pr-1 font-weight-black text-body-2"
          :style="{height:reservationInfo.ySize+'px',gridColumn:'1',gridRow:i+3}"
          v-for="(t,i) in reservationInfo.tableList"
          :key="t.id"
        >
          {{ t.tableName }}
          <v-spacer />
          <v-icon color="green">
            mdi-circle-small
          </v-icon>
          <div class="font-weight-thin text-caption">
            {{ t.tableSeatCount }}
          </div>
        </div>
        <div
          class="gridBackground"
          :style="{
            height:(reservationInfo.containerHeight+1)+'px',
            width: reservationInfo.containerWidth+'px',
            gridColumn:'0 / '+reservationInfo.timeSlots.length,
            gridRow:'3 / '+(reservationInfo.tableList.length+6)
          }"
          style="position: absolute;"
        />
        <v-card
          color="transparent"
          flat
          tile
          :width="reservationInfo.containerWidth"
          :height="reservationInfo.containerHeight"
          style="position: absolute;"
          :style="{
            gridColumn:'0 / '+reservationInfo.timeSlots.length,
            gridRow:'3 / '+(reservationInfo.tableList.length+3)
          }"
        >
          <div
            style="position: relative"
            :style="{
              width:reservationInfo.containerWidth+'px',
              height:reservationInfo.containerHeight+'px'
            }"
          >
            <reservation-card
              v-for="r in reservationInfo.reservationList"
              :key="r.id"
              @open="reservationInfo.showReservationWithId(r.remoteId)"
              :reservation-info="r"
              @drag-stop="(...args)=>onMoveReservation(r,args)"
              :x-size="reservationInfo.xSize"
              :y-size="reservationInfo.ySize"
            />
          </div>
        </v-card>
      </div>
    </div>
  </v-container>
  <new-reservation-dialog />
</template>

<style scoped>
::-webkit-scrollbar {
  display: none;
}


.gridBackground {
  background: linear-gradient(to right, rgba(255, 255, 255, .1) 1px, rgba(255, 255, 255, .1) 1px),
  linear-gradient(to bottom, rgba(0, 0, 0, 1) 1px, transparent 1px),
  linear-gradient(to right, rgba(0, 0, 0, 1) 2px, transparent 1px),
  linear-gradient(to right, rgba(0, 0, 0, 1) 3px, transparent 1px);
  background-size: 40px 28px,
  40px 28px,
  80px 72px,
  160px 72px
}

.vdr {
  position: absolute;
}
</style>
