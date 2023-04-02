
/* eslint-env node, browser */
import { ref } from "vue";

const URL = `ws://${location.host}/log`

export const
	wsAlive = ref(false),
	logList = ref([]);

export default function connectWS() {
	return new Promise(retry => {
		const ws = new WebSocket(URL);
		ws.addEventListener('message', event => {
			console.log(event.data.toString())
		});
		ws.addEventListener('open', () => wsAlive.value = true);
		ws.addEventListener('close', () => setTimeout(retry, 1000));
		ws.addEventListener('error', () => { wsAlive.value = false });
	}).then(connectWS)
}
