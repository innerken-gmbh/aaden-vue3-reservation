<script setup>
import {useScanQrStore} from "../../dataLayer/repository/reservationRepo.js";
import {QrcodeStream} from 'vue-qrcode-reader'
import PlaceHolder from "../components/PlaceHolder.vue";

const controller = useScanQrStore()


function onDetect(e) {
  controller.paused = true
  console.log(e, 'event')
  const value = e?.[0].rawValue
  console.log(value)
  try {
    const info = JSON.parse(value.replace('remoteId', '"remoteId"').replace('batch', '"batch"'))
    if (info.batch && info.remoteId) {
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
  <v-dialog
    v-model="controller.showPicker"
    max-width="500px"
  >
    <v-card class="pa-6">
      <div class="text-h4 d-flex align-center font-weight-black">
        <div>
          <div>
            Scan Qr
          </div>
          <div class="text-body-2">
            Please scan the qrcode on the confirmation emails
          </div>
        </div>
        <v-spacer />
        <v-icon>mdi-qrcode</v-icon>
      </div>

      <v-card class="mt-4">
        <template v-if="controller.error">
          <place-holder :hint="' This QR code is not valid'">
            <v-btn
              @click="controller.rescan()"
              class="mt-4"
              color="white"
            >
              <template #prepend>
                <v-icon>mdi-refresh</v-icon>
              </template>
              Retry
            </v-btn>
          </place-holder>
        </template>
        <qrcode-stream
          v-else
          :paused="controller.paused"
          @detect="onDetect"
        />
      </v-card>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
