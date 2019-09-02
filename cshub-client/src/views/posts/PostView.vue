<template>
    <div>
        <PostList
            v-if="postHashes.length > 0"
            v-show="isFullPost || isIndex"
            key="postList"
            :post-hashes-prop="postHashes"
        ></PostList>

        <v-tabs
            v-show="!isFullPost && !isIndex"
            v-model="tabIndex"
            icons-and-text
            :vertical="$vuetify.breakpoint.mdAndUp"
        >
            <v-tab class="ml-0">
                Posts
                <v-icon>fas fa-newspaper</v-icon>
            </v-tab>

            <v-tab class="ml-0">
                Practice
                <v-icon>fas fa-question</v-icon>
            </v-tab>

            <v-tab class="ml-0">
                Examples
                <v-icon>fas fa-lightbulb</v-icon>
            </v-tab>

            <v-tab-item>
                <transition name="topicHeader">
                    <v-subheader v-if="!isFullPost"> Posts in {{ currentTopicNameComputed }} </v-subheader>
                </transition>
                <PostList v-if="postHashes.length > 0" key="postList" :post-hashes-prop="postHashes"></PostList>
                <h2 v-else style="text-align: center; width: 100%">No posts found!</h2>
            </v-tab-item>
            <v-tab-item>
                <Practice></Practice>
            </v-tab-item>
            <v-tab-item>
                <transition name="topicHeader">
                    <v-subheader v-if="!isFullPost">Examples in {{ currentTopicNameComputed }} </v-subheader>
                </transition>
                <Examples v-if="examplePostHashes.length > 0" :post-hashes-prop="examplePostHashes"></Examples>
                <h2 v-else style="text-align: center; width: 100%">No examples found!</h2>
            </v-tab-item>
        </v-tabs>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import localForage from "localforage";
import { AxiosError } from "axios";
import { Route } from "vue-router";
import { Component, Watch } from "vue-property-decorator";
import isEqual from "lodash/isEqual";

import PostList from "../../components/posts/PostList.vue";

import { TopicPosts, PostHashes } from "../../../../cshub-shared/src/api-calls/index";
import { Routes } from "../../../../cshub-shared/src/Routes";

import { dataState, uiState } from "../../store";

import { ApiWrapper, logObjectConsole, logStringConsole } from "../../utilities";
import { CacheTypes } from "../../utilities/cache-types";
import { getTopicFromHash } from "../../utilities/Topics";
import { EventBus, STUDY_CHANGED } from "../../utilities/EventBus";
import Editors from "../../components/practice/editors/Editors.vue";
import Practice from "../../components/practice/Practice.vue";
import Examples from "../../components/posts/Examples.vue";
import { ExamplePosts } from "../../../../cshub-shared/src/api-calls/endpoints/posts/ExamplePosts";

@Component({
    name: "PostView",
    components: { Examples, Practice, Editors, PostList }
})
export default class PostView extends Vue {
    /**
     * Data
     */
    private postHashes: number[] = [];
    private examplePostHashes: number[] = [];
    private currentTopicHash = -1;
    private isFullPost = false;

    /**
     * Computed properties
     */
    get currentTopicNameComputed(): string {
        if (dataState.topTopic !== null) {
            if (this.currentTopicHash > 0) {
                const topicFromHash = getTopicFromHash(this.currentTopicHash, dataState.topTopic.children);

                if (topicFromHash) {
                    return topicFromHash.name;
                }
            } else {
                return "Index";
            }
        }

        return "";
    }

    get isIndex(): boolean {
        return this.$route.fullPath === Routes.INDEX;
    }

    set tabIndex(index: number) {
        const currentHash = +this.$route.params.hash;

        if (index === 1) {
            this.$router.push(`${Routes.TOPIC}/${currentHash}/practice`);
        } else if (index === 2) {
            this.$router.push(`${Routes.TOPIC}/${currentHash}/examples`);
        } else {
            this.$router.push(`${Routes.TOPIC}/${currentHash}`);
        }
    }

    get tabIndex(): number {
        if (this.$route.name === "topicpractice") {
            return 1;
        } else if (this.$route.name === "topicexamples") {
            return 2;
        } else {
            return 0;
        }
    }

    /**
     * Watchers
     */
    @Watch("$route")
    private routeChanged(to: Route, from: Route) {
        this.doOnRouteChange(to, from);
    }

    /**
     * Lifecycle hooks
     */
    public metaInfo(): any {
        if (!this.isFullPost) {
            let topic = this.currentTopicNameComputed;
            if (topic === "Index") {
                topic = "CSHub";
            }

            return {
                title: `${this.currentTopicNameComputed} - CSHub`
            };
        } else {
            return {};
        }
    }

    private mounted() {
        this.doOnRouteChange();

        EventBus.$on(STUDY_CHANGED, () => {
            if (this.isIndex) {
                this.doOnRouteChange();
            } else {
                this.$router.push(Routes.INDEX);
            }
        });
    }

    private destroyed() {
        EventBus.$off(STUDY_CHANGED);
    }

    /**
     * Methods
     */
    private doOnRouteChange(to?: Route, from?: Route) {
        const currentHash = +this.$route.params.hash;
        if (this.$router.currentRoute.fullPath.includes(Routes.POST)) {
            this.currentTopicHash = -1;
            this.isFullPost = true;
            if (this.postHashes.length === 0) {
                this.postHashes = [currentHash];
            }
        } else if (this.$router.currentRoute.fullPath.includes(Routes.TOPIC)) {
            if (from && from.fullPath.includes(Routes.TOPIC)) {
                return;
            }

            this.currentTopicHash = currentHash;
            this.isFullPost = false;
            this.getTopicRequest(currentHash);
        } else if (this.isIndex) {
            this.currentTopicHash = 0;
            this.isFullPost = false;

            const topTopic = dataState.topTopic;

            if (topTopic) {
                this.getTopicRequest(topTopic.hash);
            } else {
                uiState.setNotificationDialog({
                    header: "Error!",
                    text: "We have not found a topic?",
                    on: true
                });
            }
        }
    }

    private async getHashes(topicHash: number, isExample: boolean) {
        const cacheType = isExample ? CacheTypes.EXAMPLES : CacheTypes.TOPICPOST;
        const cacheValue = await localForage.getItem<number[]>(cacheType + topicHash);
        if (cacheValue !== null) {
            if (isExample) {
                this.examplePostHashes = cacheValue;
            } else {
                this.postHashes = cacheValue;
            }
            logStringConsole("Set topicPosts from cache", "getTopicRequest");
        }

        const request = isExample ? new ExamplePosts(topicHash) : new TopicPosts(topicHash);
        const postHashes = await ApiWrapper.get(request);

        if (postHashes && !isEqual(postHashes.postHashes, this.postHashes)) {
            if (isExample) {
                this.examplePostHashes = postHashes.postHashes;
            } else {
                this.postHashes = postHashes.postHashes;
            }

            logObjectConsole(postHashes.postHashes, "Topic posthashes");

            localForage.setItem<number[]>(cacheType + topicHash, postHashes.postHashes).then(() => {
                logStringConsole("Updated postHashes from server", "getTopicRequest");
            });
        }
    }

    private async getTopicRequest(topicHash: number) {
        this.getHashes(topicHash, false);
        this.getHashes(topicHash, true);
    }
}
</script>

<style scoped>
.topicHeader-enter-active,
.topicHeader-leave-active {
    transition: opacity 0.2s;
}
.topicHeader-enter,
.topicHeader-leave-to {
    opacity: 0;
}
</style>
