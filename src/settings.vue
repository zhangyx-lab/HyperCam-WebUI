<template>
	<v-form frame-prompt>
		<input
			ref="input"
			v-model="content"
			@keydown.enter="confirm"
			@keydown.esc="cancel"
			style="margin: 0; font-weight: bold; font-family: monospace;"
		>
	</v-form>
	<div btn-group>
		<btn type="solid green" @click="confirm">Confirm</btn>
		<btn type="solid gray" @click="cancel">Cancel</btn>
	</div>
</template>

<script>
import { defineComponent, ref } from 'vue'
export default defineComponent({
	methods: {
		restart() {
			this.RETURN()
		},
		async confirm() {
			this.RETURN(this.content)
		}
	},
	activated() {
		this.$refs.input.focus()
	}
})
</script>