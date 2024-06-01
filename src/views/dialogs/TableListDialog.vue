<script setup>
import {useReservationStore, useTableSelectorStore} from "../../dataLayer/repository/reservationRepo.js";
import BaseDialog from "../components/BaseDialog.vue";

const controller = useTableSelectorStore()
const tables = useReservationStore()

</script>

<template>
  <base-dialog
    v-model="controller.showPicker"
  >
    <template #header>
      <div>
        <div>
          {{ $t('选择桌子') }}
        </div>
        <div class="text-body-2">
          {{ $t('请选择' + controller.neededTableCount + '个新的桌子') }}
        </div>
      </div>
      <v-spacer />
    </template>
    <template #default>
      <div style="display: grid;grid-template-columns: repeat(6,minmax(0,1fr));grid-gap: 12px;">
        <v-card
          variant="flat"
          @click="controller.toggle(t.tableId)"
          :color="controller.result.includes(t.tableId)?'white':'transparent'"
          class="pa-4 d-flex align-center justify-center font-weight-black"
          :key="t.id"
          v-for="t in tables.tableList"
        >
          {{ t.tableName }}
        </v-card>
      </div>
      <v-btn
        @click="controller.confirm"
        :disabled="controller.result.length!==controller.neededTableCount"
        class="mt-8"
        color="white"
        block
      >
        确认
      </v-btn>
    </template>
  </base-dialog>
</template>

<style scoped>

</style>
