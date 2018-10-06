<template>
    <v-navigation-drawer
            stateless
            value="true"
    >
            <v-treeview
                    :items="topics"
                    activatable
                    item-key="name"
                    open-on-click
            >
            </v-treeview>
    </v-navigation-drawer>
</template>

<script lang="ts">
    import Vue from "vue";

    import {GetHomeCallBack, GetHomeRequest} from "../../../faq-site-shared/api-calls";
    import {IPost, ITopic} from "../../../faq-site-shared/models";

    import {ApiWrapper} from "../plugins/api/api-wrapper";

    export default Vue.extend({
        name: "Index",
        data() {
            return {
                topics: [] as ITopic[],
                posts: [] as IPost[]
            }
        },
        mounted() {
            ApiWrapper.sendGetRequest(new GetHomeRequest(), (callbackData: GetHomeCallBack) => {
                this.topics = callbackData.topics;
                this.posts = callbackData.posts;

                console.log(this.posts);
                console.log(this.topics);
            })
        }
    })
</script>

<style scoped>

</style>