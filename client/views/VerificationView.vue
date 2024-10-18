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

const verificationStore = useVerificationStore();
const { status } = verificationStore;
const isLoading = ref(true);

async function fetchVerificationStatus() {
  await verificationStore.fetchStatus();
  isLoading.value = false;
}

onMounted(() => {
  fetchVerificationStatus();
});
</script>

<style scoped>
.verification-view {
  padding: 1rem;
}

h1 {
  margin-top: 0;
}
</style>
