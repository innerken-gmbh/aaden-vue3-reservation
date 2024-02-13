<script setup>

import {computed, nextTick, ref, watch} from "vue";
import {useDisplay} from "vuetify";

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
const {xs} = useDisplay()
const action = ref(null)
const childCount = ref(0)
watch(show, (val) => {
  if (val) {
    nextTick(() => {
      childCount.value = action.value.childElementCount

    })
  }
})

</script>

<template>
  <v-dialog
    :fullscreen="xs"
    v-model="show"
    max-width="500px"
  >
    <v-card
      :rounded="xs?0:'xl'"
    >
      <div style="max-height: 100vh;overflow-y: scroll">
        <v-card
          rounded="0"
          class="text-h4 d-flex  align-center font-weight-black pa-6"
          :color="headerColor"
        >
          <slot name="header" />
          <v-icon
            @click="show=false"
            size="36"
            class="ml-4"
          >
            mdi-close
          </v-icon>
        </v-card>
        <v-card
          class="pa-6"
        >
          <slot />
          <div
            style="width: 100%"
            v-if="showAction"
            ref="action"
            class="mt-4 d-flex flex-column"
          >
            <slot name="action" />
          </div>
        </v-card>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
