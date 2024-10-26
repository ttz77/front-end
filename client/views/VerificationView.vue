<!-- src/views/VerificationView.vue -->

<template>
  <section class="verification-view">
    <h1>Identity Verification</h1>
    <div v-if="isLoading">
      <p>Loading verification status...</p>
    </div>
    <div v-else>
      <div v-if="status === 'verified'">
        <p>Your identity has been verified. Thank you!</p>
      </div>
      <div v-else-if="status === 'pending'">
        <p>Your verification is pending approval. Please wait for an administrator to review your submission.</p>
      </div>
      <div v-else-if="status === 'error'">
        <p>There was an error fetching your verification status. Please try again later.</p>
      </div>
      <div v-else>
        <!-- Status is 'unverified' -->
        <p>You have not submitted verification yet.</p>
        <VerificationComponent />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useVerificationStore } from "@/stores/verification";
import VerificationComponent from "@/components/Verification/VerificationComponent.vue";
import { storeToRefs } from "pinia"; // Import storeToRefs
import { useToastStore } from "@/stores/toast"; // Assuming you have a toast store

const verificationStore = useVerificationStore();
const toastStore = useToastStore();
const { status } = storeToRefs(verificationStore); // Use storeToRefs for reactivity
const isLoading = ref(true);

/**
 * Fetches the current verification status and handles loading state.
 */
async function fetchVerificationStatus(): Promise<void> {
  try {
    await verificationStore.fetchStatus();
  } catch (error: any) {
    console.error("Failed to fetch verification status:", error);
    toastStore.showToast({ message: "Failed to fetch verification status.", style: "error" });
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await fetchVerificationStatus();
});
</script>

<style scoped>
.verification-view {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
</style>
