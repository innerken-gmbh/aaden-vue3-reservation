<script setup>
defineProps(['title','icon','hint'])

</script>

<template>
  <div
    style="height: 400px;width: 100%"
    class="d-flex align-center justify-center flex-column"
  >
    <v-icon size="64">
      {{ icon || 'mdi-heart-broken' }}
    </v-icon>
    <div class="mt-4 text-body-1 font-weight-black">
      {{ title|| $t('Oops') }}
    </div>
    <div class="text-body-2 mt-1">
      {{ hint }}
    </div>
    <slot />
  </div>
</template>

<style scoped>

</style>
