<script setup>

import {computed, nextTick, ref, watch} from "vue";

defineProps({
  headerColor: {
    default: () => 'primary',
    type: String
  },
  showAction: {
    type: Boolean,
    default: true
  }
})
const show = defineModel({type: Boolean})

const action = ref(null)
const childCount = ref(0)
watch(show, (val) => {
  if (val) {
    nextTick(() => {
      childCount.value = action.value.childElementCount

    })
  }
})

const actionClass = computed(() => {
  return childCount.value > 1 ? 'd-flex flex-column align-stretch mt-8' : childCount.value > 0 ? 'mt-8' : ''
})
</script>

<template>
  <v-dialog
    v-model="show"
    max-width="500px"
  >
    <v-card rounded="xl">
      <v-card
        rounded="0"
        class="text-h4 d-flex  align-center font-weight-black pa-6"
        :color="headerColor"
      >
        <slot name="header" />
      </v-card>
      <v-card
        class="pa-6"
      >
        <slot />
        <div
          style="width: 100%"
          v-if="showAction"
          ref="action"
          :class="actionClass"
        >
          <slot name="action" />
        </div>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
