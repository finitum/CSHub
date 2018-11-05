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

        <PostList :postHashes="postHashes"></PostList>
    </div>
</template>

<script lang="ts">
    import {Component, Watch} from "vue-property-decorator";
    import Vue from "vue";

    import {GetSearchPosts, GetSearchPostsCallback} from "../../../../cshub-shared/api-calls/pages";

    import PostList from "../../components/posts/PostList.vue";

    import dataState from "../../store/data";

    import {ApiWrapper} from "../../utilities";

    import {Routes} from "../router/router";

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
            this.getSearchResults();
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