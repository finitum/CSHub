<template>
    <div>
        <PostPreview v-for="postId in postIds" :key="postId.index" :postId="postId"></PostPreview>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    import PostPreview from "../components/posts/PostPreview.vue";

    import {IndexCallBack, IndexRequest} from "../../../faq-site-shared/api-calls";

    import {ApiWrapper} from "../plugins/api/api-wrapper";
    import {LogObjectConsole} from "../plugins";

    export default Vue.extend({
        name: "Index",
        components: {PostPreview},
        data() {
            return {
                postIds: [] as number[]
            };
        },
        mounted() {
            ApiWrapper.sendGetRequest(new IndexRequest(), (callbackData: IndexCallBack) => {
                this.postIds = callbackData.postIds;
                LogObjectConsole(callbackData.postIds, "Index postids");
            });
        }
    });
</script>

<style scoped>

</style>