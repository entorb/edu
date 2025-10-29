<script setup lang="ts">
// Main app component - just renders the router
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
