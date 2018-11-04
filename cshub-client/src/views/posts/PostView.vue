<template>
    <div>
        <transition name="topicHeader">
            <v-subheader v-if="currentPostHash === -1">
                Posts in {{currentTopicNameComputed}}
            </v-subheader>
        </transition>
        <div v-for="postHash in postHashes" :key="postHash.index">
            <Post :postHash="postHash" v-if="currentPostHash === -1 || currentPostHash === postHash" :key="postHash"></Post>
        </div>
        <h2 v-if="postHashes.length === 0" style="text-align: center; width: 100%">No posts found!</h2>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import localForage from "localforage";
    import {AxiosError} from "axios";
    import {Route} from "vue-router";
    import {Component, Watch} from "vue-property-decorator";

    import Post from "../../components/posts/Post.vue";

    import {GetTopicPostsCallBack, GetTopicPosts} from "../../../../cshub-shared/api-calls/index";
    import {getTopicFromHash} from "../../../../cshub-shared/utilities/Topics";

    import dataState from "../../store/data";

    import {Routes} from "../router/router";

    import {ApiWrapper, logObjectConsole, logStringConsole} from "../../utilities/index";
    import {CacheTypes} from "../../utilities/cache-types";


    @Component({
        name: "PostView",
        components: {Post},
    })
    export default class PostView extends Vue {

        /**
         * Data
         */
        private postHashes: number[] = [];
        private currentPostHash = -1;
        private currentTopicHash = -1;

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
                if (this.postHashes.length === 0) {
                    this.postHashes = [currentHash];
                }
                this.currentPostHash = currentHash;
            } else if (this.$router.currentRoute.fullPath.includes(Routes.TOPIC)) {
                this.currentTopicHash = currentHash;
                this.currentPostHash = -1;
                this.getTopicRequest(currentHash);
            } else if (this.$router.currentRoute.fullPath === Routes.INDEX) {
                this.currentTopicHash = 0;
                this.currentPostHash = -1;
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

                    ApiWrapper.sendPostRequest(new GetTopicPosts(topicHash, 0), (callbackData: GetTopicPostsCallBack) => {

                        if (callbackData.postHashes !== this.postHashes) {
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