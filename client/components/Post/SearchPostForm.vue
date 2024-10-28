<script setup lang="ts">
import { ref } from "vue";

const author = ref("");
const emit = defineEmits(["getPostsByAuthor"]);
</script>

<template>
  <form @submit.prevent="emit('getPostsByAuthor', author)" class="pure-form">
    <fieldset>
      <legend>Search by Author</legend>
      <input id="author" type="text" v-model="author" placeholder="Username" class="rounded-input" />
      <button type="submit" class="pure-button pure-button-primary rounded-button">Search</button>
    </fieldset>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}

.rounded-input {
  border-radius: 20px;
  padding: 0.5em;
  border: 1px solid #ccc;
}

.rounded-button {
  background-color: #99c1e0; /* Pastel blue */
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 0.5em 1em;
  cursor: pointer;
}

.rounded-button:hover {
  background-color: #85add0; /* Slightly darker pastel blue */
}
</style>
