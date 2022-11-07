/* eslint-env node, browser */
// import '@CR/global.css'
// import '@CR/fa/all.min.css'
// Mount app
import { createApp } from 'vue'
import App from './src/index.vue'
import './res/fa/all.min.css'
// import { router } from './router'
// import { createPinia } from 'pinia'
// import * as componentList from '@CL/components'
const Vue = createApp(App)
	// .use(router)
	// .use(createPinia())
// Object
// 	.entries(componentList)
// 	.forEach(([name, el]) => Vue.component(name, el))
Vue.mount('#app')
// import * as fn from '@CC/WinStack.vue'
// window.fn = fn
