<!-- src/views/Profile.vue -->

<template>
  <main>
    <h1>Profile Page</h1>
    <ul>
      <li v-if="isLoggedIn">
        <RouterLink :to="{ name: 'Verification' }" :class="{ underline: currentRouteName === 'Verification' }"> Verification </RouterLink>
      </li>
      <!-- Admin Button: Visible Only to Admin Users -->
      <li v-if="isAdmin">
        <RouterLink :to="{ name: 'AdminVerificationDashboard' }" :class="{ underline: currentRouteName === 'AdminVerificationDashboard' }"> Admin Verification Dashboard </RouterLink>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

// Access the user store
const userStore = useUserStore();
const { currentUsername, isLoggedIn, isAdmin } = storeToRefs(userStore);

// Access the current route
const route = useRoute();
const currentRouteName = computed(() => route.name as string);
</script>

<style scoped>
h1 {
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
}

.underline {
  text-decoration: underline;
}

button {
  cursor: pointer;
}
</style>
