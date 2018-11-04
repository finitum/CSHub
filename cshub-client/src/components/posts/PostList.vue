<template>
    <div>
        <div v-for="(postHash, index) in postHashes" :key="postHash.index">
            <Post :postHash="postHash" v-show="showCurrentPost(index, postHash)" :key="postHash"></Post>
        </div>
        <h2 v-if="postHashes.length === 0" style="text-align: center; width: 100%">No posts found!</h2>
        <PostPagination v-if="postHashes.length !== 0 && currentPostHash === -1" :elements="postHashes.length" :range="range"></PostPagination>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Watch} from "vue-property-decorator";
    import Vue from "vue";
    import {Route} from "vue-router";

    import Post from "./Post.vue";
    import PostPagination from "./PostPagination.vue";

    import uiState from "../../store/ui";
    import {Routes} from "../../views/router/router";

    @Component({
        name: "PostList",
        components: {PostPagination, Post}
    })
    export default class PostList extends Vue {

        /**
         * Data
         */
        @Prop(null) private postHashes: number[];

        private paginationStartIndex: number = 0;
        private currentPostHash = -1;
        private range = 5; // Just the default value

        /**
         * Computed properties
         */
        get paginationPageState(): number {
            return uiState.paginationPageState;
        }

        set paginationPageState(page: number) {
            uiState.setPaginationPageState(page);
        }

        /**
         * Watchers
         */
        @Watch("$route")
        private routeChanged(to: Route, from: Route) {
            this.doOnRouteChange();
        }

        @Watch("paginationPageState")
        private paginationPageStateChanged(page: number) {
            this.updateCurrHashes();
        }

        @Watch("postHashes")
        private postHashesChanged(hashes: number[]) {
            if (Math.ceil(hashes.length / this.range) < this.paginationPageState) {
                this.paginationPageState = 1;
            }
            this.updateCurrHashes();
        }

        /**
         * Lifecycle hooks
         */
        private mounted() {
            window.addEventListener("resize", this.windowHeightChanged);
            this.doOnRouteChange();
            this.windowHeightChanged();
        }

        private beforeDestroy() {
            this.paginationPageState = 1;
        }

        /**
         * Methods
         */
        private windowHeightChanged() {
            // Getting the window height, subtracting 300 pixels. Then dividing by 100 for a very wild guess of amount of possible cards on this screen
            let range = Math.floor((window.innerHeight - 350) / 100);
            if (range === 0) {
                range++;
            }
            this.range = range;
        }

        private showCurrentPost(index: number, postHash: number): boolean {

            const inIndexRange = index >= this.paginationStartIndex && index < (this.paginationStartIndex + this.range);

            return (this.currentPostHash === -1 && inIndexRange) || this.currentPostHash === postHash;
        }

        private updateCurrHashes() {
            this.paginationStartIndex = (this.paginationPageState - 1) * this.range;
        }

        private doOnRouteChange() {
            if (this.$route.fullPath.includes(Routes.POST)) {
                this.currentPostHash = +this.$route.params.hash;
            } else {
                this.currentPostHash = -1;
            }
        }

    }
</script>

<style scoped>

</style>