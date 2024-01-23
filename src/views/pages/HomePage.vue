<script setup>
import {useReservationStore} from "../../dataLayer/repository/reservationRepo.js";
import dayjs from "dayjs";
import {dateFormat} from "../../dataLayer/repository/dateRepo.js";


const reservationInfo = useReservationStore()
reservationInfo.reload()


</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <div class="text-h4 d-flex font-weight-black align-center">
          Reservations
          <v-spacer />
          <v-btn
            icon=""
            flat
            class="bg-grey-lighten-4"
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
            class="bg-grey-lighten-4"
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
      style="width: calc(100% + 12px);overflow-x: scroll"
      class="mt-8"
    >
      <div
        style="display: grid;grid-gap: 0;position: relative"
        :style="{gridTemplateColumns:'repeat('+reservationInfo.timeSlots.length+','+reservationInfo.xSize+'px)',
                 gridTemplateRows:'repeat('+(reservationInfo.tableList.length+2)+','+reservationInfo.ySize+'px)',
        }"
      >
        <template
          :key="i"
          v-for="(t,i) in reservationInfo.bigTime"
        >
          <div
            class="pa-1 text-body-1 font-weight-black d-flex align-center"
            style="width: 100%;height: 100%;grid-column:span 4;
             box-sizing:border-box;
"
          >
            {{ t }}
          </div>
        </template>
        <template
          v-for="t in reservationInfo.seatedInfo"
          :key="t.time"
        >
          <div

            class="bg-grey-lighten-5 pa-1 d-flex align-center justify-center text-center text-caption"
            style="width: 100%;height: 100%;grid-column:span 2;"
            :style="{
              borderLeft:t.time.endsWith('00')?'3px inset rgba(0,0,0,.2) !important':'2px inset rgba(0,0,0,.2) !important'
            }"
          >
            {{ t.count }}
          </div>
        </template>
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
      </div>
    </div>
  </v-container>
</template>

<style scoped>
::-webkit-scrollbar {
  display: none;
}


.gridBackground {
  background: linear-gradient(to right, rgba(0, 0, 0, .1) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(0, 0, 0, .1) 1px, transparent 1px),
  linear-gradient(to right, rgba(0, 0, 0, .2) 2px, transparent 1px),
  linear-gradient(to right, rgba(0, 0, 0, .05) 3px, transparent 1px);
  background-size: 40px 24px,
  40px 24px,
  80px 48px,
  160px 48px
}
</style>
