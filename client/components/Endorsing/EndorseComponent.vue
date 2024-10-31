<template>
  <div class="endorse-component">
    <h2>Endorse a User</h2>
    <form @submit.prevent="handleEndorse">
      <div class="form-group">
        <label for="endorseUsername">Username:</label>
        <input type="text" id="endorseUsername" v-model="endorseUsername" required placeholder="Enter the username to endorse" />
      </div>

      <div class="form-group">
        <label for="skill">Skill:</label>
        <input type="text" id="skill" v-model="skill" required placeholder="Enter the skill to endorse" />
      </div>

      <button type="submit" :disabled="isSubmitting" class="lavender-button">
        {{ isSubmitting ? "Endorsing..." : "Endorse" }}
      </button>
    </form>

    <div class="existing-endorsements">
      <h3>Existing Endorsements for {{ targetUsername }}</h3>
      <div v-if="isLoading">
        <p>Loading endorsements...</p>
      </div>
      <div v-else>
        <ul v-if="endorsementsForTargetUser.length > 0">
          <li v-for="endorsement in endorsementsForTargetUser" :key="endorsement">
            <p>{{ endorsement }}</p>
            <hr />
          </li>
        </ul>
        <p v-else>No endorsements yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { useEndorsementsStore } from "@/stores/endorsements";
import { useToastStore } from "@/stores/toast";
import { defineProps } from "vue";
import { useUserStore } from "@/stores/user";

// Define props
const props = defineProps<{
  username: string; // The target username whose endorsements are being viewed
}>();

// Access user store to get the current logged-in user
const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);

// Define refs
const targetUsername = ref(props.username || ""); // Username whose endorsements are viewed
const endorseUsername = ref(""); // Username to endorse via the form
const skill = ref(""); // Skill to endorse

const isSubmitting = ref(false);

// Access endorsements store
const endorsementsStore = useEndorsementsStore();
const { endorsements, isLoading } = storeToRefs(endorsementsStore);

// Access toast store for notifications
const toastStore = useToastStore();

/**
 * Computed property to get endorsements for the target user
 */
const endorsementsForTargetUser = computed(() => endorsements.value[targetUsername.value] || []);

/**
 * Handle endorsement submission.
 */
const handleEndorse = async () => {
  if (!endorseUsername.value || !skill.value) {
    toastStore.showToast({
      message: "Please provide both username and skill.",
      style: "error",
    });
    return;
  }

  // Prevent self-endorsement
  if (endorseUsername.value === currentUsername.value) {
    toastStore.showToast({
      message: "You cannot endorse yourself.",
      style: "error",
    });
    return;
  }

  isSubmitting.value = true;
  try {
    await endorsementsStore.endorseUser(endorseUsername.value, skill.value);
    toastStore.showToast({
      message: `Successfully endorsed ${endorseUsername.value} for ${skill.value}.`,
      style: "success",
    });
    // Clear input fields after successful endorsement
    endorseUsername.value = "";
    skill.value = "";

    // Refetch endorsements for the target user
    if (targetUsername.value) {
      await endorsementsStore.fetchEndorsements(targetUsername.value);
    }
  } catch (error: any) {
    toastStore.showToast({
      message: error.message || "Failed to endorse the user.",
      style: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Fetch existing endorsements on component mount and whenever the targetUsername changes.
 */
onMounted(async () => {
  if (targetUsername.value) {
    await endorsementsStore.fetchEndorsements(targetUsername.value);
    console.log("Fetched endorsements on mount:", endorsementsForTargetUser.value); // Debugging
  }
});

/**
 * Watch the 'username' prop for changes and fetch endorsements accordingly.
 */
watch(
  () => props.username,
  async (newUsername, oldUsername) => {
    if (newUsername) {
      targetUsername.value = newUsername;
      await endorsementsStore.fetchEndorsements(newUsername);
      console.log("Fetched endorsements on username change:", endorsementsForTargetUser.value); // Debugging
    } else {
      // Clear endorsements for the target user
      endorsements.value[targetUsername.value] = [];
      targetUsername.value = "";
      console.log("No username provided, cleared endorsements.");
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.endorse-component {
  background-color: #f0f0f0; /* Light grey background */
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  border-radius: 8px;
  border: none;
}

button {
  padding: 0.5rem 1rem;
  background-color: #c3aed6; /* Pastel lavender purple */
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

button:hover {
  background-color: #b095c9; /* Slightly darker lavender */
}

button[disabled] {
  background-color: #6c757d;
  cursor: not-allowed;
}

.existing-endorsements {
  margin-top: 2rem;
}

.existing-endorsements ul {
  list-style-type: none;
  padding: 0;
}

.existing-endorsements li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ccc;
}

.existing-endorsements button {
  background-color: #dc3545;
}

.existing-endorsements button:hover {
  background-color: #c82333;
}
</style>
