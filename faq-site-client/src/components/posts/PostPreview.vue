<template>
    
</template>

<script lang="ts">
    import Vue from "vue";
    import {ApiWrapper, LogObjectConsole} from "../../plugins";
    import {PostCallBack, PostRequest} from "../../../../faq-site-shared/api-calls";
    import {IPost} from "../../../../faq-site-shared/models";

    export default Vue.extend({
        name: "PostPreview",
        props: {
            postId: Number
        },
        data() {
            return {
                post: null as IPost
            }
        },
        mounted() {
            // IntelliJ doesn't know postId, but it is there. I'm afraid that's the limited vue TS implementation (https://github.com/vuejs/vue/pull/6856 might help)
            ApiWrapper.sendPostRequest(new PostRequest(this.postId), (callbackData: PostCallBack) => {
                this.post = callbackData.post;
                LogObjectConsole(callbackData.post, "PostPreview");
            });
        }
    })
</script>

<style scoped>

</style>