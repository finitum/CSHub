<template>
    <div v-if="postReduced !== null">
        <v-card class="previewCard" id="previewCard" :style="{maxHeight: maxheight}">
            <v-card-title primary-title>
                <div>
                    <h3 class="headline mb-0">{{postReduced.title}}</h3>
                    <div>{{postReduced.author.lastname}} {{postReduced.author.firstname}} - {{postReduced.datetime}}</div>
                </div>
            </v-card-title>

            <v-card-text>
                <div v-html="postReduced.lastEdit.content"></div>
            </v-card-text>

            <v-card-actions>
                <v-btn class="viewButton" flat color="primary" @click="navigateToPost" v-if="!isFullPost">View</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import jQuery from "jquery";
    import {Route} from "vue-router";

    import {ApiWrapper, LogObjectConsole, LogStringConsole} from "../../plugins";
    import {
        PostCallBack,
        PostPreviewCallBack,
        PostPreviewRequest,
        PostRequest
    } from "../../../../faq-site-shared/api-calls";
    import {IPost, IPostReduced} from "../../../../faq-site-shared/models";
    import router, {Routes} from "../../views/router";

    export default Vue.extend({
        name: "Post",
        data() {
            return {
                postReduced: null as IPostReduced,
                postFull: null as IPost,
                maxheight: "220px" as string
            };
        },
        props: {
            postHash: Number,
            isFullPost: Boolean
        },
        mounted() {
            console.log(this.isFullPost);
            if (this.isFullPost) {
                this.getFullPostRequest();
            } else {
                ApiWrapper.sendPostRequest(new PostPreviewRequest(this.postHash), (callbackData: PostPreviewCallBack) => {
                    this.postReduced = callbackData.post;
                    LogObjectConsole(callbackData.post, "PostPreview");
                });
            }

        },
        watch: {
            $route(to: Route, from: Route) {
                if (to.fullPath === Routes.INDEX && from.name === "post") {
                    jQuery("#previewCard").animate({
                        margin: "5%",
                        width: "90%"
                    });

                    this.maxheight = "220px";
                }
            }
        },
        methods: {
            getFullPostRequest() {
                ApiWrapper.sendPostRequest(new PostRequest(this.postHash), (callbackData: PostCallBack) => {

                    LogObjectConsole(callbackData.post, `Getting data for ${callbackData.post.title} fullpostrequest`);

                    this.postFull = callbackData.post;

                    this.postReduced = {
                        ...this.postFull,
                        lastEdit: callbackData.post.edits[0]
                    };

                    router.push(`${Routes.POST}/${this.postReduced.hash}`);
                });
            },
            navigateToPost(): void {

                LogStringConsole(`Going to post ${this.postReduced.title}`, "PostPreview navigateToPost");

                this.maxheight = "100%";

                jQuery("#previewCard").animate({
                    height: "100%",
                    margin: 0,
                    width: "100%"
                }, 5000, () => {
                    this.getFullPostRequest();
                });
            }
        }
    });
</script>

<style scoped>
    .previewCard {
        position: absolute;
        width: 90%;
        overflow: hidden;
        margin: 5%;
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