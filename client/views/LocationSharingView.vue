<!-- client/views/LocationSharingView.vue -->
<template>
  <main class="location-sharing-view">
    <h1>Location Sharing</h1>
    <LocationSharingComponent />
  </main>
</template>

<script setup lang="ts">
import LocationSharingComponent from "@/components/LocationSharing/LocationSharingComponent.vue";
</script>

<style scoped>
.location-sharing-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}
</style>
