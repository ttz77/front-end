// src/stores/endorsements.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchy } from "@/utils/fetchy"; // Ensure fetchy is correctly set up

export const useEndorsementsStore = defineStore("endorsements", () => {
  // Change endorsements to store endorsements per user
  const endorsements = ref<Record<string, string[]>>({}); // Mapping usernames to arrays of skills
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch endorsements for a specific user.
   * @param username - The username of the user whose endorsements to fetch.
   */
  async function fetchEndorsements(username: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetchy(`/api/users/${username}/endorsements`, "GET");
      console.log("Fetched endorsements response:", response); // Debugging

      // Store the endorsements under the specific username
      if (response.skills && typeof response.skills === "object") {
        endorsements.value[username] = Object.keys(response.skills);
        console.log(`Endorsements set in store for ${username}:`, endorsements.value[username]); // Debugging
      } else {
        endorsements.value[username] = [];
        console.warn("Unexpected skills format:", response.skills);
      }
    } catch (err: any) {
      console.error("Failed to fetch endorsements:", err);
      error.value = err.message || "Failed to fetch endorsements.";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Submit a new endorsement.
   * @param username - The username of the user to endorse.
   * @param skill - The skill to endorse.
   */
  async function endorseUser(username: string, skill: string): Promise<void> {
    try {
      const response = await fetchy(`/api/users/${username}/endorsements`, "POST", {
        body: { skill },
      });
      console.log("Endorse user response:", response); // Debugging

      // Refetch endorsements for the endorsed user
      await fetchEndorsements(username);
    } catch (err: any) {
      console.error("Failed to endorse user:", err);
      throw err; // Allow components to handle the error
    }
  }

  /**
   * Remove an endorsement.
   * @param username - The username of the user whose endorsement to remove.
   * @param skill - The skill endorsement to remove.
   */
  async function removeEndorsement(username: string, skill: string): Promise<void> {
    try {
      const encodedSkill = encodeURIComponent(skill);
      const response = await fetchy(`/api/users/${username}/endorsements?skill=${encodedSkill}`, "DELETE");
      console.log("Remove endorsement response:", response); // Debugging

      // Refetch endorsements for the user after removal
      await fetchEndorsements(username);
    } catch (err: any) {
      console.error("Failed to remove endorsement:", err);
      throw err; // Allow components to handle the error
    }
  }

  return {
    endorsements,
    isLoading,
    error,
    fetchEndorsements,
    endorseUser,
    removeEndorsement,
  };
});
