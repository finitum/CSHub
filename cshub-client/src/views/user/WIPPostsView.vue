<template>
    <div>
        <v-subheader>
            WIP posts
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

import { WIPPosts, WIPPostsCallBack } from "../../../../cshub-shared/src/api-calls";
import { uiState } from "../../store";
import { EventBus, STUDY_CHANGED } from "../../utilities/EventBus";

@Component({
    name: "WIPPostsView",
    components: { PostList }
})
export default class WIPPostsView extends Vue {
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

    public metaInfo(): any {
        return {
            title: "WIP posts - CSHub"
        };
    }

    /**
     * Methods
     */
    private getHashes() {
        const studyId = uiState.studyNr;
        if (studyId) {
            ApiWrapper.sendGetRequest(new WIPPosts(studyId), (callbackData: WIPPostsCallBack) => {
                this.postHashes = callbackData.postHashes;
                logObjectConsole(callbackData.postHashes, "WIP dashboard posthashes");
            });
        }
    }
}
</script>

<style scoped></style>
