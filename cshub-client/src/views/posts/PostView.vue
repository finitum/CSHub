<template>
    <div>
        <PostList
            v-if="postHashes.length > 0"
            v-show="isFullPost || isIndex"
            key="postList"
            :post-hashes-prop="postHashes"
        ></PostList>

        <v-tabs v-show="!isFullPost && !isIndex" icons-and-text :vertical="$vuetify.breakpoint.mdAndUp">
            <v-tab class="ml-0">
                Posts
                <v-icon>fas fa-newspaper</v-icon>
            </v-tab>

            <v-tab class="ml-0">
                Practice
                <v-icon>fas fa-question</v-icon>
            </v-tab>

            <v-tab-item>
                <transition name="topicHeader">
                    <v-subheader v-if="!isFullPost"> Posts in {{ currentTopicNameComputed }} </v-subheader>
                </transition>
                <PostList v-if="postHashes.length > 0" key="postList" :post-hashes-prop="postHashes"></PostList>
                <h2 v-else style="text-align: center; width: 100%">No posts found!</h2>
            </v-tab-item>
            <v-tab-item>
                <Editors></Editors>
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

import { TopicPosts, GetTopicPostsCallBack } from "../../../../cshub-shared/src/api-calls/index";
import { Routes } from "../../../../cshub-shared/src/Routes";

import { dataState, uiState } from "../../store";

import { ApiWrapper, logObjectConsole, logStringConsole } from "../../utilities/index";
import { CacheTypes } from "../../utilities/cache-types";
import { getTopicFromHash } from "../../utilities/Topics";
import { EventBus, STUDY_CHANGED } from "../../utilities/EventBus";
import Editors from "../../components/practice/editors/Editors.vue";

@Component({
    name: "PostView",
    components: { Editors, PostList }
})
export default class PostView extends Vue {
    /**
     * Data
     */
    private postHashes: number[] = [];
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

    /**
     * Watchers
     */
    @Watch("$route")
    private routeChanged(to: Route, from: Route) {
        this.doOnRouteChange();
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
    private doOnRouteChange() {
        const currentHash = +this.$route.params.hash;
        if (this.$router.currentRoute.fullPath.includes(Routes.POST)) {
            this.currentTopicHash = -1;
            this.isFullPost = true;
            if (this.postHashes.length === 0) {
                this.postHashes = [currentHash];
            }
        } else if (this.$router.currentRoute.fullPath.includes(Routes.TOPIC)) {
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

    private getTopicRequest(topicHash: number) {
        localForage.getItem<number[]>(CacheTypes.TOPICPOST + topicHash).then((value: number[]) => {
            if (value !== null) {
                this.postHashes = value;

                logStringConsole("Set topicPosts from cache", "getTopicRequest");
            }

            ApiWrapper.sendGetRequest(
                new TopicPosts(topicHash),
                (callbackData: GetTopicPostsCallBack) => {
                    if (!isEqual(callbackData.postHashes, this.postHashes)) {
                        this.postHashes = callbackData.postHashes;

                        logObjectConsole(callbackData.postHashes, "Topic posthashes");

                        localForage
                            .setItem<number[]>(CacheTypes.TOPICPOST + topicHash, callbackData.postHashes)
                            .then(() => {
                                logStringConsole("Updated postHashes from server", "getTopicRequest");
                            });
                    }
                },
                (err: AxiosError) => {
                    localForage.getItem<number[]>(CacheTypes.TOPICPOST + topicHash).then((cachedValue: number[]) => {
                        this.postHashes = cachedValue;

                        logStringConsole("Set topicPosts from cache", "getTopicRequest error axios");
                    });
                }
            );
        });
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
