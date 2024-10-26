<template>
  <div class="verification-management">
    <div v-if="loading">Loading pending verifications...</div>
    <div v-else>
      <div v-if="pendingVerifications.length === 0">
        <p>No pending verifications.</p>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>Username</th>
            <th>Verification Data</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="verification in pendingVerifications" :key="verification.userID">
            <td>{{ verification.username }}</td>
            <td>{{ verification.data }}</td>
            <td>
              <button @click="approveVerification(verification.userID)">Approve</button>
              <button @click="rejectVerification(verification.userID)">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchy } from "@/utils/fetchy";

const pendingVerifications = ref<
  Array<{
    userID: string;
    username: string;
    data: string;
  }>
>([]);

const loading = ref(true);
const errorMessage = ref("");

async function fetchPendingVerifications() {
  try {
    loading.value = true;
    const response = await fetchy("/api/verifications/pending", "GET");
    pendingVerifications.value = response;
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to fetch pending verifications.";
  } finally {
    loading.value = false;
  }
}

async function approveVerification(userID: string) {
  try {
    await fetchy(`/api/verifications/${userID}/approve`, "PUT");
    // Remove the approved verification from the list
    pendingVerifications.value = pendingVerifications.value.filter((verification) => verification.userID !== userID);
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to approve verification.";
  }
}

async function rejectVerification(userID: string) {
  try {
    await fetchy(`/api/verifications/${userID}/reject`, "PUT");
    // Remove the rejected verification from the list
    pendingVerifications.value = pendingVerifications.value.filter((verification) => verification.userID !== userID);
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to reject verification.";
  }
}

onMounted(async () => {
  await fetchPendingVerifications();
});
</script>

<style scoped>
.verification-management {
  padding: 1rem;
}

.error {
  color: red;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  border: 1px solid #ccc;
  padding: 0.5rem;
}

th {
  background-color: #f5f5f5;
}

button {
  margin-right: 0.5rem;
}
</style>
