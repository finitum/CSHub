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

    import Post from "../../components/posts/Post.vue";

    import {GetTopicPostsCallBack, GetTopicPosts} from "../../../../cshub-shared/api-calls/index";

    import {ApiWrapper, logObjectConsole, logStringConsole} from "../../utilities/index";
    import {Routes} from "../router/router";
    import {Route} from "vue-router";
    import {AxiosError} from "axios";
    import {CacheTypes} from "../../utilities/cache-types";
    import {getTopicFromHash} from "../../../../cshub-shared/utilities/Topics";
    import dataState from "../../store/data";

    export default Vue.extend({
        name: "PostView",
        data() {
            return {
                postHashes: [] as number[],
                currentPostHash: -1 as number,
                currentTopicHash: -1 as number
            };
        },
        computed: {
            currentTopicNameComputed: {
                get(): string {
                    if (dataState.topics !== null) {
                        if (this.currentTopicHash > 0) {
                            return getTopicFromHash(this.currentTopicHash, dataState.topics).name;
                        } else {
                            return "Index";
                        }
                    }

                }
            }
        },
        components: {Post},
        watch: {
            $route(to: Route, from: Route) {
                this.doOnRouteChange();
            }
        },
        mounted() {
            this.doOnRouteChange();
        },
        methods: {
            doOnRouteChange() {
                const currentHash = +this.$route.params.hash;
                if (this.$router.currentRoute.fullPath.includes(Routes.POST)) {
                    this.currentTopicHash = -1;
                    if (this.postHashes.length === 0) {
                        this.postHashes = [currentHash]
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
            },
            getTopicRequest(topicHash: number) {

                // Ts gives an error here, have no clue as to why as it normally also works
                // @ts-ignore

                localForage.getItem(CacheTypes.TOPICPOST + topicHash)
                // @ts-ignore
                    .then((value: number[]) => {

                        if (value !== null) {
                            // @ts-ignore
                            this.postHashes = value;

                            logStringConsole("Set topicPosts from cache", "getTopicRequest");
                        }

                        ApiWrapper.sendPostRequest(new GetTopicPosts(topicHash, 0), (callbackData: GetTopicPostsCallBack) => {

                            if (callbackData.postHashes !== this.postHashes) {
                                // Ts gives an error here, have no clue as to why as it normally also works
                                // @ts-ignore
                                this.postHashes = callbackData.postHashes;

                                logObjectConsole(callbackData.postHashes, "Topic posthashes");

                                localForage.setItem(CacheTypes.TOPICPOST + topicHash, callbackData.postHashes)
                                    .then(() => {
                                        logStringConsole("Updated postHashes from server", "getTopicRequest");
                                    });
                            }
                        }, (err: AxiosError) => {
                            localForage.getItem(CacheTypes.TOPICPOST + topicHash)
                            // @ts-ignore
                                .then((cachedValue: number[]) => {

                                    // @ts-ignore
                                    this.postHashes = cachedValue;

                                    logStringConsole("Set topicPosts from cache", "getTopicRequest error axios");
                                });
                        });

                    });


            }
        }
    });
</script>

<style scoped>
    .topicHeader-enter-active, .topicHeader-leave-active {
        transition: opacity .2s;
    }
    .topicHeader-enter, .topicHeader-leave-to {
        opacity: 0;
    }
</style>