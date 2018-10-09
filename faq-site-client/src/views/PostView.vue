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
        name: "PostView",
        components: {Post},
        data() {
            return {
                postHashes: [] as number[],
                currentPostHash: -1 as number
            };
        },
        props: {
            inputHashes: Array // Null = any, Array gave a type error
        },
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
            if (this.inputHashes !== undefined && this.inputHashes !== null) {
                this.postHashes = (this.inputHashes as number[]);
            } else if (this.$router.currentRoute.fullPath.includes(Routes.POST)) {
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