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
import { uiState } from "../../store";
import { EventBus, STUDY_CHANGED } from "../../utilities/EventBus";
import { MetaInfo } from "vue-meta";

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

        EventBus.$on(STUDY_CHANGED, () => {
            this.getHashes();
        });
    }

    private destroyed() {
        EventBus.$off(STUDY_CHANGED);
    }

    public metaInfo(): MetaInfo {
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
                this.postHashes = callbackData.postHashes;
                logObjectConsole(callbackData.postHashes, "User dashboard posthashes");
            });
        }
    }
}
</script>

<style scoped></style>
