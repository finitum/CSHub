<template>
    <div>
        <div v-show="currentPostHash === -1">
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
        </div>
        <div>
            <div v-for="postHash in postHashes" :key="postHash.index">
                <Post :postHash="postHash" @toggleFullPost="toggleFullPost" :isFullPost="currentPostHash !== -1" v-if="currentPostHash !== -1 && postHash === currentPostHash || currentPostHash === -1"></Post>
            </div>
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
                postHashes: [] as number[],
                currentPostHash: -1 as number
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
            },
            toggleFullPost(postHash: number) {
                if (postHash !== null) {
                    this.currentPostHash = postHash;
                } else {
                    this.currentPostHash = -1;
                }
            }
        }
    });
</script>

<style scoped>

</style>