<template>
    <v-flex>
        <PostPreview v-for="postHash in postHashes" :key="postHash.index" :postHash="postHash"></PostPreview>
    </v-flex>
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
                postHashes: [] as number[]
            };
        },
        mounted() {
            ApiWrapper.sendGetRequest(new IndexRequest(), (callbackData: IndexCallBack) => {
                this.postHashes = callbackData.postHashes;
                LogObjectConsole(callbackData.postHashes, "Index posthashes");
            });
        }
    });
</script>

<style scoped>

</style>