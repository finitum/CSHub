<template>
    <div>
        <v-subheader>
            WIP posts
        </v-subheader>
        <PostList :postHashesProp="postHashes" v-if="postHashes.length > 0"></PostList>
        <h2 v-else style="text-align: center; width: 100%">No posts found!</h2>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component} from "vue-property-decorator";

    import PostList from "../../components/posts/PostList.vue";

    import {ApiWrapper, logObjectConsole} from "../../utilities";

    import {GetWIPPosts, GetWIPPostsCallBack} from "../../../../cshub-shared/src/api-calls/pages/GetWIPPosts";

    @Component({
        name: "WIPPosts",
        components: {PostList},
    })
    export default class WIPPosts extends Vue {

        /**
         * Data
         */
        private postHashes: number[] = [];

        /**
         * Lifecycle hooks
         */
        private mounted() {
            this.getHashes();
        }

        public metaInfo(): any {
            return {
                title: "WIP posts - CSHub"
            };
        }

        /**
         * Methods
         */
        private getHashes() {
            ApiWrapper.sendGetRequest(new GetWIPPosts(), (callbackData: GetWIPPostsCallBack) => {
                for (const post of callbackData.postHashes) {
                    this.postHashes.push(post);
                }
                logObjectConsole(callbackData.postHashes, "WIP dashboard posthashes");
            });
        }
    }
</script>

<style scoped>

</style>
