<script setup>
import { ref, watch } from "vue";
import { captureList } from "./index.vue";
import Spinner from "./spinner.vue";

const props = defineProps({
	index: {
		type: Number,
		default: 0,
	},
	color: {
		type: String,
		default: "000A",
	},
	pwm: {
		type: Number,
		default: 64,
	},
	exp: {
		type: Number,
		default: 100,
	},
	gain: {
		type: Number,
		default: 0,
	},
	altImg: {
		type: String,
		default: undefined,
	},
});
const emit = defineEmits(["request-capture", "request-calibrate"]);
const
	loading = ref(false),
	dataUrl = ref(undefined),
	requestErr = ref(undefined),
	{ index } = props;
// Create reverse-linkable local reference variables
function createLocalIntRef(key, ...args) {
	let r = ref(parseInt(localStorage.getItem(`${key}[${index}]`) || props[key]));
	watch(r, v => { localStorage.setItem(`${key}[${index}]`, v.toString()) });
	watch(r, v => localStorage.setItem(`${key}[${index}]`, v.toString()));
	watch(r, v => { localStorage.setItem(`${key}[${index}]`, v.toString()) });
	return r;
}

const [pwm, exp, gain] = ["pwm", "exp", "gain"].map(createLocalIntRef);

function loadImage(calibrate = false) {
	dataUrl.value = undefined;
	requestErr.value = undefined;
	const query_object = calibrate
		? { led: index }
		: {
			led: index,
			pwm: pwm.value,
			exp: exp.value,
			gain: gain.value,
		},
		query = Object.entries(query_object).map(([k, v]) => `${k}=${v}`).join('&');
	loading.value = true;
	return fetch(`/capture?${query}`)
		.then(async response => {
			if (!response.ok) {
				let message = "Unknown Error";
				const cType = response.headers
					.get('Content-Type')
					.toLowerCase()
					.split('/')
				if (cType[0] == 'text') {
					const payload = await response.text();
					if (payload) message = payload
				}
				requestErr.value = { code: response.status, message }
			};
			return response;
		})
		.catch((rej, ...args) => {
			console.error(rej)
			console.log(typeof rej, Object.keys(rej), ...args)
			requestErr.value = 'REJECTED'
			return []
		})
		.then(async res => [res.headers, await res.blob()])
		.then(([headers = {}, blob]) => {
			if (blob instanceof Blob)
				dataUrl.value = URL.createObjectURL(blob);
			for (const [k, t] of [['pwm', pwm], ['exp', exp], ['gain', gain]]) {
				const key = `cap-prop-${k}`
				if (headers.has(key))
					t.value = parseInt(headers.get(key));
			}
			return [blob, props.index];
		})
		.finally(() => loading.value = false);
}

if (index > 0) {
	captureList.push(loadImage);
}

function clickCapture() {
	if (index) loadImage(false);
	else {
		loading.value = true;
		emit("request-capture")
	};
}

function clickCalibrate() {
	if (index) loadImage(true);
	else {
		loading.value = true;
		emit("request-calibrate")
	};
}
</script>

<template>
	<div class="container dark" :class="{ empty: !(dataUrl || props.altImg || loading || requestErr) }">
		<div v-if="requestErr"
			style="font-size: 1.5em; border: var(--cb-red) 2px solid; padding: 10px; border-radius: 10px;">
			<h1 style="color: var(--cb-red) !important; line-height: 0.9;">
				{{ requestErr.code }}
			</h1>
			<p style="color: var(--ct-red) !important; margin-top: 10px;">
				<i class="fa fa-exclamation-circle"></i>
				{{ requestErr.message }}
			</p>
		</div>
		<img v-else-if="dataUrl" :src="dataUrl" />
		<img v-else-if="props.altImg" :src="props.altImg" />
		<Spinner v-else-if="loading" style="font-size: 3rem; z-index: 1000;" />
		<div class="slider-group" v-show="!loading || dataUrl || props.altImg">
			<div style="font-size: 1.6rem; margin: 0; padding: 0; margin: 1rem;">
				<btn type="outlined blue" style="margin: 0 1em" :disabled="index && loading" @click="clickCapture">
					<i class="fa fa-camera"></i>
				</btn>
				<btn type="outlined red" style="margin: 0 1em" :disabled="index && loading" @click="clickCalibrate">
					<i class="fa fa-sync"></i>
				</btn>
			</div>
			<div class="input" v-if="index">
				<div><span>pwm</span> {{ pwm.toString().padStart(4, '&nbsp;') }}</div>
				<input v-if="index" type="range" min="0" max="255" v-model.number="pwm">
			</div>
			<div class="input" v-if="index">
				<div><span>exposure</span> {{ exp.toString().padStart(4, '&nbsp;') }}</div>
				<input v-if="index" type="range" min="50" max="150" v-model.number="exp">
			</div>
			<div class="input" v-if="index">
				<div><span>gain</span> {{ gain.toString().padStart(4, '&nbsp;') }}</div>
				<input v-if="index" type="range" min="0" max="999" v-model.number="gain">
			</div>
		</div>
		<div class="alt-info" :style="{ 'background-color': props.color }">
			<slot></slot>
		</div>
	</div>
</template>

<style>
html.light .slider-group {
	background-color: #FFFA;
}

html.dark .slider-group {
	background-color: #000A;
}
</style>

<style lang="scss" scoped>
.container {
	width: calc(33% - 2em);
	min-width: 300px;
	height: calc(33% - 2em);
	min-height: 200px;
	background-color: var(--cf-next-next-level);
	flex-grow: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 1em;
	position: relative;
	overflow: hidden;
	border-radius: 0.5em;

	background-image:
		linear-gradient(45deg, var(--cf-next-next-level) 25%, transparent 25%),
		linear-gradient(-45deg, var(--cf-next-next-level) 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, var(--cf-next-next-level) 75%),
		linear-gradient(-45deg, transparent 75%, var(--cf-next-next-level) 75%);
	background-size: 20px 20px;
	background-position: 0 0, 0 10px, 10px -10px, -10px 0px;

	.alt-info,
	.slider-group {
		position: absolute;
		left: 0;
		width: 100%;
		padding: 0;
		user-select: none;
		pointer-events: none;
		opacity: 0;
		transition: .1s;
		font-family: "Cascadia Code", "Courier New", Courier, monospace;
		color: var(--ct-gray-dark)
	}

	&:hover,
	&.empty {

		.alt-info,
		.slider-group {
			opacity: 1;
			pointer-events: all;
		}
	}

	.slider-group {
		top: 0;
		bottom: 2em;
		backdrop-filter: blur(2px);
		// Layout
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-content: center;

		&>* {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.input {
			div {
				width: 8em;
				text-align: right;
			}

			input {
				margin: 0 2em;
				flex-grow: 1;
			}

			// display: block;
			outline: none;
			margin: 0.5em 1em;
			padding: 0;
		}
	}

	.alt-info {
		bottom: 0;
		height: 2em;
		backdrop-filter: blur(2px);
		// Layout
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		// Style
		color: white;


		* {
			display: block;
			margin: 0 0.5em;
		}
	}

	img {
		max-height: 100%;
		max-width: 100%;
	}
}
</style>