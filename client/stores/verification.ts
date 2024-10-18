import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchy } from "@/utils/fetchy";

type VerificationStatus = "verified" | "unverified" | "pending";

export const useVerificationStore = defineStore("verification", () => {
  const status = ref<VerificationStatus>("unverified");

  async function fetchStatus() {
    try {
      const response = await fetchy("/api/verifications/status", "GET");
      status.value = response.status;
    } catch (error) {
      console.error("Failed to fetch verification status:", error);
      status.value = "unverified";
    }
  }

  function setStatus(newStatus: VerificationStatus) {
    status.value = newStatus;
  }

  return {
    status,
    fetchStatus,
    setStatus,
  };
});
