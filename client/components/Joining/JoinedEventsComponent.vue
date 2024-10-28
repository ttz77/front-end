<!-- src/components/JoinedEventsComponent.vue -->

<template>
  <section class="joined-events">
    <h2>Your Joined Events:</h2>
    <div v-if="isLoading">
      <p>Loading your joined events...</p>
    </div>
    <div v-else>
      <ul v-if="joinedEventsDetails.length > 0">
        <li v-for="event in joinedEventsDetails" :key="event._id">
          <p>{{ event.content }}</p>
          <button @click="handleLeaveEvent(event._id)" :disabled="isProcessing.includes(event._id)">Leave Event</button>
        </li>
      </ul>
      <p v-else>You have not joined any events yet.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useEventsStore } from "@/stores/events";
import { useToastStore } from "@/stores/toast"; // Assuming you have a toast store
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";

const eventsStore = useEventsStore();
const toastStore = useToastStore();
const { joinedEvents } = storeToRefs(eventsStore);

const isLoading = ref(true);
const joinedEventsDetails = ref<Array<Record<string, string>>>([]);
const isProcessing = ref<Array<string>>([]); // Track processing event IDs

/**
 * Fetches detailed information about joined events.
 */
async function fetchJoinedEventsDetails() {
  if (joinedEvents.value.length === 0) {
    joinedEventsDetails.value = [];
    return;
  }

  try {
    // Assuming your backend has an endpoint to fetch multiple events by IDs
    const response = await fetchy("/api/events/multiple", "GET", {
      query: { ids: joinedEvents.value.join(",") },
    });
    console.log("Response from /api/events/multiple:", response);
    joinedEventsDetails.value = response.events;
  } catch (error) {
    console.error("Failed to fetch joined events details:", error);
    toastStore.showToast({ message: "Failed to load your joined events.", style: "error" });
  }
}

/**
 * Handles leaving an event.
 * @param eventId - The ID of the event to leave.
 */
async function handleLeaveEvent(eventId: string) {
  isProcessing.value.push(eventId); // Add to processing
  try {
    await eventsStore.leaveEvent(eventId);
    toastStore.showToast({ message: "Successfully left the event.", style: "success" });
    // Remove the event from details
    joinedEventsDetails.value = joinedEventsDetails.value.filter((event) => event._id !== eventId);
  } catch (error: any) {
    toastStore.showToast({ message: "Failed to leave the event.", style: "error" });
  } finally {
    isProcessing.value = isProcessing.value.filter((id) => id !== eventId); // Remove from processing
  }
}

/**
 * Fetches joined events and their details on component mount.
 */
onMounted(async () => {
  await eventsStore.fetchJoinedEvents(); // Ensure joinedEvents are fetched
  await fetchJoinedEventsDetails(); // Fetch detailed info
  isLoading.value = false;
});

/**
 * Watches for changes in joinedEvents to update joinedEventsDetails accordingly.
 */
watch(joinedEvents, async (newJoinedEvents, oldJoinedEvents) => {
  await fetchJoinedEventsDetails();
});
</script>

<style scoped>
.joined-events {
  padding: 1rem;
  max-width: 60em;
  margin: 0 auto;
}

h2 {
  margin-bottom: 1rem;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: var(--base-bg);
  border-radius: 1em;
  padding: 1em;
  margin-bottom: 1em;
}

button {
  display: block; /* Make the button take up the full width of the container for centering */
  margin: 1rem auto 0 auto; /* Center the button horizontally */
  padding: 0.5rem 1rem;
  background-color: #c3aed6; /* Pastel lavender background */
  color: white;
  border: none;
  border-radius: 12px; /* Make the corners rounded */
  cursor: pointer;
}

button:hover {
  background-color: #b095c9; /* Slightly darker lavender on hover */
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>
