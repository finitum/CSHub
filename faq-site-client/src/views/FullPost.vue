<template>
    <v-flex>
        <div v-if="post !== null">
            <v-card class="previewCard" id="previewCard" :style="{maxHeight: `${maxheight}px`, minHeight: `${maxheight}px`}">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">{{post.title}}</h3>
                        <div>{{post.author.lastname}} {{post.author.firstname}} - {{post.datetime}}</div>
                    </div>
                </v-card-title>

                <v-card-text>
                    <div v-html="post.edits[0].content"></div>
                </v-card-text>
            </v-card>
        </div>
    </v-flex>
</template>

<script lang="ts">
    import Vue from "vue";
    import {IPost} from "../../../faq-site-shared/models";
    import {ApiWrapper, LogObjectConsole} from "../plugins";
    import {PostCallBack, PostRequest} from "../../../faq-site-shared/api-calls/pages";
    import uiState from "../store/ui";
    import dataState from "../store/data";

    export default Vue.extend({
        name: "FullPost",
        data() {
            return {
                posthash: null as number,
                post: null as IPost,
                maxheight: (window.innerHeight - 64 - 50) as number
            };
        },
        mounted() {

            this.posthash = +this.$route.params.hash;
            this.maxheight = uiState.postHeight;

            if (dataState.currentpost === null) {
                ApiWrapper.sendPostRequest(new PostRequest(this.posthash), (callbackData: PostCallBack) => {
                    this.post = callbackData.post;
                    LogObjectConsole(callbackData.post, "Post");
                });
            } else {
                this.post = dataState.currentpost;
            }
        },
        beforeDestroy() {
            dataState.setCurrentPost(null);
        }
    });
</script>

<style scoped>
    .previewCard {
        overflow: hidden;
        margin: 10px;
    }
    .previewCard .viewButton {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        text-align: center;
        margin: 0;
        padding: 0;
    }
</style>