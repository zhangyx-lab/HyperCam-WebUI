<template>
    <div>
        <img
            v-if="preview" :src="preview"
            style="border: none; outline: none; max-width: 50vw; max-height: 50vh;">
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

let flag_activated = false;
const preview = ref(undefined);

function capture_loop() {
    fetch('/capture')
        .then(async res => await res.blob())
        .then(blob => {
            const data = URL.createObjectURL(blob);
            preview.value = data;
        })
        .then(async () => {
            if (flag_activated)
            return capture_loop();
        })
}

export default defineComponent({
    setup() {
        return { preview }
    },
    methods: {
        cancel() {
            this.RETURN()
        },
        async confirm() {
            this.RETURN(this.content)
        }
    },
    activated() {
        flag_activated = true;
        capture_loop();
    },
    deactivated() {
        flag_activated = false;
        fetch('/capture?led=0;pwm=1;exp=100;stack=1')
    }
})
</script>
