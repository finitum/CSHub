<template>
    <div>
        <transition
                name="breadCrumb"
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
            <v-subheader v-if="!fullPostComputed">
                Posts in {{currentTopicNameComputed}}
            </v-subheader>
        </transition>
        <div v-for="postHash in postHashes" :key="postHash.index">
            <Post :postHash="postHash" :key="postHash"></Post>
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
            fullPostComputed: {
                get(): boolean {
                    if (this.postHashes.length === 1) {
                        return this.$route.fullPath.includes(this.postHashes[0].toString());
                    } else {
                        return false;
                    }
                }
            },
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
                this.setCurrentTopic();
                if (to.fullPath.includes(Routes.POST)) {
                    this.currentPostHash = +to.params.hash;
                } else if (to.fullPath === Routes.INDEX) {
                    this.getTopicRequest(0);
                } else if (to.fullPath.includes(Routes.TOPIC)) {
                    this.getTopicRequest(+this.$router.currentRoute.params.hash);
                }
            }
        },
        mounted() {
            this.setCurrentTopic();
            if (this.$router.currentRoute.fullPath.includes(Routes.POST)) {
                this.currentTopicHash = -1;
                this.currentPostHash = +this.$router.currentRoute.params.hash;
                this.postHashes = [this.currentPostHash];
            } else if (this.$router.currentRoute.fullPath.includes(Routes.TOPIC)) {
                this.currentTopicHash = +this.$router.currentRoute.params.hash;
                this.getTopicRequest(+this.$router.currentRoute.params.hash);
            } else if (this.$router.currentRoute.fullPath === Routes.INDEX) {
                this.currentTopicHash = 0;
                this.getTopicRequest(0);
            }
        },
        methods: {
            setCurrentTopic(): void {


            },
            getTopicRequest(topicHash: number) {

                // Ts gives an error here, have no clue as to why as it normally also works
                // @ts-ignore
                this.currentPostHash = -1;

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

</style>