<script setup>

import ReservationCard from "../../../items/ReservationCard.vue";
import {
  useDragStore,
  useReservationChangeVM,
  useReservationStore
} from "../../../../dataLayer/repository/reservationRepo.js";
import {timestampTemplate, today} from "../../../../dataLayer/repository/dateRepo.js";
import dayjs from "dayjs";
import {onMounted, ref} from "vue";
import IKUtils from "innerken-js-utils";
import {minBy} from "lodash-es";

const props = defineProps({
  currentTimeX: {
    type: Number,
    default: () => 0
  }
})
const reservationInfo = useReservationStore()
console.log(reservationInfo.timeSlots.length, 'lenght')
const dragController = useDragStore()


const reservationChangeVM = useReservationChangeVM()


async function onMoveReservation(r, positionInfo) {
  const [x, y] = positionInfo
  if (x === r.grid.x && y === r.grid.y) {
    reservationChangeVM.addToChanges(r.id, null)
    return
  }
  const timeSlot = reservationInfo.timeSlots.at(x / reservationInfo.xSize)
  const table = reservationInfo.tableList.at(y / reservationInfo.ySize)
  const reservationLength = Math.abs(dayjs(r.fromDateTime).diff(dayjs(r.toDateTime), 'minutes'))
  const [hour, minute] = timeSlot.split(':')
  const newStart = dayjs(r.fromDateTime).set('hour', hour).set('minute', minute)
  const newEnd = newStart.add(reservationLength, 'minutes').format(timestampTemplate)
  reservationChangeVM.addToChanges(r.id, table.tableId,
      newStart.format(timestampTemplate), newEnd)
}

const container = ref(null)

function resetCurrentScrollPos() {
  if (reservationInfo.date === today()) {
    container.value?.scroll({
      top: 0, left: props.currentTimeX -
          (window.innerWidth / 3)
    })
  } else {
    const firstReservation = minBy(reservationInfo.filteredReservationList,
        'grid.x')
    if (firstReservation) {
      container.value?.scroll({
        top: 0, left: firstReservation.grid.x -
            (window.innerWidth / 3)
      })
    }

  }

}

onMounted(async () => {

  await IKUtils.wait(200)

  resetCurrentScrollPos()


})
</script>

<template>
  <div
    style="width: calc(100% + 24px);position: relative;"
    class="ml-n4 mt-8 pl-4 d-flex align-start"
  >
    <div
      @click="dragController.stopDrag()"
      class="flex-grow-1"
      ref="container"
      v-dragscroll="dragController.globalDragEnable"
      style="display: grid;grid-gap: 0;position: relative;
          width: 0;overflow:hidden;
        height:calc(100dvh - 170px);"
      :style="{gridTemplateColumns:'repeat('+reservationInfo?.timeSlots?.length+','+reservationInfo.xSize+'px)',
               gridTemplateRows:'repeat('+(reservationInfo.tableList.length+2)+','+reservationInfo.ySize+'px)',
      }"
    >
      <div
        style="position: sticky;top: 0;grid-column: 1 / -1;z-index: 10"
      >
        <div
          v-if="reservationInfo.date===today()"
          class=""
          style="position: absolute;width:8px;
              z-index: 11;top:0;left: 0;
              backdrop-filter: grayscale(100%);
              border-right: 4px solid rgb(var(--v-theme-currentTimeMarkerColor));"
          :style="{
            width: `${currentTimeX}px`,
            height:(
              +reservationInfo.ySize)+'px',
          }"
        />
        <div
          style="width: 100%;position: relative;display: grid;"
          :style="{gridTemplateColumns:'repeat('+reservationInfo.timeSlots.length+','+reservationInfo.xSize+'px)',
                   gridTemplateRows:'repeat(1,'+reservationInfo.ySize+'px)',
          }"
        >
          <template
            :key="i"
            v-for="(t,i) in reservationInfo.bigTime"
          >
            <div
              class="pa-2 text-body-1 d-flex align-center bg-surface"
              style="width: 100%;height: 100%;grid-column:span 4;
                  position: sticky;top:0;
                  z-index: 6;
             box-sizing:border-box;
