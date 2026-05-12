import {
  type RouteRecordRaw,
  createRouter,
  createWebHistory,
} from "vue-router";
import { requireAuth } from "./guards";

const routes: RouteRecordRaw[] = [
  {
    component: () => import("@/views/HomeView.vue"),
    name: "Home",
    path: "/",
  },
  {
    component: () => import("@/views/LeaderboardView.vue"),
    name: "Leaderboard",
    path: "/leaderboard",
  },
  {
    component: () => import("@/views/MapListView.vue"),
    name: "MapList",
    path: "/maps/:slug",
  },
  {
    component: () => import("@/views/FormatRulesView.vue"),
    name: "MapSubmissionRules",
    path: "/maps/:slug/map-rules",
    props: { kind: "map" },
  },
  {
    component: () => import("@/views/FormatRulesView.vue"),
    name: "CompletionSubmissionRules",
    path: "/maps/:slug/completion-rules",
    props: { kind: "completion" },
  },
  {
    component: () => import("@/views/MapDetailView.vue"),
    name: "MapDetail",
    path: "/map/:code",
  },
  {
    component: () => import("@/views/EditMapView.vue"),
    name: "EditMap",
    path: "/map/:code/edit",
    beforeEnter: requireAuth,
  },
  {
    component: () => import("@/views/SubmitCompletionView.vue"),
    name: "SubmitCompletion",
    path: "/map/:code/submit-completion",
  },
  {
    component: () => import("@/views/InsertCompletionView.vue"),
    name: "InsertCompletion",
    path: "/map/:code/insert-completion",
    beforeEnter: requireAuth,
  },
  {
    component: () => import("@/views/NewMapView.vue"),
    name: "NewMap",
    path: "/map/new",
    beforeEnter: requireAuth,
  },
  {
    component: () => import("@/views/SubmitMapView.vue"),
    name: "SubmitMap",
    path: "/map/submit",
    beforeEnter: requireAuth,
  },
  {
    component: () => import("@/views/MyCompletionsView.vue"),
    name: "MyCompletions",
    path: "/my-submissions/completions",
    beforeEnter: requireAuth,
  },
  {
    component: () => import("@/views/MyMapsView.vue"),
    name: "MyMaps",
    path: "/my-submissions/maps",
    beforeEnter: requireAuth,
  },
  {
    component: () => import("@/views/UserProfileEditView.vue"),
    name: "UserProfileEdit",
    path: "/profile/edit",
    beforeEnter: requireAuth,
  },
  {
    component: () => import("@/views/UserProfileView.vue"),
    name: "UserProfile",
    path: "/users/:id",
  },
  {
    component: () => import("@/views/admin/EditCompletionView.vue"),
    name: "EditCompletion",
    path: "/completions/:id/edit",
    beforeEnter: requireAuth,
  },
  {
    component: () => import("@/views/admin/AdminListsView.vue"),
    name: "AdminLists",
    path: "/admin/lists",
  },
  {
    component: () => import("@/views/admin/AdminRetroMapsView.vue"),
    name: "AdminRetroMaps",
    path: "/admin/retro-maps",
  },
  {
    component: () => import("@/views/admin/AdminRetroMapNewView.vue"),
    name: "AdminRetroMapNew",
    path: "/admin/retro-maps/new",
  },
  {
    component: () => import("@/views/admin/AdminRetroMapDetailView.vue"),
    name: "AdminRetroMapDetail",
    path: "/admin/retro-maps/:id",
  },
  {
    component: () => import("@/views/admin/AdminMapSubmissionsView.vue"),
    name: "AdminMapSubmissions",
    path: "/admin/submissions/maps",
  },
  {
    component: () => import("@/views/admin/AdminCompletionSubmissionsView.vue"),
    name: "AdminCompletionSubmissions",
    path: "/admin/submissions/completions",
  },
  {
    component: () => import("@/views/admin/AdminListDetailView.vue"),
    name: "AdminListDetail",
    path: "/admin/lists/:id",
  },
  {
    component: () => import("@/views/admin/AdminAchievementRolesView.vue"),
    name: "AdminAchievementRoles",
    path: "/admin/lists/:id/achievement-roles",
  },
  {
    component: () => import("@/views/admin/AdminConfigView.vue"),
    name: "AdminConfig",
    path: "/admin/config",
  },
  {
    component: () => import("@/views/admin/AdminUsersView.vue"),
    name: "AdminUsers",
    path: "/admin/users",
  },
  {
    component: () => import("@/views/admin/AdminMapsView.vue"),
    name: "AdminMaps",
    path: "/admin/maps",
  },
  {
    component: () => import("@/views/SearchView.vue"),
    name: "Search",
    path: "/search",
  },
  {
    component: () => import("@/views/OAuth2LoginView.vue"),
    name: "OAuth2Login",
    path: "/oauth2/login",
  },
  {
    component: () => import("@/views/OAuth2CallbackView.vue"),
    name: "OAuth2Callback",
    path: "/oauth2/callback",
  },
  {
    component: () => import("@/views/OAuth2DiscordCallbackView.vue"),
    name: "OAuth2DiscordCallback",
    path: "/oauth2/discord/callback",
    meta: { standalone: true },
  },
  {
    path: "/maplist",
    redirect: "/maps/maplist",
  },
  {
    path: "/expert-list",
    redirect: "/maps/expert-list",
  },
  {
    path: "/best-of-the-best",
    redirect: "/maps/best-of-the-best",
  },
  {
    path: "/nostalgia-pack",
    redirect: "/maps/nostalgia-pack",
  },
  {
    component: () => import("@/views/NotFoundView.vue"),
    name: "NotFound",
    path: "/:pathMatch(.*)*",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
