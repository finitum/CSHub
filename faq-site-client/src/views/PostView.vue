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
    import router, {Routes} from "../views/router";
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
                if (from.fullPath === Routes.INDEX && to.name === "post") {
                    this.currentPostHash = +(to.params as any).hash;
                } else if (to.fullPath === Routes.INDEX && from.name === "post") {
                    this.currentPostHash = -1;
                }
            }
        },
        mounted() {

            if (router.currentRoute.name === "post") {
                this.currentPostHash = +(router.currentRoute.params as any).hash;
                this.postHashes = [this.currentPostHash];
            } else {
                ApiWrapper.sendPostRequest(new TopicPostsRequest(0, 0), (callbackData: TopicPostsCallBack) => {
                    this.postHashes = callbackData.postHashes;
                    LogObjectConsole(callbackData.postHashes, "Index posthashes");
                });
            }
        }
    });
</script>

<style scoped>

</style>