"
            >
              <div
                style="margin-left: -30%"
                v-if="i!==0"
              >
                {{ t }}
              </div>
            </div>
          </template>
        </div>
      </div>
      <template
        v-for="t in reservationInfo.seatedInfo"
        :key="t.time"
      >
        <div
          class="text-caption bg-surface-darken-1"
          style="width: 100%;height: 100%;
              grid-column:span 2;position: sticky;
              top: 28px;z-index: 10"
          :style="{
            borderLeft:t.time.endsWith('00')?
              '3px inset rgba(var(--v-theme-background),.2) !important':
              '2px inset rgba(var(--v-theme-background),.2) !important'
          }"
        >
          <div
            class="pa-1 text-center d-flex align-center justify-center"
            style="position: relative;width: 100%;height: 100%"
          >
            <div
              style="z-index: 2"
              class="font-weight-black text-body-2"
            >
              {{ t.count }}
            </div>
            <div
              style="position: absolute;top: 0;left: 0;right: 0;"
              :class="t.ratio===100?'bg-error':'bg-secondary'"
              :style="{
                height:t.ratio+'%'
              }"
            />
          </div>
        </div>
      </template>
      <div
        style="position: sticky; z-index: 9;
          left: 0;
          background: linear-gradient(to right ,
           rgba(var(--v-theme-background),.9),
             rgba(var(--v-theme-background),.7))"
        class="d-flex align-center pl-2 pr-1
             font-weight-black text-body-2"
        :style="{height:reservationInfo.ySize+'px',gridColumn:'1',gridRow:i+3,
                 width:2*reservationInfo.xSize+'px'}"
        v-for="(t,i) in reservationInfo.tableList"
        :key="t.id"
      >
        {{ t.tableName }}
        <v-spacer />
        <v-icon :color="t.active?'secondary':'grey'">
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
        style="position: absolute;z-index: 8;"
        :style="{
          gridColumn:'0 / '+reservationInfo.timeSlots.length,
          gridRow:'3 / '+(reservationInfo.tableList.length+3)
        }"
      >
        <div
          style="position: relative;"
          :style="{
            width:reservationInfo.containerWidth+'px',
            height:reservationInfo.containerHeight+'px'
          }"
        >
          <template
            :key="r.id"
            v-for="r in reservationInfo.filteredReservationList"
          >
            <template
              v-for="b in r.blocks"
              :key="b.id"
            >
              <reservation-card
                @open="reservationInfo.showReservationWithId(r.remoteId)"
                :reservation-info="r"
                :y-pos="b.y"
                @drag-stop="(...args)=>onMoveReservation(r,args)"
                :x-size="reservationInfo.xSize"
                :y-size="reservationInfo.ySize"
              />
            </template>
          </template>
        </div>
      </v-card>
    </div>
    <v-card
      v-if="reservationChangeVM.changesCount>0"
      style="position: fixed;right: 16px;bottom: 16px;z-index: 23"
      class="pa-4 pl-8 font-weight-black text-body-2"
      color="primary"
      rounded="lg"
      elevation="8"
    >
      {{ reservationChangeVM.changesCount }} {{ $t('Changes') }}
      <v-btn
        elevation="0"
        @click="reservationChangeVM.cancelAllChanges()"
        class="mx-2"
        rounded="0"
        size="36"
        icon=""
        color="primary"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn
        @click="reservationChangeVM.applyAllChanges()"
        elevation="0"
        rounded="0"
        size="36"
        icon=""
        color="primary"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-card>
    <v-card
      v-else-if="reservationInfo.date===today()"
      @click="resetCurrentScrollPos"
      style="position: fixed;right: 16px;bottom: 16px;z-index: 12"
      color="primary"
      rounded="pill"
      class="pa-4 px-4 font-weight-black"
    >
      <v-icon>
        mdi-crosshairs-gps
      </v-icon>
    </v-card>
    <v-card
      v-else
      @click="reservationInfo.date=today()"
      style="position: fixed;right: 16px;bottom: 16px;z-index: 12"
      color="primary"
      rounded="pill"
      class="pa-4 px-4 font-weight-black"
    >
      <v-icon>
        mdi-calendar-refresh
      </v-icon>
    </v-card>
  </div>
</template>

<style scoped>
.gridBackground {
  background: linear-gradient(to right, rgba(var(--v-theme-gridOverlayColor), .1) 1px,
  rgba(var(--v-theme-gridOverlayColor), .1) 1px),
  linear-gradient(to bottom, rgba(var(--v-theme-gridStripeColor), 1) 1px,
      transparent 1px),
  linear-gradient(to right, rgba(var(--v-theme-gridStripeColor), 1) 1px,
      transparent 1px),
  linear-gradient(to right, rgba(var(--v-theme-gridStripeColor), 1) 1px,
      transparent 1px);
  background-size: 32px 28px,
  32px 28px,
  64px 72px,
  128px 72px
}


.vdr {
  position: absolute;
}

</style>
