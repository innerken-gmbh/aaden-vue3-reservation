<script setup>
import { ref, computed, watch } from "vue";
import BaseDialog from "../components/BaseDialog.vue";
import { useReservationStore } from "../../dataLayer/repository/reservationRepo.js";
import { updateReservationInfo } from "../../dataLayer/api/reservationApi.js";
import {useHomePageControllerStore} from "../../dataLayer/repository/homeController.js";

const controller = useReservationStore();
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  reservationInfo: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  tel: '',
  note: ''
});

// Initialize form data when dialog opens
function initFormData() {
  formData.value = {
    firstName: props.reservationInfo.firstName || '',
    lastName: props.reservationInfo.lastName || '',
    email: props.reservationInfo.email || '',
    tel: props.reservationInfo.tel || '',
    note: props.reservationInfo.note || ''
  };
}

// Watch for dialog opening to initialize data
watch(() => showDialog.value, (newVal) => {
  if (newVal) {
    initFormData();
  }
});
const homeController = useHomePageControllerStore()
// Save changes
async function saveChanges() {
  controller.loading = true;
  try {
    Object.assign(props.reservationInfo, formData.value);
    await updateReservationInfo(props.reservationInfo);
    // Refresh the HomePage data after saving changes
    await controller.reload();
    showDialog.value = false;
  } catch (error) {
    console.error("Failed to update reservation info:", error);
  } finally {
    controller.loading = false;
  }
}
</script>

<template>
  <base-dialog
    v-model="showDialog"
    :header-color="'primary'"
    :show-action="true"
  >
    <template #header>
      <div>
        <div>
          {{ $t('FillUpInformation') }}
        </div>
        <div class="text-body-2">
          #{{ props.reservationInfo?.id }}
        </div>
      </div>
      <v-spacer />
    </template>

    <v-form @submit.prevent="saveChanges">
      <v-container>
        <v-row>
          <v-col cols="12"
sm="6">
            <v-text-field
              v-model="formData.firstName"
              :label="$t('FirstName')"
              required
              outlined
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12"
sm="6">
            <v-text-field
              v-model="formData.lastName"
              :label="$t('LastName')"
              required
              outlined
              dense
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="formData.email"
              :label="$t('Email')"
              type="email"
              outlined
              dense
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="formData.tel"
              :label="$t('Phone')"
              outlined
              dense
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="formData.note"
              :label="$t('Note')"
              outlined
              dense
              auto-grow
              rows="3"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <template #action>
      <v-btn
        :loading="controller.loading"
        @click="showDialog = false"
        color="grey"
        variant="outlined"
        block
        class="mb-2"
      >
        {{ $t('Cancel') }}
      </v-btn>
      <v-btn
        :loading="controller.loading"
        @click="saveChanges"
        color="primary"
        block
      >
        <template #prepend>
          <v-icon>mdi-content-save</v-icon>
        </template>
        {{ $t('Save') }}
      </v-btn>
    </template>
  </base-dialog>
</template>

<style scoped>
</style>
