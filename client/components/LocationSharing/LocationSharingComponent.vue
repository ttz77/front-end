<!-- client/components/LocationSharingComponent.vue -->

<template>
  <div>
    <h2>Location Sharing</h2>

    <!-- Error Notification -->
    <div v-if="error" class="error-notification">
      <p>{{ error }}</p>
      <button class="btn-rounded btn-dismiss" @click="clearError">Dismiss</button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading-overlay">
      <p>Loading...</p>
    </div>

    <div>
      <p>
        Your location sharing is currently:
        <strong>{{ sharingEnabled ? "Enabled" : "Disabled" }}</strong>
      </p>
      <button @click="toggleSharing" :disabled="isLoading" :class="['btn-rounded', sharingEnabled ? 'btn-red' : 'btn-green']">{{ sharingEnabled ? "Disable" : "Enable" }} Location Sharing</button>
    </div>

    <div v-if="sharingEnabled">
      <p>
        You are currently
        <strong>{{ isSharingLocation ? "sharing" : "not sharing" }}</strong> your location.
      </p>
      <button class="btn-rounded btn-green" @click="updateLocation" :disabled="isLoading">Share/Update Location</button>
      <button class="btn-rounded btn-red" @click="stopSharingLocation" :disabled="!isSharingLocation || isLoading">Stop Sharing Location</button>
    </div>

    <div>
      <h3>Trusted Contacts</h3>
      <ul>
        <li v-for="contact in trustedContacts" :key="contact">
          {{ contact }}
          <button class="btn-rounded btn-red" @click="removeTrustedContact(contact)" :disabled="isLoading">Remove</button>
        </li>
      </ul>
      <input v-model="newContactUsername" placeholder="Username of new trusted contact" />
      <button class="btn-rounded btn-green" @click="addTrustedContact" :disabled="isLoading">Add Trusted Contact</button>
    </div>

    <div>
      <h3>Trusted Contacts' Locations</h3>
      <button class="btn-rounded btn-blue" @click="getTrustedContactsLocations" :disabled="isLoading">Refresh Locations</button>
      <ul>
        <li v-for="location in trustedContactsLocations" :key="location.username">
          {{ location.username }}: ({{ location.latitude }}, {{ location.longitude }}) at
          {{ formatTimestamp(location.timestamp) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useLocationSharingStore } from "@/stores/locationSharing";

export default defineComponent({
  name: "LocationSharingComponent",
  setup() {
    const store = useLocationSharingStore();
    const newContactUsername = ref("");

    // Destructure store properties using storeToRefs for reactivity
    const { sharingEnabled, trustedContacts, trustedContactsLocations, isSharingLocation, error, isLoading } = storeToRefs(store);

    // Actions
    const toggleSharing = async () => {
      if (store.sharingEnabled) {
        await store.disableLocationSharing();
      } else {
        await store.enableLocationSharing();
      }
    };

    const updateLocation = () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          await store.shareLocation(latitude, longitude);
        },
        (error) => {
          alert("Unable to retrieve your location");
          console.error(error);
        },
      );
    };

    const stopSharingLocation = async () => {
      await store.stopSharingLocation();
    };

    const addTrustedContact = async () => {
      if (newContactUsername.value.trim() === "") {
        alert("Please enter a username");
        return;
      }
      await store.addTrustedContact(newContactUsername.value.trim());
      newContactUsername.value = "";
    };

    const removeTrustedContact = async (username: string) => {
      await store.removeTrustedContact(username);
    };

    const getTrustedContactsLocations = async () => {
      await store.getTrustedContactsLocations();
    };

    const formatTimestamp = (timestamp: string) => {
      return new Date(timestamp).toLocaleString();
    };

    const clearError = () => {
      store.clearError();
    };

    onMounted(async () => {
      console.log("Store methods and properties:", store);
      console.log("Store Keys:", Object.keys(store));
      await store.getSharingStatus();
      await store.getTrustedContacts();
    });

    return {
      sharingEnabled,
      trustedContacts,
      trustedContactsLocations,
      isSharingLocation,
      error,
      isLoading,
      newContactUsername,
      toggleSharing,
      updateLocation,
      stopSharingLocation,
      addTrustedContact,
      removeTrustedContact,
      getTrustedContactsLocations,
      formatTimestamp,
      clearError,
    };
  },
});
</script>

<style scoped>
/* Styles for error notifications and loading overlays */
.error-notification {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-size: 1.5rem;
  color: #333;
}

/* Base styles for all buttons */
.btn-rounded {
  padding: 0.3rem 0.7rem;
  border-radius: 6px; /* Rounded corners for all buttons */
  border: none;
  cursor: pointer;
  color: white;
}

/* Add/Enable buttons (Pastel Green) */
.btn-green {
  background-color: #a8d5ba; /* Pastel green */
}

.btn-green:hover {
  background-color: #92c7a3; /* Slightly darker pastel green on hover */
}

/* Disable/Remove buttons (Pastel Red) */
.btn-red {
  background-color: #f28b8b; /* Richer pastel red */
}

.btn-red:hover {
  background-color: #e06666; /* Slightly more intense red on hover */
}

/* Refresh button (Pastel Blue) */
.btn-blue {
  background-color: #b3d9ff; /* Pastel blue */
}

.btn-blue:hover {
  background-color: #92bce8; /* Slightly darker pastel blue on hover */
}

/* Dismiss button (for error notifications) */
.btn-dismiss {
  background-color: #c3c3c3;
}

.btn-dismiss:hover {
  background-color: #a9a9a9;
}

/* Styles for error notifications and loading overlays */
.error-notification {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-size: 1.5rem;
  color: #333;
}
</style>
