<template>
    <div>
        <v-subheader>
            Unsaved posts
        </v-subheader>
        <PostList v-if="postHashes.length > 0" :post-hashes-prop="postHashes"></PostList>
        <h2 v-else style="text-align: center; width: 100%">No posts found!</h2>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import PostList from "../../components/posts/PostList.vue";

import { ApiWrapper, logObjectConsole } from "../../utilities";

import { GetUnverifiedPostsCallBack, GetUnverifiedPosts } from "../../../../cshub-shared/src/api-calls";
import { LocalStorageData } from "../../store/localStorageData";
import { uiState } from "../../store";

@Component({
    name: "UnsavedPosts",
    components: { PostList }
})
export default class UnsavedPosts extends Vue {
    /**
     * Data
     */
    private postHashes: number[] = [];

    /**
     * Lifecycle hooks
     */
    private mounted() {
        this.getHashes();
    }

    public metaInfo(): any {
        return {
            title: "Unsaved posts - CSHub"
        };
    }

    /**
     * Methods
     */
    private getHashes() {
        const studyNr = uiState.studyNr;

        if (studyNr) {
            ApiWrapper.sendGetRequest(new GetUnverifiedPosts(studyNr), (callbackData: GetUnverifiedPostsCallBack) => {
                for (const post of callbackData.postHashes) {
                    this.postHashes.push(post);
                }
                logObjectConsole(callbackData.postHashes, "User dashboard posthashes");
            });
        }
    }
}
</script>

<style scoped></style>
