<template>
    <div>
        <div v-for="postHash in postHashes" :key="postHash.index">
            <Post :postHash="postHash" @toggleFullPost="toggleFullPost" :isFullPost="currentPostHash !== -1" v-if="currentPostHash !== -1 && postHash === currentPostHash || currentPostHash === -1"></Post>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    import Post from "../../components/posts/Post.vue";

    import {ApiWrapper, LogObjectConsole} from "../../utilities";
    import {UserDashboardCallBack, UserDashboardRequest} from "../../../../faq-site-shared/api-calls/pages/user";

    export default Vue.extend({
        name: "UserDashboard",
        data() {
            return {
                postHashes: [] as number[],
                currentPostHash: -1 as number
            };
        },
        components: {Post},
        mounted() {
            this.getHashes(0);
        },
        methods: {
            getHashes(startIndex: number) {
                ApiWrapper.sendPostRequest(new UserDashboardRequest(startIndex), (callbackData: UserDashboardCallBack) => {
                    this.postHashes = callbackData.postHashes;
                    LogObjectConsole(callbackData.postHashes, "User dashboard posthashes");
                });
            },
            toggleFullPost(postHash: number) {
                if (postHash !== null) {
                    this.currentPostHash = postHash;
                } else {
                    this.currentPostHash = -1;
                }
            }
        }
    });
</script>

<style scoped>

</style>