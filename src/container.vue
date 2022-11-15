<script setup>
import { ref, watch } from "vue";
import { acquireList } from "./index.vue";
import Spinner from "./spinner.vue";
import { delay } from "./util.js";
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
			default: 1,
		},
		altImg: {
			type: String,
			default: undefined,
		},
	}),
	emit = defineEmits(["request"]),
	dataUrl = ref(undefined),
	{ index } = props,
	pwm = ref(parseInt(localStorage.getItem(`PWM[${index}]`) || props.pwm));
watch(pwm, (val) => localStorage.setItem(`PWM[${index}]`, val.toString()));
async function loadImage() {
	dataUrl.value = undefined;
	await delay((index - 1) * 200);
	const response = await fetch(`/acquire?LED=${index}&PWM=${pwm.value}`),
		blob = await response.blob();
	dataUrl.value = URL.createObjectURL(blob);
	return [blob, props.index];
}
if (index > 0) {
	acquireList.push(loadImage);
}
function click() {
	if (index) loadImage();
	else emit("request");
}
</script>

<template>
	<div class="container">
		<img v-if="dataUrl" :src="dataUrl" />
		<img v-else-if="props.altImg" :src="props.altImg" />
		<Spinner v-else style="--ct: #fffa; font-size: 2rem" />
		<div class="alt-info" :style="{ 'background-color': props.color }">
			<slot></slot>
			<input
				v-model.number="pwm"
				v-if="index"
				:disabled="!(dataUrl || props.altImg)"
				@keydown.enter="click"
			/>
			<div class="button" v-if="dataUrl || props.altImg" @click="click">
				<i class="fa fa-sync"></i>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.container {
	width: 26vw;
	min-width: 300px;
	height: 26vh;
	min-height: 200px;
	background-color: #111;
	flex-grow: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 10px;
	position: relative;
	&:hover .alt-info {
		opacity: 1;
		pointer-events: all;
	}
	.alt-info {
		user-select: none;
		pointer-events: none;
		opacity: 0;
		transition: 0.2s;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 0.2em;
		font-family: "Courier New", Courier, monospace;
		backdrop-filter: blur(3px);
		// Layout
		display: flex;
		justify-content: center;
		align-content: center;
		input {
			display: block;
			width: 3em;
			outline: none;
			background-color: #fff2;
			border: 1px solid white;
			border-radius: 0.2em;
			margin: 0 1em;
			text-align: center;
			&:disabled {
				border-color: #fff4;
			}
		}
	}
	img {
		max-height: 100%;
		max-width: 100%;
	}
}
.button {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.8em;
	padding: 0.125em 0.25em;
	border-radius: 0.3em;
	// border: 1px solid white;
	flex-shrink: 1;
	transition: 0.2s;
	&:hover {
		background-color: #fff8;
	}
	&:active {
		background-color: #fff4;
	}
}
</style>