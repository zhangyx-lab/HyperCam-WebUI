
<script setup>
import { onMounted, ref } from "@vue/runtime-core";
import Container from "./container.vue";
import { delay } from "./util.js";
import { PNG } from "pngjs/browser";
import { isHTMLTag } from "@vue/shared";
const list = [
	["Ultra Violet", "#004A", 1],
	["Blue", "#00AA", 1],
	["Green", "#080A", 1],
	["Yellow Green", "#560A", 1],
	["Yellow", "#FE06", 1],
	["Orange", "#840A", 1],
	["Red", "#A00A", 1],
	["Infrared", "#400A", 1],
];
const rgbImg = ref(undefined);
async function fullAcquire() {
	rgbImg.value = undefined;
	while (acquireList.length < list.length) await delay(10);
	const task = acquireList.map((el) => el());
	const RGB = await Promise.all([task[0], task[2], task[6]]);
	console.log((window.RGB = RGB));
	const [R, G, B] = await Promise.all(
		RGB.map(async (blob) => {
			const buffer = await blob.arrayBuffer();
			console.log(buffer);
			return await new Promise((res, rej) =>
				new PNG().parse(buffer, (err, data) => {
					console.log("PARSED", err, data);
					if (err) console.error(err);
					else res(data);
				})
			);
		})
	);
	console.log({ R, G, B });
	const img = new PNG({
			width: R.width,
			height: R.height,
		}),
		bytePerPx = 4;
	[B, G, R, 255].forEach((mat, offset) => {
		for (let j = 0; j < img.height; j++) {
			const j_offset = j * img.width * bytePerPx;
			for (let i = 0; i < img.width; i++) {
				const idx = j_offset + i * bytePerPx;
				if (typeof mat === "number") img.data[idx + offset] = mat;
				else img.data[idx + offset] = mat.data[idx];
			}
		}
	});
	console.log(img);
	const rgbBuf = PNG.sync.write(img, { colorType: 2 });
	rgbImg.value = URL.createObjectURL(new Blob([rgbBuf]));
}
onMounted(fullAcquire);
</script>

<template>
	<div class="wrapper">
		<Container
			v-for="(el, i) in list"
			:key="i"
			:index="i + 1"
			:color="el[1]"
			:pwm="el[2]"
			>{{ el[0] }}</Container
		>
		<Container :alt-img="rgbImg" @request="fullAcquire"
			>Synthesized RGB</Container
		>
	</div>
</template>

<script>
export const acquireList = [];
</script>


<style>
* {
	box-sizing: border-box;
}

body {
	margin: 0;
	padding: 0;
	background-color: black;
}

.wrapper {
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	justify-content: space-evenly;
	align-items: center;
	width: 100vw;
	min-height: 100vh;
	padding: 3vh 3vw;
	margin: 0;
}
</style>