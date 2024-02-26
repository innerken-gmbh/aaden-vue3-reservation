<script setup>
import BaseDialog from "../components/BaseDialog.vue";
import {useNotificationStore} from "../../dataLayer/repository/homeController.js";
import {onMounted} from "vue";
import {toBeautiful} from "../../dataLayer/repository/dateRepo.js";

const controller = useNotificationStore()

onMounted(() => {
  controller.reload()
})

</script>

<template>
  <base-dialog
    v-model="controller.show"
  >
    <template #header>
      <div>
        <div>
          {{ $t('Notifications') }}
        </div>
        <div class="text-body-2">
          last update:{{ controller.lastUpdateTime }}
        </div>
      </div>
      <v-spacer />

      <v-btn
        icon=""
        @click="controller.readAllNotification()"
        color="white"
      >
        <v-icon size="36">
          mdi-check-all
        </v-icon>
      </v-btn>
      <v-btn
        @click="controller.reload()"
        icon=""
        color="white"
      >
        <v-icon size="36">
          mdi-refresh
        </v-icon>
      </v-btn>
    </template>
    <template #default>
      <div v-if="!controller.loading">
        <v-card
          elevation="0"
          color="surface-lighten-1"
          class="pa-4 mb-2"
          v-for="e in controller.eventList"
          :key="e.id"
        >
          <div class="d-flex align-center">
            <div>
              <div class="text-body-2">
                {{ toBeautiful(e.createdAt) }}
              </div>

              <div class="text-body-1 font-weight-black">
                {{ e.eventType }}
              </div>


              <div class="text-body-2">
                {{ e.createdUser }}
              </div>
            </div>
            <v-spacer />
            <v-btn
              @click="controller.readNotification(e.id)"
              icon=""
              v-if="!e.checked"
            >
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </div>
        </v-card>
      </div>
      <div
        v-else
        style="width: 100%"
        class="py-16 d-flex align-center justify-center"
      >
        <v-progress-circular indeterminate />
      </div>
    </template>
  </base-dialog>
</template>

<style scoped>

</style>
