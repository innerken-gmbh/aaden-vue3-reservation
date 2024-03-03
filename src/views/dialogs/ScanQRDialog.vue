<script setup>
import {useScanQrStore} from "../../dataLayer/repository/reservationRepo.js";
import {QrcodeStream} from 'vue-qrcode-reader'
import PlaceHolder from "../components/PlaceHolder.vue";
import BaseDialog from "../components/BaseDialog.vue";

const controller = useScanQrStore()


function onDetect(e) {
  controller.paused = true
  console.log(e, 'event')
  const value = e?.[0].rawValue
  console.log(value)
  try {
    const info = JSON.parse(value.replace('id', '"id"'))
    if (info.id) {
      controller.confirm(info)
    } else {
      controller.error = true
    }
  } catch (e) {
    controller.error = true
  }

}

</script>

<template>
  <base-dialog
    v-model="controller.showPicker"
  >
    <template #header>
      <div>
        <div>
          {{ $t('ScanQR') }}
        </div>
        <div class="text-body-2">
          {{ $t('ScanQROnConformationMail') }}
        </div>
      </div>
      <v-spacer />
      <v-icon>mdi-qrcode</v-icon>
    </template>
    <template #default>
      <div>
        <template v-if="controller.error">
          <place-holder :hint="$t('QRisNotValid')">
            <v-btn
              @click="controller.rescan()"
              class="mt-4"
              color="primary"
            >
              <template #prepend>
                <v-icon>mdi-refresh</v-icon>
              </template>
              {{ $t('Retry') }}
            </v-btn>
          </place-holder>
        </template>
        <qrcode-stream
          v-else
          :paused="controller.paused"
          @detect="onDetect"
        />
      </div>
    </template>
  </base-dialog>
</template>

<style scoped>

</style>
