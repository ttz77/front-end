<!-- client/views/SettingsView.vue -->
<template>
  <main class="column">
    <h1>Settings for {{ currentUsername }}</h1>
    <button class="pure-button pure-button-primary" @click="logout">Logout</button>
    <button class="button-error pure-button" @click="delete_">Delete User</button>
    <UpdateUserForm />

    <!-- New Button to Navigate to Location Sharing -->
    <button class="pure-button pure-button-secondary" @click="goToLocationSharing" v-if="isLoggedIn">Manage Location Sharing</button>
  </main>
</template>

<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const userStore = useUserStore();
const { currentUsername, isLoggedIn } = storeToRefs(userStore);
const { logoutUser, deleteUser } = userStore;

async function logout() {
  await logoutUser();
  void router.push({ name: "Home" });
}

async function delete_() {
  await deleteUser();
  void router.push({ name: "Home" });
}

/**
 * Navigates to the LocationSharingView.
 */
function goToLocationSharing() {
  void router.push({ name: "LocationSharing" });
}
</script>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.pure-button-secondary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.pure-button-secondary:hover {
  background-color: #0056b3;
}
</style>
