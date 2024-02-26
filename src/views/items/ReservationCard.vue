<template>
  <vue-draggable-resizable
    :draggable="canDrag"
    :h="ySize"
    :grid="[xSize,ySize]"
    :parent="true"
    :prevent-deactivation="false"
    active-class=""
    :resizable="false"
    :x="reservationInfo.grid.x"
    :y="yPos"
    :w="reservationInfo.grid.w"
    class-name-dragging="dragging"
    @drag-stop="stopDrag"
  >
    <div
      style="position: relative"
      class="gradient"
    >
      <v-card
        elevation="0"
        style="position: absolute;left: 0;top: 0"
        :width="ySize"
        :height="ySize"
        :color="color"
        class="mr-2 flex-shrink-0 d-flex align-center justify-center"
      >
        <v-icon
          size="18"
          :color="haveShareTable&&reservationInfo.status===ReservationStatus.Confirmed
            ?reservationInfo.shareColor:''"
          small
          @click.stop="emit('open')"
        >
          {{ cardFrontIcon }}
        </v-icon>
      </v-card>
      <v-card
        :style="{marginLeft:ySize+4+'px'}"
        @click="tryUnlock"
        :disabled="!canMove"
        rounded="md"
        :height="ySize"
        color="transparent"
        elevation="0"
        class="pr-2 text-caption d-flex align-center "
      >
        <div class="mr-1  flex-shrink-0">
          <div
            v-if="reservationInfo.personCount===personCount"
            class="text-body-1 font-weight-black"
          >
            {{ personCount }}P
          </div>
          <div
            v-else
            class="text-body-2"
          >
            {{ personCount }}<span
              class="text-body-1 font-weight-black"
              v-if="reservationInfo.personCount!==personCount"
            >/{{ reservationInfo.personCount }}P
            </span>
          </div>
        </div>

        <div
          style="font-size: 12px!important;"
          class="text-body-2 font-weight-regular text-no-wrap text-truncate"
        >
          {{ reservationInfo.firstName }} {{ reservationInfo.lastName }}
        </div>
        <template v-if="reservationInfo.childCount>0">
          <v-icon
            small
            class="mx-2"
          >
            mdi-human-child
          </v-icon>
          {{ reservationInfo.childCount }}
        </template>
        <div

          style="font-size: 12px!important;"
          class="text-body-2 text-no-wrap text-truncate text-right ml-2 flex-grow-1"
        >
          <template v-if="!cancelled">
            {{ reservationInfo.note }}
          </template>
        </div>
        <v-icon
          v-if="changesVM.seatPlanChanges[blockId]||changesVM.timeChanges[reservationInfo.id]"
          small
          color="on-surface"
          class="ml-2"
        >
          mdi-dots-square
        </v-icon>
        <v-icon
          v-if="cancelled"
          small
          color="on-surface"
          class="ml-2"
        >
          mdi-cancel
        </v-icon>
        <v-icon
          v-if="checkedIn"
          small
          color="on-surface"
          class="ml-2"
        >
          mdi-location-enter
        </v-icon>
      </v-card>
    </div>
  </vue-draggable-resizable>
</template>

<script setup>
import {computed} from "vue";
import {useDragStore} from "../../dataLayer/repository/reservationRepo.js";
import {storeToRefs} from "pinia";
import {useReservationChangeVM} from "../../dataLayer/repository/reservationChangesVM.js";
import {
  getReservationColor,
  getReservationStatusIcon,
  ReservationStatus
} from "../../dataLayer/repository/reservationDisplay.js";

const props = defineProps(['reservationInfo', 'xSize', 'ySize', 'yPos', 'personCount', 'blockId'])
const emit = defineEmits(['open', 'dragStop', 'checkin'])

const dragController = useDragStore()
const {draggableItemId} = storeToRefs(useDragStore())
const changesVM = useReservationChangeVM()


const checkedIn = computed(() => {
  return props.reservationInfo.status === ReservationStatus.CheckIn
})

const cancelled = computed(() => {
  return props.reservationInfo.status === ReservationStatus.Cancelled
})
const haveShareTable = computed(() => {
  return props.reservationInfo.haveShareTable
})
const color = computed(() => {
  return getReservationColor(props.reservationInfo)
})

const cardFrontIcon = computed(() => {
  return getReservationStatusIcon(props.reservationInfo)
})


const canDrag = computed(() => {
  return draggableItemId.value === props.reservationInfo.id
})

const canMove = computed(() => {
  return !checkedIn.value && !cancelled.value
})

function tryUnlock(e) {
  e.preventDefault()
  e.stopPropagation()
  if (canDrag.value) {
    dragController.stopDrag()
  } else {
    if (!checkedIn.value && !cancelled.value) {
      dragController.startDrag(props.reservationInfo.id)
    }
  }

  return false
}

function stopDrag(...args) {

  emit('dragStop', ...args)
}

</script>

<style scoped>
div {
  user-select: none;
  overscroll-behavior: none;
}

.gradient {
  background: #3a7bd5; /* fallback for old browsers */
  background: linear-gradient(to right bottom,
  rgba(var(--v-theme-cardGradientStart), .56),
  rgba(var(--v-theme-cardGradientEnd), 0.94));
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.complete {
  background: #3a7bd5; /* fallback for old browsers */
  background: linear-gradient(to right bottom, rgba(11, 84, 24, 0.48), rgba(18, 132, 38, 0.48));
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
</style>
