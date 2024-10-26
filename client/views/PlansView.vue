<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import JoinedEventsComponent from "@/components/Joining/JoinedEventsComponent.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Events Signed Up:</h1>
    <JoinedEventsComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
