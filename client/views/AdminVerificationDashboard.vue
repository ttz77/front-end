<template>
  <div class="admin-dashboard">
    <h1>Admin Verification Dashboard</h1>
    <VerificationManagementComponent />
  </div>
</template>

<script setup lang="ts">
import VerificationManagementComponent from "@/components/Verification/VerificationManagementComponent.vue";
</script>

<style scoped>
.admin-dashboard {
  padding: 1rem;
}
</style>
