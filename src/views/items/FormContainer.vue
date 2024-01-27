<script setup>
defineProps(['label'])

</script>

<template>
  <div>
    <div class="d-flex">
      <div class="text-body-2">
        {{ label }}
      </div>
    </div>
    <div class="mt-1">
      <slot />
    </div>
  </div>
</template>

<style scoped>

</style>
