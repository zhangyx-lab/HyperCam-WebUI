
<script setup>
import { PNG } from "pngjs/browser";
import { saveAs } from "file-saver";

import { ref } from "vue";
import Container from "./container.vue";
import WinStack, { $, prompt, confirm, alert } from "@CC/WinStack.vue"
import Switch from "@CC/header/ColorSchemeSwitch.vue"
import { delay } from "./util";

import _logView, { wsAlive } from "./logView.vue"
const logView = () => $("Server Log", _logView);

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

const imageList = {};
const rgbImg = ref(undefined);
async function fullCapture(calibrate = false) {
	rgbImg.value = undefined;
	for (const key in imageList) delete imageList[key];
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

let suggested_name = "A0"
async function askSaveFile() {
	const prefix = await prompt(
		"Save current captures",
		suggested_name
	);
	if (typeof prefix !== "string") return;
	try {
		const
			head = prefix.replace(/\d*$/gi, ''),
			idx = /\d*$/gi.exec(prefix)?.[0] ?? "0";
		suggested_name = head + (parseInt(idx) + 1).toString();
	} finally {
		const num_images = Object.keys(imageList).length;
		if (num_images < 8) {
			const conf = await confirm(
				"Missing Images",
				`Only ${num_images} out of 8 images loaded, proceed to save?`,
				{ color: 'red', text: 'Proceed' }
			)
			if (conf !== true) return;
		}
		for (const name in imageList) {
			saveAs(imageList[name], `${prefix}_${name}.png`);
		}
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
	<WinStack />
	<div class="wrapper">
		<Container
			v-for="(el, i) in list"
			:key="i"
			:index="i + 1"
			:color="el[1]"
			:pwm="el[2]">{{ el[0] }}</Container>
		<Container
			:alt-img="rgbImg"
			color="#000F"
			@request-capture="() => fullCapture(false)"
			@request-calibrate="() => fullCapture(true)">Synthesized RGB</Container>
	</div>
	<div class="toolbar">
		<Switch />
		<div style="flex-grow: 1"></div>
		<Btn
			type="seamless gray"
			@click="() => alert('not implemented', 'sorry')"><i class="fa fa-video"></i></Btn>
		<Btn
			type="seamless gray"
			@click="logView"><i v-if="wsAlive" class="fa fa-terminal"></i><i v-else class="fa fa-sync rotate-infinite"></i>
		</Btn>
		<Btn
			type="seamless gray"
			@click="() => alert('not implemented', 'sorry')"><i class="fa fa-cog"></i></Btn>
	</div>
</template>

<script>
export const captureList = [];
</script>


<style lang="scss">
* {
	box-sizing: border-box;
}

body {
	margin: 0;
	padding: 0;
	background-color: var(--cf);
}

.wrapper,
.toolbar {
	position: absolute;
	top: 0;
	height: 100vh;
	display: flex;
	overflow-x: hidden;
	overflow-y: scroll;
}

.wrapper {
	// POSITION
	left: 0;
	width: calc(100vw - 4rem - 1px);
	// FLEX
	flex-wrap: wrap;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 3vh 3vw;
	margin: 0;
}

.toolbar {
	width: 4rem;
	right: 0;
	background-color: var(--cf-next-level);
	border-left: 1px solid var(--cb-gray-light);
	padding: 1.5rem 0;
	font-size: 1.4rem;
	// FLEX
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;

	&>* {
		margin: 0;
	}

	[button] {
		border-radius: 0 !important;
		width: 100%;
		padding: 0 0.5em;
		margin: 0;
	}
}
</style>