import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import SettingView from "../views/SettingView.vue";
import BrowseView from "@/views/BrowseView.vue";
import PlansView from "@/views/PlansView.vue";
import ProfileView from "@/views/ProfileView.vue";
import PostView from "../views/PostView.vue";
import VerificationView from "../views/VerificationView.vue";
import AdminVerificationDashboard from "../views/AdminVerificationDashboard.vue";
import EndorseView from "../views/EndorseView.vue";
import LocationSharingView from "../views/LocationSharingView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/browse",
      name: "Browse",
      component: BrowseView,
      meta: { requiresAuth: true },
    },
    {
      path: "/plans",
      name: "Plans",
      component: PlansView,
      meta: { requiresAuth: true },
    },
    {
      path: "/posts",
      name: "Posts",
      component: PostView,
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "Profile",
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: "/endorse",
      name: "Endorse",
      component: EndorseView,
      meta: { requiresAuth: true }, // Ensures only authenticated users can access
    },
    {
      path: "/verification",
      name: "Verification",
      component: VerificationView,
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/verifications",
      name: "AdminVerificationDashboard",
      component: AdminVerificationDashboard,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/setting",
      name: "Settings",
      component: SettingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/location-sharing",
      name: "LocationSharing",
      component: LocationSharingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
