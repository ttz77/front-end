import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { fetchy } from "@/utils/fetchy";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUsername = ref("");
    const role = ref<"admin" | "user" | null>(null); // Add role state

    const isLoggedIn = computed(() => currentUsername.value !== "");

    const resetStore = () => {
      currentUsername.value = "";
      role.value = null; // Reset role on logout or delete
    };

    const createUser = async (username: string, password: string) => {
      await fetchy("/api/users", "POST", {
        body: { username, password },
      });
    };

    const loginUser = async (username: string, password: string) => {
      await fetchy("/api/login", "POST", {
        body: { username, password },
      });
      await updateSession(); // Fetch session data after login
    };

    const updateSession = async () => {
      try {
        const { username, role: userRole } = await fetchy("/api/session", "GET", { alert: false });
        currentUsername.value = username;
        role.value = userRole; // Set the role
      } catch {
        resetStore();
      }
    };

    const logoutUser = async () => {
      await fetchy("/api/logout", "POST");
      resetStore();
    };

    const updateUserUsername = async (newUsername: string) => {
      await fetchy("/api/users/username", "PATCH", { body: { username: newUsername } });
      currentUsername.value = newUsername; // Update local state
    };

    const updateUserPassword = async (currentPassword: string, newPassword: string) => {
      await fetchy("/api/users/password", "PATCH", { body: { currentPassword, newPassword } });
    };

    const deleteUser = async () => {
      await fetchy("/api/users", "DELETE");
      resetStore();
    };

    // Computed property to check if the user is an admin
    const isAdmin = computed(() => role.value === "admin");

    return {
      currentUsername,
      role, // Expose role
      isLoggedIn,
      isAdmin, // Expose isAdmin
      createUser,
      loginUser,
      updateSession,
      logoutUser,
      updateUserUsername,
      updateUserPassword,
      deleteUser,
    };
  },
  { persist: true },
);
