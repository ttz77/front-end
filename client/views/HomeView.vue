<script setup lang="ts">
import EventListComponent from "@/components/Post/EventListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <router-link to="/posts" custom v-slot="{ navigate }">
      <button @click="navigate" role="link">Create an Event!</button>
    </router-link>
    <EventListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

button {
  display: block;
  margin: 2rem auto; /* Center the button horizontally */
  padding: 1rem 2rem; /* Make the button larger */
  font-size: 1.25rem; /* Increase the font size */
  background-color: #ffb6c1; /* Slightly darker pink background */
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

button:hover {
  background-color: #ff8aa5; /* Darker pink on hover */
}
</style>
