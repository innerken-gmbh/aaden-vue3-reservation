<script setup>
import HomePage from './views/pages/HomePage.vue';
</script>

<template>
  <v-app>
    <v-app-bar
      dark
      flat
      color="grey-lighten-4"
    >
      <v-app-bar-nav-icon />
      <div class="flex-grow-1">
        <v-text-field
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
        />
      </div>
      <v-btn icon="">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn icon="">
        <v-icon>mdi-qrcode-scan</v-icon>
      </v-btn>
      <v-btn icon="">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <home-page />
    </v-main>
  </v-app>
</template>

<style scoped>
</style>
<style>
::-webkit-scrollbar {
  display: none;
}

body {
  user-select: none;
}
</style>
