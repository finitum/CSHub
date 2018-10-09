<template>
    <div>
        <div v-for="postHash in postHashes" :key="postHash.index">
            <Post :postHash="postHash" :isFullPost="currentPostHash !== -1" v-if="currentPostHash !== -1 && postHash === currentPostHash || currentPostHash === -1"></Post>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    import Post from "../components/posts/Post.vue";

    import {TopicPostsCallBack, TopicPostsRequest} from "../../../faq-site-shared/api-calls";

    import {ApiWrapper, LogObjectConsole} from "../utilities";
    import router, {Routes} from "./router/router";
    import {Route} from "vue-router";

    export default Vue.extend({
        name: "Index",
        components: {Post},
        data() {
            return {
                postHashes: [] as number[],
                currentPostHash: -1 as number
            };
        },
        watch: {
            $route(to: Route, from: Route) {
                if (to.fullPath.includes(Routes.POST)) {
                    this.currentPostHash = +(to.params as any).hash;
                }

                if (to.fullPath === Routes.INDEX) {
                    this.getTopicRequest(0);
                }

                if (to.fullPath.includes(Routes.TOPIC)) {
                    this.getTopicRequest(+(router.currentRoute.params as any).hash);
                }
            }
        },
        mounted() {
            if (router.currentRoute.fullPath.includes(Routes.POST)) {
                this.currentPostHash = +(router.currentRoute.params as any).hash;
                this.postHashes = [this.currentPostHash];
            } else if (router.currentRoute.fullPath.includes(Routes.TOPIC)) {
                this.getTopicRequest(+(router.currentRoute.params as any).hash);
            } else if (router.currentRoute.fullPath === Routes.INDEX) {
                this.getTopicRequest(0);
            }
        },
        methods: {
            getTopicRequest(topicHash: number) {
                this.currentPostHash = -1;

                ApiWrapper.sendPostRequest(new TopicPostsRequest(topicHash, 0), (callbackData: TopicPostsCallBack) => {
                    this.postHashes = callbackData.postHashes;
                    LogObjectConsole(callbackData.postHashes, "Topic posthashes");
                });
            }
        }
    });
</script>

<style scoped>

</style>