<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav>
      <div class="title">
        <img src="@/assets/images/logo.svg" />
        <RouterLink :to="{ name: 'Home' }">
          <h1>SafeCircle</h1>
        </RouterLink>
      </div>
      <ul>
        <li>
          <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }"> Settings </RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <main>
    <RouterView />
  </main>

  <!-- Bottom Navigation Bar -->
  <nav class="bottom-nav">
    <ul>
      <li>
        <RouterLink :to="{ name: 'Home' }" :class="{ active: currentRouteName === 'Home' }">
          <span aria-hidden="true">🏠</span>
          <span class="visually-hidden">Home</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'Browse' }" :class="{ active: currentRouteName === 'Browse' }">
          <span aria-hidden="true">🔍</span>
          <span class="visually-hidden">Browse</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'Plans' }" :class="{ active: currentRouteName === 'Plans' }">
          <span aria-hidden="true">📅</span>
          <span class="visually-hidden">Plans</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'Profile' }" :class="{ active: currentRouteName === 'Profile' }">
          <span aria-hidden="true">👤</span>
          <span class="visually-hidden">Profile</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
@import "./assets/toast.css";

/* Top navigation */
nav {
  padding: 1em 2em;
  background-color: #b3d9ff; /* Pastel blue */
  display: flex;
  align-items: center;
}

h1 {
  font-size: 2em;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: black;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.underline {
  text-decoration: underline;
}

/* Bottom navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #b3d9ff; /* Pastel blue */
}

.bottom-nav ul {
  display: flex;
  justify-content: space-around; /* Adjusted to evenly space the icons */
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
  width: 100%;
}

.bottom-nav li {
  text-align: center;
  flex: 1;
}

.bottom-nav a {
  color: #2c3e50;
  text-decoration: none;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.active {
  text-decoration: underline;
}

/* Adjust main content to prevent overlap with bottom nav */
main {
  padding-bottom: 60px; /* Adjust this value if needed */
}
</style>
