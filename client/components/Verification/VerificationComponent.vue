<template>
  <div class="verification-component">
    <h2>Submit Verification Information</h2>
    <form @submit.prevent="submitVerification">
      <div>
        <label for="verification-method">Verification Method:</label>
        <select id="verification-method" v-model="method" required>
          <option value="government_id">Government ID</option>
          <!-- Add other verification methods if applicable -->
        </select>
      </div>
      <div>
        <label for="verification-data">Verification Data:</label>
        <input type="text" id="verification-data" v-model="verificationData" required placeholder="Enter your government ID number" />
      </div>
      <button type="submit" :disabled="isSubmitting">Submit</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "@/utils/fetchy";
import { useVerificationStore } from "@/stores/verification";

const method = ref("government_id");
const verificationData = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const verificationStore = useVerificationStore();

async function submitVerification() {
  if (!verificationData.value) {
    errorMessage.value = "Please provide the required verification data.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    // Submit verification data to the backend
    const response = await fetchy("/api/verifications", "POST", {
      body: {
        data: verificationData.value,
      },
    });

    successMessage.value = response.msg || "Verification submitted successfully.";
    // Update verification status in the store
    verificationStore.setStatus("pending");
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to submit verification.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.verification-component {
  padding: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

button {
  display: block;
}

.error {
  color: red;
  margin-top: 1rem;
}

.success {
  color: green;
  margin-top: 1rem;
}
</style>
