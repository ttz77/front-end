// client/stores/locationSharing.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchy } from "../utils/fetchy";

interface TrustedContactLocation {
  username: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export const useLocationSharingStore = defineStore("locationSharing", () => {
  // State
  const sharingEnabled = ref(false);
  const trustedContacts = ref<string[]>([]);
  const trustedContactsLocations = ref<TrustedContactLocation[]>([]);
  const isSharingLocation = ref(false);
  const error = ref<string | null>(null);
  const isLoading = ref<boolean>(false);

  // Actions

  const getSharingStatus = async () => {
    isLoading.value = true;
    error.value = null;
    console.log("Fetching sharing status...");
    try {
      const result = await fetchy("/api/location/sharing-status", "GET", { alert: false });
      console.log("Sharing status result:", result);
      sharingEnabled.value = result.enabled;
    } catch (err: any) {
      console.error("Error in getSharingStatus:", err);
      error.value = err.message || "Failed to fetch sharing status.";
    } finally {
      isLoading.value = false;
      console.log("Finished fetching sharing status.");
    }
  };

  const enableLocationSharing = async () => {
    isLoading.value = true;
    error.value = null;
    console.log("Enabling location sharing...");
    try {
      await fetchy("/api/location/enable", "POST");
      sharingEnabled.value = true;
      console.log("Location sharing enabled.");
    } catch (err: any) {
      console.error("Error in enableLocationSharing:", err);
      error.value = err.message || "Failed to enable location sharing.";
      sharingEnabled.value = false;
    } finally {
      isLoading.value = false;
      console.log("Finished enabling location sharing.");
    }
  };

  const disableLocationSharing = async () => {
    isLoading.value = true;
    error.value = null;
    console.log("Disabling location sharing...");
    try {
      await fetchy("/api/location/disable", "POST");
      sharingEnabled.value = false;
      isSharingLocation.value = false;
      console.log("Location sharing disabled.");
    } catch (err: any) {
      console.error("Error in disableLocationSharing:", err);
      error.value = err.message || "Failed to disable location sharing.";
      sharingEnabled.value = true;
    } finally {
      isLoading.value = false;
      console.log("Finished disabling location sharing.");
    }
  };

  const shareLocation = async (latitude: number, longitude: number) => {
    isLoading.value = true;
    error.value = null;
    console.log(`Sharing location: (${latitude}, ${longitude})`);
    try {
      await fetchy("/api/location/share", "POST", {
        body: { latitude, longitude },
      });
      isSharingLocation.value = true;
      console.log("Location shared successfully.");
    } catch (err: any) {
      console.error("Error in shareLocation:", err);
      error.value = err.message || "Failed to share location.";
      isSharingLocation.value = false;
    } finally {
      isLoading.value = false;
      console.log("Finished sharing location.");
    }
  };

  const stopSharingLocation = async () => {
    isLoading.value = true;
    error.value = null;
    console.log("Stopping location sharing...");
    try {
      await fetchy("/api/location/share", "DELETE");
      isSharingLocation.value = false;
      console.log("Location sharing stopped.");
    } catch (err: any) {
      console.error("Error in stopSharingLocation:", err);
      error.value = err.message || "Failed to stop sharing location.";
      isSharingLocation.value = true;
    } finally {
      isLoading.value = false;
      console.log("Finished stopping location sharing.");
    }
  };

  const getTrustedContacts = async () => {
    isLoading.value = true;
    error.value = null;
    console.log("Fetching trusted contacts...");
    try {
      const result = await fetchy("/api/location/trusted-contacts", "GET", { alert: false });
      console.log("Trusted contacts result:", result);
      trustedContacts.value = result.contacts;
    } catch (err: any) {
      console.error("Error in getTrustedContacts:", err);
      error.value = err.message || "Failed to fetch trusted contacts.";
      trustedContacts.value = [];
    } finally {
      isLoading.value = false;
      console.log("Finished fetching trusted contacts.");
    }
  };

  const addTrustedContact = async (contactUsername: string) => {
    isLoading.value = true;
    error.value = null;
    console.log(`Adding trusted contact: ${contactUsername}`);
    try {
      await fetchy("/api/location/trusted-contacts", "POST", {
        body: { contactUsername },
      });
      if (!trustedContacts.value.includes(contactUsername)) {
        trustedContacts.value.push(contactUsername);
      }
      console.log(`Trusted contact ${contactUsername} added.`);
    } catch (err: any) {
      console.error("Error in addTrustedContact:", err);
      error.value = err.message || `Failed to add trusted contact: ${contactUsername}`;
    } finally {
      isLoading.value = false;
      console.log(`Finished adding trusted contact: ${contactUsername}`);
    }
  };

  const removeTrustedContact = async (contactUsername: string) => {
    isLoading.value = true;
    error.value = null;
    console.log(`Removing trusted contact: ${contactUsername}`);
    try {
      await fetchy(`/api/location/trusted-contacts/${contactUsername}`, "DELETE");
      trustedContacts.value = trustedContacts.value.filter((username) => username !== contactUsername);
      console.log(`Trusted contact ${contactUsername} removed.`);
    } catch (err: any) {
      console.error("Error in removeTrustedContact:", err);
      error.value = err.message || `Failed to remove trusted contact: ${contactUsername}`;
    } finally {
      isLoading.value = false;
      console.log(`Finished removing trusted contact: ${contactUsername}`);
    }
  };

  const getTrustedContactsLocations = async () => {
    isLoading.value = true;
    error.value = null;
    console.log("Fetching trusted contacts' locations...");
    try {
      const result = await fetchy("/api/location/trusted-contacts/locations", "GET", { alert: false });
      console.log("Trusted contacts' locations result:", result);
      trustedContactsLocations.value = result.locations;
    } catch (err: any) {
      console.error("Error in getTrustedContactsLocations:", err);
      error.value = err.message || "Failed to fetch trusted contacts' locations.";
      trustedContactsLocations.value = [];
    } finally {
      isLoading.value = false;
      console.log("Finished fetching trusted contacts' locations.");
    }
  };

  const clearError = () => {
    console.log("Clearing error...");
    error.value = null;
  };

  return {
    // State
    sharingEnabled,
    trustedContacts,
    trustedContactsLocations,
    isSharingLocation,
    error,
    isLoading,

    // Actions
    getSharingStatus,
    enableLocationSharing,
    disableLocationSharing,
    shareLocation,
    stopSharingLocation,
    getTrustedContacts,
    addTrustedContact,
    removeTrustedContact,
    getTrustedContactsLocations,
    clearError,
  };
});
