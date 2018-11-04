<template>
    <div>
        <div v-for="postHash in currPostHashes" :key="postHash.index">
            <Post :postHash="postHash" v-if="currentPostHash === -1 || currentPostHash === postHash" :key="postHash"></Post>
        </div>
        <h2 v-if="postHashes.length === 0" style="text-align: center; width: 100%">No posts found!</h2>
        <PostPagination v-if="postHashes.length !== 0 && currentPostHash === -1" :elements="postHashes.length"></PostPagination>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Watch} from "vue-property-decorator";
    import Vue from "vue";
    import {Route} from "vue-router";

    import Post from "./Post.vue";
    import PostPagination from "./PostPagination";

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

        private currPostHashes: number[] = [];
        private currentPostHash = -1;

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
            if (Math.ceil(hashes.length / 5) < this.paginationPageState) {
                this.paginationPageState = 1;
            }
            this.updateCurrHashes();
        }

        /**
         * Lifecycle hooks
         */
        private mounted() {
            this.doOnRouteChange();
        }

        private beforeDestroy() {
            this.paginationPageState = 1;
        }

        /**
         * Methods
         */
        private updateCurrHashes() {
            const paginationPageState = (this.paginationPageState - 1) * 5;
            this.currPostHashes = this.postHashes.slice(paginationPageState, paginationPageState + 5);
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