// src/stores/verification.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchy } from "@/utils/fetchy";

type VerificationStatus = "verified" | "unverified" | "pending" | "error";

export const useVerificationStore = defineStore("verification", () => {
  const status = ref<VerificationStatus>("unverified");

  /**
   * Fetches the current verification status from the backend.
   */
  async function fetchStatus(): Promise<void> {
    try {
      const response = await fetchy("/api/verifications/status", "GET", { alert: false });
      // Ensure the response contains a valid status
      if (["verified", "unverified", "pending"].includes(response.status)) {
        status.value = response.status;
      } else {
        console.warn("Unknown verification status received:", response.status);
        status.value = "error";
      }
    } catch (error) {
      console.error("Failed to fetch verification status:", error);
      status.value = "error"; // Set to 'error' to indicate a fetching issue
    }
  }

  /**
   * Sets the verification status manually.
   * Note: It's generally better to fetch the status from the backend after changes.
   * @param newStatus - The new verification status.
   */
  function setStatus(newStatus: VerificationStatus): void {
    status.value = newStatus;
  }

  return {
    status,
    fetchStatus,
    setStatus,
  };
});
