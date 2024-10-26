// src/stores/events.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchy } from "@/utils/fetchy";

export const useEventsStore = defineStore("events", () => {
  const joinedEvents = ref<Array<string>>([]); // Initialize as empty array

  /**
   * Fetches the list of events the current user has already joined.
   */
  async function fetchJoinedEvents(): Promise<void> {
    try {
      const response = await fetchy("/api/users/current/events", "GET");
      joinedEvents.value = response.joinedEvents; // Ensure this matches the backend response
    } catch (error) {
      console.error("Failed to fetch joined events:", error);
      joinedEvents.value = []; // Reset to empty if fetch fails
    }
  }

  /**
   * Allows the user to join an event.
   * @param eventId - The ID of the event to join.
   */
  async function joinEvent(eventId: string): Promise<void> {
    try {
      const response = await fetchy(`/api/events/${eventId}/join`, "POST");
      if (response.msg === "Successfully joined the event.") {
        if (!joinedEvents.value.includes(eventId)) {
          joinedEvents.value.push(eventId);
        }
      }
      // Optionally, handle success notification
    } catch (error: any) {
      console.error("Failed to join event:", error);
      // Optionally, handle error notification
      throw error; // Re-throw to allow component to handle it
    }
  }

  /**
   * Allows the user to leave an event.
   * @param eventId - The ID of the event to leave.
   */
  async function leaveEvent(eventId: string): Promise<void> {
    try {
      const response = await fetchy(`/api/events/${eventId}/join`, "DELETE");
      if (response.msg === "Successfully left the event.") {
        joinedEvents.value = joinedEvents.value.filter((id) => id !== eventId);
      }
      // Optionally, handle success notification
    } catch (error: any) {
      console.error("Failed to leave event:", error);
      // Optionally, handle error notification
      throw error; // Re-throw to allow component to handle it
    }
  }

  return {
    joinedEvents,
    fetchJoinedEvents,
    joinEvent,
    leaveEvent,
  };
});
