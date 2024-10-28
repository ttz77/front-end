<template>
  <main class="column">
    <h1>Settings for {{ currentUsername }}</h1>
    <div class="right-align">
      <button class="pure-button pure-button-primary" @click="logout">Logout</button>
    </div>
    <button class="pure-button pastel-green-button" @click="goToLocationSharing" v-if="isLoggedIn">Manage Location Sharing</button>
    <div class="left-align">
      <UpdateUserForm />
    </div>

    <div class="right-align">
      <button class="button-error pure-button" @click="delete_">Delete User</button>
    </div>
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
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 16px;
}

.right-align {
  align-self: flex-end;
  width: 100%; /* Ensures the button aligns to the right within the container */
  text-align: right; /* Aligns the button to the right */
}

.left-align {
  align-self: flex-start;
  width: 100%;
}

button {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
}

.pure-button-primary {
  background-color: #99c1e0;
  color: white;
  border: none;
}

.pure-button-primary:hover {
  background-color: #85add0;
}

.pure-button-secondary {
  background-color: #6c63ff;
  color: white;
  border: none;
  font-size: 1.1rem;
  padding: 1rem 2rem;
}

.pure-button-secondary:hover {
  background-color: #524eb7;
}

.button-error {
  background-color: #dc3545;
  color: white;
  border: none;
}

.button-error:hover {
  background-color: #c82333;
}

/* New style for the pastel green button */
.pastel-green-button {
  background-color: #a8d5ba; /* pastel green */
  color: #333;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 12px;
}

.pastel-green-button:hover {
  background-color: #92c7a3; /* darker pastel green for hover */
}
</style>
