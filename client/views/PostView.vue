<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
</script>

<template>
  <main>
    <h1>Post an event!</h1>
    <CreatePostForm />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

main {
  margin: 0 3rem; /* Add 2rem of margin on both left and right sides */
}
</style>
