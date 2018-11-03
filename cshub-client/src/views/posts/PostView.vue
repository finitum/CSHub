<template>
    <div>
        <div v-for="postHash in postHashes" :key="postHash.index">
            <Post :postHash="postHash" :isFullPost="currentPostHash !== -1" v-if="currentPostHash === -1 || postHash === currentPostHash"></Post>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import localForage from "localforage";

    import Post from "../../components/posts/Post.vue";

    import {TopicPostsCallBack, TopicPostsRequest} from "../../../../cshub-shared/api-calls/index";

    import {ApiWrapper, LogObjectConsole, LogStringConsole} from "../../utilities/index";
    import {Routes} from "../router/router";
    import {Route} from "vue-router";
    import {AxiosError} from "axios";
    import {CacheTypes} from "../../utilities/cache-types";

    export default Vue.extend({
        name: "PostView",
        data() {
            return {
                postHashes: [] as number[],
                currentPostHash: -1 as number
            };
        },
        components: {Post},
        watch: {
            $route(to: Route, from: Route) {
                if (to.fullPath.includes(Routes.POST)) {
                    this.currentPostHash = +to.params.hash;
                }

                if (to.fullPath === Routes.INDEX) {
                    this.getTopicRequest(0);
                }

                if (to.fullPath.includes(Routes.TOPIC)) {
                    this.getTopicRequest(+this.$router.currentRoute.params.hash);
                }
            }
        },
        mounted() {
            if (this.$router.currentRoute.fullPath.includes(Routes.POST)) {
                this.currentPostHash = +this.$router.currentRoute.params.hash;
                this.postHashes = [this.currentPostHash];
            } else if (this.$router.currentRoute.fullPath.includes(Routes.TOPIC)) {
                this.getTopicRequest(+this.$router.currentRoute.params.hash);
            } else if (this.$router.currentRoute.fullPath === Routes.INDEX) {
                this.getTopicRequest(0);
            }
        },
        methods: {
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

                            LogStringConsole("Set topicPosts from cache", "getTopicRequest");
                        }

                        ApiWrapper.sendPostRequest(new TopicPostsRequest(topicHash, 0), (callbackData: TopicPostsCallBack) => {

                            if (callbackData.postHashes !== this.postHashes) {
                                // Ts gives an error here, have no clue as to why as it normally also works
                                // @ts-ignore
                                this.postHashes = callbackData.postHashes;

                                LogObjectConsole(callbackData.postHashes, "Topic posthashes");

                                localForage.setItem(CacheTypes.TOPICPOST + topicHash, callbackData.postHashes)
                                    .then(() => {
                                        LogStringConsole("Updated postHashes from server", "getTopicRequest");
                                    });
                            }
                        }, (err: AxiosError) => {
                            localForage.getItem(CacheTypes.TOPICPOST + topicHash)
                            // @ts-ignore
                                .then((cachedValue: number[]) => {

                                    // @ts-ignore
                                    this.postHashes = cachedValue;

                                    LogStringConsole("Set topicPosts from cache", "getTopicRequest error axios");
                                });
                        });

                    });


            }
        }
    });
</script>

<style scoped>

</style>