<template>
  <main>
    <h1>Profile Page</h1>
    <ul>
      <li v-if="isLoggedIn">
        <RouterLink :to="{ name: 'Verification' }" :class="{ underline: currentRouteName === 'Verification' }" class="verification-button"> Verification </RouterLink>
      </li>
      <!-- Admin Button: Visible Only to Admin Users -->
      <li v-if="isAdmin">
        <RouterLink :to="{ name: 'AdminVerificationDashboard' }" :class="{ underline: currentRouteName === 'AdminVerificationDashboard' }"> Admin Verification Dashboard </RouterLink>
      </li>
      <!-- Endorse Users Button: Visible Only to Logged-in Users -->
      <li v-if="isLoggedIn">
        <RouterLink :to="{ name: 'Endorse' }" :class="{ underline: currentRouteName === 'Endorse' }" class="endorse-button"> Endorse Users </RouterLink>
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
  text-align: center;
}

li {
  margin: 1rem 0; /* Increase vertical spacing between buttons */
}

.underline {
  text-decoration: underline;
}

/* Button Styles */
.verification-button {
  padding: 1rem 2rem;
  background-color: #dc3545;
  border: none;
  border-radius: 6px;
  color: #333;
  cursor: pointer;
  text-decoration: none;
  font-size: 1.2rem; /* Increase font size */
  margin-bottom: 1rem; /* Additional spacing between buttons */
  display: inline-block;
}

.endorse-button {
  padding: 1rem 2rem; /* Increase padding for larger button size */
  background-color: #e6ccff; /* pastel purple */
  border: none;
  border-radius: 6px;
  color: #333;
  cursor: pointer;
  text-decoration: none;
  font-size: 1.2rem; /* Increase font size */
  margin-top: 1rem; /* Additional spacing between buttons */
  display: inline-block;
}

button {
  cursor: pointer;
}
</style>
