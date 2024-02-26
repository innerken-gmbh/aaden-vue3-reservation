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
    <v-card
      @click="tryUnlock"
      rounded="md"
      :height="ySize"
      class="pr-2 text-caption d-flex align-center reservationCard gradient "
      style="position: absolute;width: 100%"
      :style="{
        gridColumn:reservationInfo.grid.xStart+' / '+reservationInfo.grid.xEnd,
        gridRow:reservationInfo.grid.y
      }"
    >
      <v-card
        :width="ySize"
        :height="ySize"
        :color="color"
        class="mr-2 flex-shrink-0 d-flex align-center justify-center"
      >
        <v-icon
          :color="haveShareTable?reservationInfo.shareColor:''"
          small
          @click.stop="emit('open')"
        >
          <template v-if="canDrag">
            mdi-cursor-move
          </template>
          <template v-else-if="reservationInfo.haveOverlap">
            mdi-alert
          </template>
          <template v-else>
            <template v-if="haveShareTable">
              mdi-link-variant
            </template>
            <template v-else>
              mdi-arrow-expand
            </template>
          </template>
        </v-icon>
      </v-card>
      <div class="text-body-1 font-weight-black mr-2 flex-shrink-0">
        {{ personCount }} <span
          class="text-caption"
          v-if="reservationInfo.personCount!==personCount"
        >/{{ reservationInfo.personCount }}
        </span> P
      </div>
      <div class="text-body-2 font-weight-regular text-no-wrap text-truncate">
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
        class="text-body-2 text-no-wrap text-truncate text-right ml-2 flex-grow-1"
      >
        {{ reservationInfo.note }}
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
  </vue-draggable-resizable>
</template>

<script setup>
import {computed} from "vue";
import {getReservationColor, useDragStore} from "../../dataLayer/repository/reservationRepo.js";
import {storeToRefs} from "pinia";
import {useReservationChangeVM} from "../../dataLayer/repository/reservationChangesVM.js";

const props = defineProps(['reservationInfo', 'xSize', 'ySize','yPos','personCount','blockId'])
const emit = defineEmits(['open', 'dragStop', 'checkin'])

const dragController = useDragStore()
const {draggableItemId} = storeToRefs(useDragStore())
const changesVM=useReservationChangeVM()


const checkedIn = computed(() => {
  return props.reservationInfo.completed === '1'
})

const cancelled = computed(() => {
  return props.reservationInfo.cancelled === '1'
})
const haveShareTable = computed(() => {
  return props.reservationInfo.haveShareTable
})
const color = computed(() => {
  if (canDrag.value) {
    return 'cardSelectedColor'
  }
  return getReservationColor(props.reservationInfo)
})


const canDrag = computed(() => {
  return draggableItemId.value === props.reservationInfo.id
})

function tryUnlock(e) {
  e.preventDefault()
  e.stopPropagation()
  if (canDrag.value) {
    dragController.stopDrag()
  } else {
    if (!checkedIn.value && !cancelled.value) {
      console.log('unlock', props.reservationInfo.id)
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
