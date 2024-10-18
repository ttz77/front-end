<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Profile Page</h1>
    <li v-if="isLoggedIn">
      <RouterLink :to="{ name: 'Verification' }" :class="{ underline: currentRouteName === 'Verification' }"> Verification </RouterLink>
    </li>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
