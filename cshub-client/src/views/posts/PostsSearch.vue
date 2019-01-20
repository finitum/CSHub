<template>
    <div>
        <v-container class="ml-0">
            <v-layout>
                <v-btn color="primary" depressed small dark @click="$router.go(-1)">
                    <v-icon>fas fa-chevron-left</v-icon>
                </v-btn>

                <v-subheader>
                    Your search results on the query '{{searchQuery}}'
                </v-subheader>
            </v-layout>
        </v-container>

        <PostList :postHashesProp="postHashes" v-if="postHashes.length > 0"></PostList>
        <h2 v-else style="text-align: center; width: 100%">No posts found!</h2>
    </div>
</template>

<script lang="ts">
    import {Component, Watch} from "vue-property-decorator";
    import Vue from "vue";

    import {GetSearchPosts, GetSearchPostsCallback} from "../../../../cshub-shared/src/api-calls/pages";
    import {Routes} from "../../../../cshub-shared/src/Routes";

    import PostList from "../../components/posts/PostList.vue";

    import dataState from "../../store/data";

    import {ApiWrapper} from "../../utilities";

    @Component({
        name: "PostsSearch",
        components: {PostList}
    })
    export default class PostsSearch extends Vue {

        /**
         * Data
         */
        private postHashes: number[] = [];

        /**
         * Computed properties
         */
        get searchQuery(): string {
            return dataState.searchQuery;
        }

        set searchQuery(value: string) {
            dataState.setSearchQuery(value);
        }

        /**
         * Lifecycle hooks
         */
        private mounted() {
            if (this.searchQuery.length < 3) {
                this.$router.push(Routes.INDEX);
            } else {
                this.getSearchResults();
            }
        }

        private beforeDestroy() {
            this.searchQuery = "";
        }

        /**
         * Watchers
         */
        @Watch("searchQuery")
        private searchQueryChanged() {
            if (this.searchQuery.length >= 3) {
                this.getSearchResults();
            }
        }

        /**
         * Methods
         */
        private getSearchResults() {
            ApiWrapper.sendPostRequest(new GetSearchPosts(this.searchQuery), (result: GetSearchPostsCallback) => {
                this.postHashes = result.hashes;
            });
        }

    }
</script>

<style scoped>

</style>