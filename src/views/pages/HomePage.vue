<script setup>
import {useHomePageControllerStore, useReservationStore} from "../../dataLayer/repository/reservationRepo.js";
import dayjs from "dayjs";
import {dateFormat} from "../../dataLayer/repository/dateRepo.js";
import ReservationCard from "../items/ReservationCard.vue";
import InlineTwoRowContainer from "../items/InlineTwoRowContainer.vue";
import FormContainer from "../items/FormContainer.vue";


const reservationInfo = useReservationStore()
const controller = useHomePageControllerStore()
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
      style="width: calc(100% + 24px);position: relative"
      class="mt-8 ml-n4 pl-4 d-flex align-start"
    >
      <v-card
        tile
        class="pl-2 pr-2"
        :style="{
          gridTemplateRows:reservationInfo.ySize+'px',
        }"
        style="position: absolute;display:grid;grid-auto-flow: row;
            left: 16px;top:72px; z-index: 4;background: linear-gradient(to right , rgba(0,0,0,.7), rgba(0,0,0,.1))"
        flat
      >
        <div
          class="d-flex align-center pl-2 pr-1 font-weight-black text-body-2"
          :style="{height:reservationInfo.ySize+'px'}"
          style="width: 100%"
          v-for="(t) in reservationInfo.tableList"
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
      </v-card>
      <div
        class="flex-grow-1"
        v-dragscroll="true"
        style="display: grid;grid-gap: 0;position: relative;width: 0;overflow-x: scroll"
        :style="{gridTemplateColumns:'repeat('+reservationInfo.timeSlots.length+','+reservationInfo.xSize+'px)',
                 gridTemplateRows:'repeat('+(reservationInfo.tableList.length+2)+','+reservationInfo.ySize+'px)',
        }"
      >
        <template
          :key="i"
          v-for="(t,i) in reservationInfo.bigTime"
        >
          <div
            class="pa-2 text-body-1 d-flex align-center"
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
            class="pa-1 d-flex align-center justify-center text-center text-caption bg-grey-darken-4"
            style="width: 100%;height: 100%;grid-column:span 2;"
            :style="{
              borderLeft:t.time.endsWith('00')?'3px inset rgba(0,0,0,.2) !important':
                '2px inset rgba(0,0,0,.2) !important'
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
        <v-card
          color="transparent"
          flat
          tile
          :width="reservationInfo.containerWidth"
          :height="reservationInfo.containerHeight"
          style="position: absolute;"
          :style="{
            gridColumn:'0 / '+reservationInfo.timeSlots.length,
            gridRow:'3 / '+(reservationInfo.tableList.length+6)
          }"
        >
          <reservation-card
            v-for="r in reservationInfo.reservationList"
            :key="r.id"
            :reservation-info="r"
            :x-size="reservationInfo.xSize"
            :y-size="reservationInfo.ySize"
          />
        </v-card>
      </div>
    </div>
  </v-container>
  <v-dialog
    persistent
    max-width="500"
    v-model="controller.showNewReservationModal"
  >
    <v-card class="pa-6 py-8">
      <div class="text-h5 font-weight-black d-flex align-center">
        Create a new reservation
        <v-spacer />
        <v-icon
          size="32"
        >
          mdi-calendar-clock
        </v-icon>
      </div>
      <template v-if="controller.reservationStep===0">
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
          <div class="mt-8">
            <div class="d-flex">
              <div class="text-body-2">
                Date
              </div>
            </div>
            <v-select
              class="mt-1"
              variant="outlined"
            />
          </div>
          <div>
            <div class="d-flex">
              <div class="text-body-2">
                Time
              </div>
            </div>
            <v-select
              class="mt-1"
              variant="outlined"
            />
          </div>
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
      <template v-else-if="controller.reservationStep===1">
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
          <form-container label="Note">
            <v-textarea
              auto-grow
              placeholder="0123-456789"
            />
          </form-container>
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
::-webkit-scrollbar {
  display: none;
}


.gridBackground {
  background: linear-gradient(to right, rgba(255, 255, 255, .1) 1px, rgba(255, 255, 255, .1) 1px),
  linear-gradient(to bottom, rgba(0, 0, 0, 1) 1px, transparent 1px),
  linear-gradient(to right, rgba(0, 0, 0, 1) 2px, transparent 1px),
  linear-gradient(to right, rgba(0, 0, 0, 1) 3px, transparent 1px);
  background-size: 40px 36px,
  40px 36px,
  80px 72px,
  160px 72px
}
</style>
