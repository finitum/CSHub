<template>
</template>

<script lang="ts">
    import Vue from "vue";

    import {GetIndexCallBack, GetIndexRequest} from "../../../faq-site-shared/api-calls";
    import {IPost} from "../../../faq-site-shared/models";

    import {ApiWrapper} from "../plugins/api/api-wrapper";

    export default Vue.extend({
        name: "Index",
        data() {
            return {
                posts: [] as IPost[]
            }
        },
        mounted() {
            ApiWrapper.sendGetRequest(new GetIndexRequest(), (callbackData: GetIndexCallBack) => {
                this.posts = callbackData.posts;

                console.log(this.posts);
            })
        }
    })
</script>

<style scoped>

</style>