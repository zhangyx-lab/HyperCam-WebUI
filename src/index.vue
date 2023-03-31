
<script setup>
import { onMounted, ref } from "@vue/runtime-core";
import Container from "./container.vue";
import { delay } from "./util.js";
import { PNG } from "pngjs/browser";
import { saveAs } from "file-saver";
const list = [
	["Ultra Violet", "#004A", 8],
	["Blue", "#00AA", 10],
	["Green", "#080A", 14],
	["Yellow Green", "#560A", 255],
	["Yellow", "#FE06", 72],
	["Orange", "#840A", 60],
	["Red", "#A00A", 1],
	["Infrared", "#400A", 5],
];
const imageList = {};const rgbImg = ref(undefined);
async function fullCapture(calibrate = false) {
	rgbImg.value = undefined;
	for (const key in imageList) delete imageList[key];
	while (captureList.length < list.length) await delay(10);
	const task = captureList.map(capture =>
		capture(calibrate).then(
			([img, i]) =>
				(imageList[list[i - 1]?.[0]?.replace(/\s/gi, "_") ?? i] = img)
		)
	);
	const RGB = await Promise.all([task[0], task[2], task[6]]);
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
	const rgbBuf = PNG.sync.write(img, { colorType: 2 });
	rgbImg.value = URL.createObjectURL(new Blob([rgbBuf]));
}
// onMounted(fullCapture);
// Listen for keyboard shortcuts (ctrl-s | cmd-s)
let suggested_name = "A0"
function askSaveFile() {
	const group_name = prompt("Name of this capture group:", suggested_name);
	if (typeof group_name !== "string") return;
	try {
		const
			head = group_name.replace(/\d*$/gi, ''),
			idx = /\d*$/gi.exec(group_name)?.[0] ?? "0";
		suggested_name = head + (parseInt(idx) + 1).toString();
	} catch (e) {}
	for (const name in imageList) {
		saveAs(imageList[name], `${group_name}_${name}.png`);
	}
}
window.addEventListener("keydown", (e) => {
	const { ctrlKey, metaKey, key } = e;
	if ((ctrlKey || metaKey) && key === "s") {
		e.preventDefault();
		askSaveFile();
	} else if (key === " ") {
		e.preventDefault();
		fullCapture(false)
			.then(() => delay(200))
			.then(() => askSaveFile());
	}
});
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
		<Container
			:alt-img="rgbImg"
			color="#0008"
			@request-capture="() => fullCapture(false)"
			@request-calibrate="() => fullCapture(true)"
		>Synthesized RGB</Container>
	</div>
</template>

<script>
export const captureList = [];
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