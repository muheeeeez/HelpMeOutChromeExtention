// src/stores/auth.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { auth } from "../../public/firebase"; // Adjust the path as needed
import { onAuthStateChanged } from "firebase/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isLoading = ref(true);

  const initializeAuth = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
        isLoading.value = false;
        resolve();
      });
    });
  };

  return { user, isLoading, initializeAuth };
});
