import { type RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/views/HomeView.vue'),
    name: 'Home',
    path: '/',
  },
  {
    component: () => import('@/views/LeaderboardView.vue'),
    name: 'Leaderboard',
    path: '/leaderboard',
  },
  {
    component: () => import('@/views/ListDetailView.vue'),
    name: 'ListDetail',
    path: '/lists/:id',
  },
  {
    component: () => import('@/views/MapDetailView.vue'),
    name: 'MapDetail',
    path: '/maps/:id',
  },
  {
    component: () => import('@/views/SubmitCompletionView.vue'),
    name: 'SubmitCompletion',
    path: '/maps/:id/submit-completion',
  },
  {
    component: () => import('@/views/SubmitMapView.vue'),
    name: 'SubmitMap',
    path: '/lists/:id/submit-map',
  },
  {
    component: () => import('@/views/ProfileView.vue'),
    name: 'Profile',
    path: '/profile',
  },
  {
    component: () => import('@/views/MyCompletionsView.vue'),
    name: 'MyCompletions',
    path: '/my-submissions/completions',
  },
  {
    component: () => import('@/views/MyMapsView.vue'),
    name: 'MyMaps',
    path: '/my-submissions/maps',
  },
  {
    component: () => import('@/views/UserProfileView.vue'),
    name: 'UserProfile',
    path: '/users/:id',
  },
  {
    component: () => import('@/views/admin/AdminListsView.vue'),
    name: 'AdminLists',
    path: '/admin/lists',
  },
  {
    component: () => import('@/views/admin/AdminMapSubmissionsView.vue'),
    name: 'AdminMapSubmissions',
    path: '/admin/submissions/maps',
  },
  {
    component: () => import('@/views/admin/AdminCompletionSubmissionsView.vue'),
    name: 'AdminCompletionSubmissions',
    path: '/admin/submissions/completions',
  },
  {
    component: () => import('@/views/admin/AdminListDetailView.vue'),
    name: 'AdminListDetail',
    path: '/admin/lists/:id',
  },
  {
    component: () => import('@/views/admin/AdminAchievementRolesView.vue'),
    name: 'AdminAchievementRoles',
    path: '/admin/lists/:id/achievement-roles',
  },
  {
    component: () => import('@/views/admin/AdminConfigView.vue'),
    name: 'AdminConfig',
    path: '/admin/config',
  },
  {
    component: () => import('@/views/admin/AdminUsersView.vue'),
    name: 'AdminUsers',
    path: '/admin/users',
  },
  {
    component: () => import('@/views/admin/AdminMapsView.vue'),
    name: 'AdminMaps',
    path: '/admin/maps',
  },
  {
    component: () => import('@/views/OAuth2LoginView.vue'),
    name: 'OAuth2Login',
    path: '/oauth2/login',
  },
  {
    component: () => import('@/views/OAuth2CallbackView.vue'),
    name: 'OAuth2Callback',
    path: '/oauth2/callback',
  },
  {
    component: () => import('@/views/OAuth2DiscordCallbackView.vue'),
    name: 'OAuth2DiscordCallback',
    path: '/oauth2/discord/callback',
    meta: { standalone: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
