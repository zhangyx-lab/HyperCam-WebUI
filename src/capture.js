/* eslint-env node, browser */
import { typeCheck } from "./util.js";

class LocalOrRemoteConfig {
	#prefix;
	#getKey(...keys) {
		return `${[this.#prefix, ...keys].join('.')}`;
	}
	#registerKey
	constructor(prefix, defaults) {
		this.#prefix = typeCheck(prefix, 'string');
		const defaults = typeCheck(defaults, 'object');
	}
}

class Capture extends EventTarget {
	$ref = {};
	
	constructor(configLocalOrRemote) {

	}
}

export function registerLED() {
	
	return function capture() {}
}