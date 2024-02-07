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
    :y="reservationInfo.grid.y"
    :w="reservationInfo.grid.w"
    class-name-dragging="dragging"
    @drag-stop="stopDrag"
  >
    <v-card
      @contextmenu="tryUnlock"
      elevation="4"
      :variant="variants"
      rounded="0"
      :height="ySize"
      :color="color"
      class="px-2 text-caption d-flex align-center reservationCard bg-black"
      style="position: absolute;width: 100%"
      :style="{
        gridColumn:reservationInfo.grid.xStart+' / '+reservationInfo.grid.xEnd,
        gridRow:reservationInfo.grid.y
      }"
    >
      <v-icon
        v-if="!canDrag"
        small
        class="mr-2"
        @click.stop="emit('open')"
      >
        mdi-arrow-expand
      </v-icon>
      <v-icon
        v-else
        small
        class="mr-2"
      >
        mdi-cursor-move
      </v-icon>
      <div class="text-body-1 font-weight-black mr-2">
        {{ reservationInfo.personCount }}P
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
        v-if="haveShareTable"
        small
        :color="reservationInfo.shareColor"
        class="ml-2"
      >
        mdi-link-variant
      </v-icon>
      <v-icon
        v-if="cancelled"
        small
        color="white"
        class="ml-2"
      >
        mdi-cancel
      </v-icon>
      <v-icon
        v-if="checkedIn"
        small
        color="white"
        class="ml-2"
      >
        mdi-location-enter
      </v-icon>
    </v-card>
  </vue-draggable-resizable>
</template>

<script setup>
import {computed} from "vue";
import {useDragStore} from "../../dataLayer/repository/reservationRepo.js";
import {storeToRefs} from "pinia";

const props = defineProps(['reservationInfo', 'xSize', 'ySize'])
const emit = defineEmits(['open', 'dragStop', 'checkin'])

const dragController = useDragStore()
const {draggableItemId} = storeToRefs(useDragStore())


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
  if(canDrag.value){
    return 'pink'
  }
  if (props.reservationInfo.overTime) {
    return 'red-darken-3'
  } else if (checkedIn.value) {
    return 'green-darken-3'
  } else if (props.reservationInfo.haveOverlap) {
    return 'yellow-darken-3'
  }else if(cancelled.value){
    return 'grey-darken-3'
  }
  return 'white'
})
const variants = computed(() => {
  if (props.reservationInfo.overTime) {
    return 'flat'
  } else if (checkedIn.value) {
    return 'flat'
  } else if (props.reservationInfo.haveOverlap) {
    return 'flat'
  }
  return 'flat'
})
const canDrag = computed(() => {
  return draggableItemId.value === props.reservationInfo.id
})

function tryUnlock(e) {
  e.preventDefault()
  e.stopPropagation()
  if (!checkedIn.value) {
    console.log('unlock', props.reservationInfo.id)
    dragController.startDrag(props.reservationInfo.id)
  }
  return false
}

function stopDrag(...args) {
  dragController.stopDrag()
  emit('dragStop', ...args)
}

</script>

<style scoped>
div{
  user-select: none;
  overscroll-behavior: none;
}

.gradient {
  background: #3a7bd5; /* fallback for old browsers */
  background: linear-gradient(to right bottom, rgba(0, 0, 0, .56), #341d33);
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.complete {
  background: #3a7bd5; /* fallback for old browsers */
  background: linear-gradient(to right bottom, rgba(11, 84, 24, 0.48), rgba(18, 132, 38, 0.48));
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
</style>
