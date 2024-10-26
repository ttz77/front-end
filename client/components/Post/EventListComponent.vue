<!-- src/components/EventListComponent.vue -->

<template>
  <div class="row">
    <h2 v-if="!searchAuthor">Events coming up:</h2>
    <h2 v-else>Posts by {{ searchAuthor }}:</h2>
    <SearchPostForm @getPostsByAuthor="getPosts" />
  </div>

  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
      <EditPostForm v-else :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />

      <!-- Join/Leave Event Button -->
      <button v-if="!joinedEvents.includes(post._id)" @click="handleJoinEvent(post._id)" :disabled="isProcessing.includes(post._id)">Join Event</button>
      <button v-else @click="handleLeaveEvent(post._id)" :disabled="isProcessing.includes(post._id)">Leave Event</button>
    </article>
  </section>

  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<script setup lang="ts">
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useEventsStore } from "@/stores/events";
import { useToastStore } from "@/stores/toast"; // Assuming you have a toast store
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchPostForm from "./SearchPostForm.vue";

const eventsStore = useEventsStore();
const toastStore = useToastStore();
const { joinedEvents } = storeToRefs(eventsStore);

const loaded = ref(false);
const posts = ref<Array<Record<string, string>>>([]);
const editing = ref("");
const searchAuthor = ref("");
const isProcessing = ref<Array<string>>([]); // Track processing event IDs

/**
 * Fetches posts, optionally filtered by author.
 * @param author - The username to filter posts by.
 */
async function getPosts(author?: string) {
  const query: Record<string, string> = author !== undefined ? { author } : {};
  try {
    const postResults = await fetchy("/api/posts", "GET", { query });
    searchAuthor.value = author ? author : "";
    posts.value = postResults;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    toastStore.showToast({ message: "Failed to fetch posts.", style: "error" });
  }
}

/**
 * Updates the current editing post ID.
 * @param id - The ID of the post being edited.
 */
function updateEditing(id: string) {
  editing.value = id;
}

/**
 * Handles joining an event.
 * @param eventId - The ID of the event to join.
 */
async function handleJoinEvent(eventId: string) {
  isProcessing.value.push(eventId); // Add to processing
  try {
    await eventsStore.joinEvent(eventId);
    toastStore.showToast({ message: "Successfully joined the event!", style: "success" });
  } catch (error: any) {
    toastStore.showToast({ message: "Failed to join the event.", style: "error" });
  } finally {
    isProcessing.value = isProcessing.value.filter((id) => id !== eventId); // Remove from processing
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
  } catch (error: any) {
    toastStore.showToast({ message: "Failed to leave the event.", style: "error" });
  } finally {
    isProcessing.value = isProcessing.value.filter((id) => id !== eventId); // Remove from processing
  }
}

/**
 * Fetches posts and joined events before mounting the component.
 */
onBeforeMount(async () => {
  await getPosts();
  await eventsStore.fetchJoinedEvents(); // Fetch joined events from the store
  loaded.value = true;
});
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}

button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #6c757d;
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
