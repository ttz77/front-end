<template>
  <div class="verification-component">
    <h2>Submit Verification Document</h2>
    <form @submit.prevent="submitVerification" enctype="multipart/form-data">
      <div>
        <label for="verification-image">Upload Image:</label>
        <input type="file" id="verification-image" @change="handleFileUpload" accept="image/*" required />
      </div>
      <div v-if="previewImage">
        <h3>Preview:</h3>
        <img :src="previewImage" alt="Verification Preview" />
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

const file = ref<File | null>(null);
const previewImage = ref<string | null>(null);
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const verificationStore = useVerificationStore();

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
    // Generate a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file.value);
  }
}

async function submitVerification() {
  if (!file.value) {
    errorMessage.value = "Please select an image to upload.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  const formData = new FormData();
  formData.append("file", file.value);
  formData.append("method", "government_id");

  try {
    // Submit verification data to the backend
    const response = await fetchy("/api/verifications", "POST", {
      body: formData,
      headers: {}, // Let fetchy set Content-Type automatically for FormData
    });

    successMessage.value = response.msg || "Verification submitted successfully.";
    // Update verification status in the store
    verificationStore.setStatus("pending");
  } catch (error) {
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

input[type="file"] {
  margin-bottom: 1rem;
}

img {
  max-width: 100%;
  height: auto;
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
