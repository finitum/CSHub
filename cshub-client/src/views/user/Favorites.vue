<template>
    <div class="pt-4">
        <PostList :postHashesProp="postHashes" v-if="postHashes.length > 0"></PostList>
        <h2 v-else style="text-align: center; width: 100%">No favorites found!</h2>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component} from "vue-property-decorator";

    import PostList from "../../components/posts/PostList.vue";

    import userState from "../../store/user";

    import {ApiWrapper, logObjectConsole} from "../../utilities";
    import {
        GetUserPosts,
        GetUserPostsCallback
    } from "../../../../cshub-shared/src/api-calls/pages/user";
    import {IUser} from "../../../../cshub-shared/src/models";
    import {getTitleSitenameImageDescription} from "../../utilities/metainfo";

    @Component({
        name: "Favorites",
        inject: ["$validator"],
        components: {PostList},
    })
    export default class Favorites extends Vue {

        /**
         * Data
         */
        private postHashes: number[] = [];

        /**
         * Computed properties
         */
        get userDataComputed(): IUser {
            return userState.userModel;
        }

        /**
         * Lifecycle hooks
         */
        private mounted() {
            this.getHashes();
        }

        public metaInfo(): any {
            return {
                title: "Favorites - CSHub",
                meta: getTitleSitenameImageDescription()
            };
        }

        /**
         * Methods
         */
        private getHashes() {
            ApiWrapper.sendPostRequest(new GetUserPosts(true), (callbackData: GetUserPostsCallback) => {
                this.postHashes = callbackData.postHashes;
                logObjectConsole(callbackData.postHashes, "User favorites posthashes");
            });
        }
    }
</script>

<style scoped>

</style>
