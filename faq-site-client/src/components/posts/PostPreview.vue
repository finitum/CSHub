<template>
    <div v-if="post !== null">
        <v-card class="previewCard" id="previewCard" :style="{maxHeight: maxheight}">
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
                <v-btn class="viewButton" flat color="primary" @click="navigateToPost">View</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {ApiWrapper, LogObjectConsole, LogStringConsole} from "../../plugins";
    import {
        PostCallBack,
        PostPreviewCallBack,
        PostPreviewRequest,
        PostRequest
    } from "../../../../faq-site-shared/api-calls";
    import {IPostReduced} from "../../../../faq-site-shared/models";
    import uiState from "../../store/ui";
    import jQuery from "jquery";
    import router, {Routes} from "../../views/router";
    import dataState from "../../store/data";

    export default Vue.extend({
        name: "PostPreview",
        props: {
            postHash: Number
        },
        data() {
            return {
                post: null as IPostReduced,
                maxheight: 220 as number
            };
        },
        mounted() {

            // IntelliJ doesn't know postId, but it is there. I'm afraid that's the limited vue TS implementation (https://github.com/vuejs/vue/pull/6856 might help)
            // We expect 1 edit here, as it's a preview
            ApiWrapper.sendPostRequest(new PostPreviewRequest(this.postHash), (callbackData: PostPreviewCallBack) => {
                this.post = callbackData.post;
                LogObjectConsole(callbackData.post, "PostPreview");
            });
        },
        methods: {
            navigateToPost(): void {

                // Get window height - 64 px for toolbar - some extra margin
                let windowsize = window.innerHeight - 64 - 50;

                LogStringConsole(`Going to post ${this.post.title} with window size ${windowsize}`, "PostPreview navigateToPost");

                this.maxheight = windowsize;

                jQuery("#previewCard").animate({
                    "minHeight": windowsize
                }, () => {

                    ApiWrapper.sendPostRequest(new PostRequest(this.post.hash), (callbackData: PostCallBack) => {

                        dataState.setCurrentPost(callbackData.post);
                        uiState.setPostHeight(this.maxheight);

                        router.push(`${Routes.POST}/${this.post.hash}`);
                    });

                    setTimeout(() => {

                    }, 1000)

                });


            }
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
        background-image: linear-gradient(to bottom, transparent, white);
    }
</style>