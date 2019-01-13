<template>
    <div>
        <router-view></router-view>
        <v-subheader>
            Your profile
        </v-subheader>
        <v-container fluid fill-height class="grey lighten-4">
            <v-layout justify-center align-center>
                <v-flex>
                    <UserTable></UserTable>
                </v-flex>
            </v-layout>
        </v-container>
        <v-subheader>
            Unverified posts
        </v-subheader>
        <PostList :postHashes="postHashes" :isNewPost="isNewPost"></PostList>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component} from "vue-property-decorator";

    import UserTable from "../../components/admin/UserTable.vue";
    import PostList from "../../components/posts/PostList.vue";

    import {ApiWrapper, logObjectConsole} from "../../utilities";

    import {
        GetUnverifiedPostsCallBack,
        GetUnverifiedPosts, GetUnverifiedPostsType
    } from "../../../../cshub-shared/src/api-calls/admin/GetUnverifiedPosts";

    @Component({
        name: "AdminDashboard",
        components: {UserTable, PostList},
    })
    export default class AdminDashboard extends Vue {

        /**
         * Data
         */
        private postHashes: number[] = [];
        private isNewPost: boolean[] = [];

        /**
         * Lifecycle hooks
         */
        private mounted() {
            this.getHashes();
        }

        /**
         * Methods
         */
        private getHashes() {
            ApiWrapper.sendPostRequest(new GetUnverifiedPosts(), (callbackData: GetUnverifiedPostsCallBack) => {
                for (const post of callbackData.postHashes) {
                    this.postHashes.push(post.hash);
                    this.isNewPost.push(post.isNewPost);
                }
                logObjectConsole(callbackData.postHashes, "User dashboard posthashes");
            });
        }
    }
</script>

<style scoped>

</style>