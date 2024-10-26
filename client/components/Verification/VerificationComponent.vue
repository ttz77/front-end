<!-- src/components/Verification/VerificationComponent.vue -->

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
        <input type="text" id="verification-data" v-model="verificationData" required :placeholder="placeholderText" />
      </div>
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? "Submitting..." : "Submit" }}
      </button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { fetchy } from "@/utils/fetchy";
import { useVerificationStore } from "@/stores/verification";
import { useToastStore } from "@/stores/toast"; // Assuming you have a toast store

const method = ref("government_id");
const verificationData = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const verificationStore = useVerificationStore();
const toastStore = useToastStore();

// Compute placeholder text based on selected verification method
const placeholderText = computed(() => {
  switch (method.value) {
    case "government_id":
      return "Enter your government ID number";
    // Add other cases for different verification methods
    default:
      return "Enter your verification data";
  }
});

/**
 * Submits the verification data to the backend.
 */
async function submitVerification(): Promise<void> {
  if (!verificationData.value.trim()) {
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
        method: method.value,
        data: verificationData.value.trim(),
      },
    });

    // Display success message
    successMessage.value = response.msg || "Verification submitted successfully.";
    toastStore.showToast({ message: successMessage.value, style: "success" });

    // Clear input fields
    verificationData.value = "";

    // Update verification status in the store by fetching the latest status
    await verificationStore.fetchStatus();
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to submit verification.";
    toastStore.showToast({ message: errorMessage.value, style: "error" });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.verification-component {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
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
