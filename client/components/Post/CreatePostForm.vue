<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshPosts"]);

const createPost = async (content: string) => {
  try {
    await fetchy("/api/posts", "POST", {
      body: { content },
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createPost(content)">
    <label for="content">Event Details:</label>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Event</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}

button {
  width: fit-content; /* Make the button width fit the content */
  padding: 0.75rem 1.5rem; /* Adjust padding to make the button look balanced */
  background-color: #ffb6c1; /* Darker pastel pink background */
  color: white;
  border: none;
  border-radius: 12px; /* Add rounded corners */
  cursor: pointer;
  margin: 0 auto; /* Center the button horizontally */
}

button:hover {
  background-color: #ff8aa5; /* Darker pink on hover */
}
</style>
