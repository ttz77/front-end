<!-- src/views/EndorseView.vue -->

<template>
  <div class="endorse-view">
    <h1>Endorsements for {{ targetUsername }}</h1>
    <EndorseComponent :username="targetUsername" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import EndorseComponent from "@/components/Endorsing/EndorseComponent.vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user"; // Assuming you have a user store

const route = useRoute();
const userStore = useUserStore();

// Fetch the username from the route params or other sources
const targetUsername = ref("");

// Example: If the route is defined with a param 'username'
onMounted(() => {
  targetUsername.value = (route.params.username as string) || userStore.currentUsername;
  console.log("Target Username:", targetUsername.value); // Debugging
});
</script>

<style scoped>
.endorse-view {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
</style>
