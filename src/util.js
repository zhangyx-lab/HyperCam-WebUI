/**
 * Asynchronously delay for given ms
 * @param {number} ms 
 * @returns {Promise<number>}
 */
export async function delay(ms) {
	await new Promise(res => setTimeout(res, ms));
	return ms;
}
/**
 * Check if value belongs to the given type
 * @param {*} value 
 * @param {'string'|'number'|'object'|'undefined'} typename 
 */
export function typeCheck(value, typename = 'undefined') {
	if (typeof value !== typename) {
		throw new TypeError(
			`Type of variable ${value} is not ${typename}`
		);
	} else {
		return value;
	}
}
