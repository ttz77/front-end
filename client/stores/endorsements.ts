// src/stores/endorsements.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchy } from "@/utils/fetchy"; // Ensure fetchy is correctly set up

export const useEndorsementsStore = defineStore("endorsements", () => {
  const endorsements = ref<string[]>([]); // Array of skill names
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

      // Transform the skills object into an array of skill names
      if (response.skills && typeof response.skills === "object") {
        endorsements.value = Object.keys(response.skills); // Assigning array of keys
        console.log("Endorsements set in store:", endorsements.value); // Debugging
      } else {
        // Handle unexpected data formats
        endorsements.value = [];
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

      // Refetch endorsements after successful endorsement
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
      // Encode the skill to ensure it's URL-safe
      const encodedSkill = encodeURIComponent(skill);

      // Append the skill as a query parameter
      const response = await fetchy(`/api/users/${username}/endorsements?skill=${encodedSkill}`, "DELETE");

      console.log("Remove endorsement response:", response); // Debugging

      // Refetch endorsements after successful removal
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
