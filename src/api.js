/* eslint-env node, browser */
export function restart(server = false) {
	if (server) {
		fetch('/restart-server');
	} else {
		fetch('/restart-driver');
	}
}
