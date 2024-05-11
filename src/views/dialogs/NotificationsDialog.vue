<script setup>
import BaseDialog from "../components/BaseDialog.vue";
import {useNotificationStore} from "../../dataLayer/repository/homeController.js";
import {onMounted} from "vue";
import EventLogListItem from "../items/EventLogListItem.vue";

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
          {{ $t('LastUpdate') }}:{{ controller.lastUpdateTime }}
        </div>
      </div>
      <v-spacer />

      <v-btn
        icon=""
        @click="controller.readAllNotification()"
        color="white"
      >
        <v-icon>
          mdi-check-all
        </v-icon>
      </v-btn>
      <v-btn
        @click="controller.reload()"
        icon=""
        color="white"
      >
        <v-icon>
          mdi-refresh
        </v-icon>
      </v-btn>
    </template>
    <template #default>
      <div v-if="!controller.loading">
        <v-lazy
          :min-height="200"
          v-for="e in controller.eventList"
          :key="e.id"
        >
          <event-log-list-item
            :info="e"
          />
        </v-lazy>
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
