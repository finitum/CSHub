<template>
    <div>
        <transition name="topicHeader">
            <v-subheader v-if="!isFullPost">
                Posts in {{currentTopicNameComputed}}
            </v-subheader>
        </transition>
        <PostList :postHashes="postHashes"></PostList>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import localForage from "localforage";
    import {AxiosError} from "axios";
    import {Route} from "vue-router";
    import {Component, Watch} from "vue-property-decorator";
    import _ from "lodash";

    import PostList from "../../components/posts/PostList.vue";

    import {GetTopicPostsCallBack, GetTopicPosts} from "../../../../cshub-shared/api-calls/index";
    import {getTopicFromHash} from "../../../../cshub-shared/utilities/Topics";

    import dataState from "../../store/data";

    import {Routes} from "../router/router";

    import {ApiWrapper, logObjectConsole, logStringConsole} from "../../utilities/index";
    import {CacheTypes} from "../../utilities/cache-types";

    @Component({
        name: "PostView",
        components: {PostList}
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
            if (dataState.topics !== null) {
                if (this.currentTopicHash > 0) {
                    return getTopicFromHash(this.currentTopicHash, dataState.topics).name;
                } else {
                    return "Index";
                }
            }
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
        private mounted() {
            this.doOnRouteChange();
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
            } else if (this.$router.currentRoute.fullPath === Routes.INDEX) {
                this.currentTopicHash = 0;
                this.isFullPost = false;
                this.getTopicRequest(0);
            }
        }

        private getTopicRequest(topicHash: number) {

            localForage.getItem<number[]>(CacheTypes.TOPICPOST + topicHash)
                .then((value: number[]) => {

                    if (value !== null) {
                        this.postHashes = value;

                        logStringConsole("Set topicPosts from cache", "getTopicRequest");
                    }

                    ApiWrapper.sendPostRequest(new GetTopicPosts(topicHash), (callbackData: GetTopicPostsCallBack) => {

                        if (!_.isEqual(callbackData.postHashes, this.postHashes)) {
                            this.postHashes = callbackData.postHashes;

                            logObjectConsole(callbackData.postHashes, "Topic posthashes");

                            localForage.setItem<number[]>(CacheTypes.TOPICPOST + topicHash, callbackData.postHashes)
                                .then(() => {
                                    logStringConsole("Updated postHashes from server", "getTopicRequest");
                                });
                        }
                    }, (err: AxiosError) => {
                        localForage.getItem<number[]>(CacheTypes.TOPICPOST + topicHash)
                            .then((cachedValue: number[]) => {

                                this.postHashes = cachedValue;

                                logStringConsole("Set topicPosts from cache", "getTopicRequest error axios");
                            });
                    });

                });
        }
    }
</script>

<style scoped>
    .topicHeader-enter-active, .topicHeader-leave-active {
        transition: opacity .2s;
    }
    .topicHeader-enter, .topicHeader-leave-to {
        opacity: 0;
    }
</style>