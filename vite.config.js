import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { existsSync, readFileSync } from 'fs'
// Function to load optional configuration files
function loadOptional(filename, processor = JSON.parse) {
	if (Array.isArray(filename))
		filename = resolve(...filename);
	if (existsSync(filename))
		return processor(readFileSync(filename));
}
// Load and parse jsconfig.json
// https://code.visualstudio.com/docs/languages/jsconfig
const
	jsconfig = loadOptional('jsconfig.json') ?? {},
	backendAPIs = loadOptional(
		['var', 'backendAPIs'],
		buf => buf.toString().trim().split('\n')
	) ?? [],
	backendHostName = loadOptional(
		['var', 'backend'],
		b => b.toString().trim()
	) ?? "localhost";
// Extract optional configuration entries
const
	aliasPaths = Object.entries(jsconfig?.compilerOptions?.paths ?? {}),
	alias = Object.fromEntries(
		aliasPaths.map(([src, [dir]]) => [
			src.replace(/\/\*$/gi, ''),
			resolve(__dirname, dir.replace(/\/\*$/gi, ''))
		])
	);
console.log(alias)
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	server: {
		proxy: Object.fromEntries(
			backendAPIs.map(a => [a, {
				target: `http://${backendHostName}/${a}`,
				ws: true,
				changeOrigin: true
			}])
		)
	},
	resolve: {
		// eslint-disable-next-line spellcheck/spell-checker
		// Alias is loaded and parsed from jsconfig.json
		// https://code.visualstudio.com/docs/languages/jsconfig#_using-webpack-aliases
		alias
	}
})
