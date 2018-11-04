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
        <div>
            <div v-for="postHash in postHashes" :key="postHash.index">
                <Post :postHash="postHash" :key="postHash"></Post>
            </div>
            <h2 v-if="postHashes.length === 0" style="text-align: center; width: 100%">No posts found!</h2>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    import UserTable from "../../components/admin/UserTable.vue";
    import Post from "../../components/posts/Post.vue";
    import {ApiWrapper, logObjectConsole} from "../../utilities";
    import {
        GetUnverifiedPostsCallBack,
        GetUnverifiedPosts
    } from "../../../../cshub-shared/api-calls/admin/GetUnverifiedPosts";

    export default Vue.extend({
        name: "AdminDashboard",
        components: {UserTable, Post},
        data() {
            return {
                postHashes: [] as number[]
            };
        },
        mounted() {
            this.getHashes(0);
        },
        methods: {
            getHashes(startIndex: number) {
                ApiWrapper.sendPostRequest(new GetUnverifiedPosts(startIndex), (callbackData: GetUnverifiedPostsCallBack) => {
                    this.postHashes = callbackData.postHashes;
                    logObjectConsole(callbackData.postHashes, "User dashboard posthashes");
                });
            }
        }
    });
</script>

<style scoped>

</style>