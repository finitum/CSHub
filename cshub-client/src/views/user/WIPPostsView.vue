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

    import {WIPPosts, WIPPostsCallBack} from "../../../../cshub-shared/src/api-calls";
    import {LocalStorageData} from "../../store/localStorageData";

    @Component({
        name: "WIPPostsView",
        components: {PostList},
    })
    export default class WIPPostsView extends Vue {

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
            const studyId = +localStorage.getItem(LocalStorageData.STUDY);
            ApiWrapper.sendGetRequest(new WIPPosts(studyId), (callbackData: WIPPostsCallBack) => {
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
