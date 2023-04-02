/* eslint-env node, browser */
import '@CR/global.css'
import '@CR/fa/all.min.css'
// Mount app
import { createApp } from 'vue'
import App from './src/index.vue'
import * as components from './components'
import connectWS from './src/socket'
import { createRouter, createWebHistory } from 'vue-router'
// Create Vue Application
const Vue = createApp(App)
// Register router
const router = createRouter({
	routes: [],
	history: createWebHistory()
})
// Register custom components
Object
	.entries(components)
	.forEach(([name, el]) => Vue.component(name, el))
// Mount application
Vue.use(router).mount('#app')
