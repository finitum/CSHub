<template>
    <div>
        <div v-for="postHash in visiblePostHashes" :key="postHash.index" class="ma-4 mx-6">
            <post-header :key="postHash" :post-hash="postHash" />
        </div>
        <post-pagination v-model="paginationPage" :elements="postHashes.length" :range="range" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "@vue/composition-api";

import PostHeader from "./PostHeader.vue";
import PostPagination from "./PostPagination.vue";

import { useResize } from "../../../composables/useResize";

export default defineComponent({
    components: { PostPagination, PostHeader },
    props: {
        postHashes: { required: true, type: Array as PropType<number[]> },
    },
    setup(props) {
        const range = () => {
            const rangeRef = ref(10);

            useResize(() => {
                // For smaller screens, show 10
                if (window.innerHeight < 1000) {
                    rangeRef.value = 10;
                } else {
                    // Getting the window height, subtracting 350 pixels. Then dividing by 90 for a very wild guess of amount of possible cards on this screen
                    let range = Math.ceil((window.innerHeight - 350) / 90);
                    if (range === 0) range = 1;
                    rangeRef.value = range;
                }
            });

            return rangeRef as Readonly<typeof rangeRef>;
        };

        const paginationPage = ref(1);
        watch(
            () => props.postHashes,
            (newHashes) => {
                if (Math.ceil(newHashes.length / range.value) < paginationPage.value) {
                    paginationPage.value = 1;
                }
            },
        );

        const visiblePostHashes = computed(() => {
            props.postHashes.slice((paginationPage.value - 1) * this.range, paginationPage.value * this.range);
        });

        return {
            paginationPage,
            visiblePostHashes,
            range,
        };
    },
});
</script>

<style scoped></style>
