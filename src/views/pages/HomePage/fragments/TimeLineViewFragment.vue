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

const props = defineProps({
  currentTimeX: {
    type: Number,
    default: () => 0
  }
})
const reservationInfo = useReservationStore()
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
  container.value?.scroll({top: 0, left: props.currentTimeX - (window.innerWidth / 3)})
}

onMounted(async () => {
  await IKUtils.wait(1000)
  resetCurrentScrollPos()
})
</script>

<template>
  <div
    style="width: calc(100% + 24px);position: relative;"
    class="ml-n4 mt-8 pl-4 d-flex align-start"
  >
    <v-card
      @click="resetCurrentScrollPos"
      style="position: absolute;left: 16px;top: 0;z-index: 8"
      :width="reservationInfo.ySize"
      :height="reservationInfo.ySize"
      color="primary"
      class="d-flex align-center justify-center"
    >
      <v-icon size="sm">
        mdi-crosshairs-gps
      </v-icon>
    </v-card>
    <div
      class="flex-grow-1"
      ref="container"
      v-dragscroll="dragController.globalDragEnable"
      style="display: grid;grid-gap: 0;position: relative;
          width: 0;overflow:hidden;
        height:calc(100vh - 170px);"
      :style="{gridTemplateColumns:'repeat('+reservationInfo.timeSlots.length+','+reservationInfo.xSize+'px)',
               gridTemplateRows:'repeat('+(reservationInfo.tableList.length+2)+','+reservationInfo.ySize+'px)',
      }"
    >
      <div
        class="border-primary"
        style="position: absolute;width:8px;
              z-index: 4;top:0;left: 0;
              backdrop-filter: grayscale(100%);
              background: linear-gradient(to right ,rgba(var(--v-theme-background),0) 0,rgba(var(--v-theme-background),0.05) 80%,rgba(var(--v-theme-background),.5) 100%);
              border-right: 2px solid;"
        :style="{
          width: `${currentTimeX}px`,
          height:(reservationInfo.containerHeight
            +2*reservationInfo.ySize)+'px',
        }"
      />

      <div
        style="position: sticky;top: 0;grid-column: 1 / -1;z-index: 2"
      >
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
          class="text-caption bg-surface-darken-1"
          style="width: 100%;height: 100%;
              grid-column:span 2;position: sticky;
              top: 28px;z-index: 3"
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
        style="position: sticky; z-index: 4;
          left: 0;
          width: 72px;
          background: linear-gradient(to right , rgba(var(--v-theme-background),.7),
             rgba(var(--v-theme-background),.1))"
        class="d-flex align-center pl-2 pr-1
             font-weight-black text-body-2"
        :style="{height:reservationInfo.ySize+'px',gridColumn:'1',gridRow:i+3}"
        v-for="(t,i) in reservationInfo.tableList"
        :key="t.id"
      >
        {{ t.tableName }}
        <v-spacer />
        <v-icon color="secondary">
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
        style="position: absolute;z-index: 2;"
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
          <reservation-card
            v-for="r in reservationInfo.filteredReservationList"
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
    <v-card
      v-if="reservationChangeVM.changesCount>0"
      style="position: fixed;right: 64px;bottom: 64px"
      class="pa-2 pl-8 font-weight-black"
      color="primary"
      elevation="8"
    >
      {{ reservationChangeVM.changesCount }} Changes
      <v-btn
        elevation="0"
        @click="reservationChangeVM.cancelAllChanges()"
        class="mx-2"
        rounded="0"
        icon=""
        color="primary"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn
        @click="reservationChangeVM.applyAllChanges()"
        elevation="0"
        rounded="0"
        icon=""
        color="primary"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-card>
  </div>
</template>

<style scoped>
.gridBackground {
  background: linear-gradient(to right, rgba(255, 255, 255, .1) 1px,
  rgba(255, 255, 255, .1) 1px),
  linear-gradient(to bottom, rgba(var(--v-theme-background), 1) 1px, transparent 1px),
  linear-gradient(to right, rgba(var(--v-theme-background), 1) 2px, transparent 1px),
  linear-gradient(to right, rgba(var(--v-theme-background), 1) 3px, transparent 1px);
  background-size: 40px 28px,
  40px 28px,
  80px 72px,
  160px 72px
}

.stripeBackground {
  background: repeating-linear-gradient(
      to right,
      #f6ba52,
      #f6ba52 10px,
      #ffd180 10px,
      #ffd180 20px
  );
}

.vdr {
  position: absolute;
}

</style>
