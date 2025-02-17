// src/main.js
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import { createPinia } from 'pinia';
import 'vuetify/styles';
import App from './App.vue';

const vuetify = createVuetify({});
const pinia = createPinia();
createApp(App).use(vuetify).use(pinia).mount('#app');
