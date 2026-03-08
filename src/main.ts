/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable sort-imports */

import './style.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
