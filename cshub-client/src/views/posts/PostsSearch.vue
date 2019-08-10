<template>
    <div>
        <v-container class="ml-0">
            <v-layout>
                <v-btn color="primary" depressed small dark @click="$router.go(-1)">
                    <v-icon>fas fa-chevron-left</v-icon>
                </v-btn>

                <v-subheader v-if="searchQuery.length >= 3"
                    >Your search results on the query '{{ searchQuery }}'</v-subheader
                >
                <v-subheader v-else>Your query was not long enough, type more characters</v-subheader>
            </v-layout>
        </v-container>

        <v-text-field
            v-if="!$vuetify.breakpoint.mdAndUp"
            v-model="searchQuery"
            solo-inverted
            flat
            hide-details
            label="Search"
            prepend-inner-icon="fas fa-search"
        ></v-text-field>

        <PostList v-if="postHashes.length > 0" :post-hashes-prop="postHashes"></PostList>
        <h2 v-else style="text-align: center; width: 100%">No posts found!</h2>
    </div>
</template>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import Vue from "vue";

import { Search, GetSearchPostsCallback } from "../../../../cshub-shared/src/api-calls";

import PostList from "../../components/posts/PostList.vue";

import { dataState } from "../../store";

import { ApiWrapper } from "../../utilities";

@Component({
    name: "PostsSearch",
    components: { PostList }
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
        if (this.searchQuery.length >= 3) {
            this.getSearchResults();
        }
    }

    private beforeDestroy() {
        this.searchQuery = "";
    }

    public metaInfo(): any {
        return {
            title: "Search - CSHub"
        };
    }

    /**
     * Watchers
     */
    @Watch("searchQuery")
    private searchQueryChanged() {
        if (this.searchQuery.trim().length >= 3) {
            this.getSearchResults();
        }
    }

    /**
     * Methods
     */
    private getSearchResults() {
        ApiWrapper.sendGetRequest(new Search(this.searchQuery), (result: GetSearchPostsCallback) => {
            this.postHashes = result.hashes;
        });
    }
}
</script>

<style scoped></style>
