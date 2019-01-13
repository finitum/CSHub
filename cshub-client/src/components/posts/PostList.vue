<template>
    <div>
        <div v-for="(postHash, index) in postHashes" :key="postHash.index">
            <Post :postHash="postHash" :isNewPost="isNewPost.length === postHashes.length ? isNewPost[index] : null" v-show="showCurrentPost(index, postHash)" :key="postHash"></Post>
        </div>
        <PostPagination v-if="postHashes.length !== 0 && currentPostHash === -1" :elements="postHashes.length" :range="range"></PostPagination>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Watch} from "vue-property-decorator";
    import Vue from "vue";
    import {Route} from "vue-router";

    import {Routes} from "../../../../cshub-shared/src/Routes";

    import Post from "./Post.vue";
    import PostPagination from "./PostPagination.vue";

    import uiState from "../../store/ui";
    import {GetUnverifiedPostsType} from "../../../../cshub-shared/src/api-calls/admin";

    @Component({
        name: "PostList",
        components: {PostPagination, Post}
    })
    export default class PostList extends Vue {

        /**
         * Data
         */
        @Prop(null) private postHashesProp: number[];
        @Prop({default: (): boolean[] => []}) private isNewPost: boolean[];

        private paginationStartIndex: number = 0;
        private currentPostHash = -1;
        private range = 5; // Just the default value
        private postHashes: number[] = [];

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

        @Watch("postHashesProp")
        private postHashesPropChanged(hashes: number[]) {
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
            this.updateCurrHashes();
        }

        private beforeDestroy() {
            this.paginationPageState = 1;
        }

        /**
         * Methods
         */
        private windowHeightChanged() {
            // For smaller screens, show 5
            if (window.innerHeight < 1000) {
                this.range = 5;
            } else {
                // Getting the window height, subtracting 350 pixels. Then dividing by 100 for a very wild guess of amount of possible cards on this screen
                let range = Math.floor((window.innerHeight - 350) / 75);
                if (range === 0) {
                    range = 1;
                }
                this.range = range;
            }

        }

        private showCurrentPost(index: number, postHash: number): boolean {

            const inIndexRange = index >= this.paginationStartIndex && index < (this.paginationStartIndex + this.range);

            return (this.currentPostHash === -1 && inIndexRange) || this.currentPostHash === postHash;
        }

        private updateCurrHashes() {
            this.postHashes = this.postHashesProp.slice(((this.paginationPageState - 1) * this.range), (this.paginationPageState * this.range) - 1);
            this.paginationStartIndex = (this.paginationPageState - 1) * this.range;
        }

        private doOnRouteChange() {
            if (this.$route.fullPath.includes(Routes.POST)) {
                this.currentPostHash = +this.$route.params.hash;
            } else if (this.$route.fullPath === Routes.ADMINDASHBOARD) {
                this.currentPostHash = -1;
            } else {
                this.currentPostHash = -1;
            }
        }
    }
</script>

<style scoped>

</style>