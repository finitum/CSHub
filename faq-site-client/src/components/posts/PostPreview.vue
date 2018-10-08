<template>
    <div v-if="post !== null">
        <v-card max-height="300px">
            <v-card-title primary-title>
                <div>
                    <h3 class="headline mb-0">{{post.title}}</h3>
                    <div>{{post.author.lastname}} {{post.author.firstname}} - {{post.datetime}}</div>
                </div>
            </v-card-title>

            <v-card-text>
                <div v-html="post.lastEdit.content"></div>
            </v-card-text>

            <v-card-actions>
                <v-btn flat color="orange">Share</v-btn>
                <v-btn flat color="orange">Explore</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {ApiWrapper, LogObjectConsole} from "../../plugins";
    import {PostPreviewCallBack, PostPreviewRequest} from "../../../../faq-site-shared/api-calls";
    import {IPostReduced} from "../../../../faq-site-shared/models";

    export default Vue.extend({
        name: "PostPreview",
        props: {
            postId: Number
        },
        data() {
            return {
                post: null as IPostReduced
            }
        },
        mounted() {
            // IntelliJ doesn't know postId, but it is there. I'm afraid that's the limited vue TS implementation (https://github.com/vuejs/vue/pull/6856 might help)
            // We expect 1 edit here, as it's a preview
            ApiWrapper.sendPostRequest(new PostPreviewRequest(this.postId), (callbackData: PostPreviewCallBack) => {
                this.post = callbackData.post;
                LogObjectConsole(callbackData.post, "PostPreview");
            });
        }
    })
</script>

<style scoped>

</style>