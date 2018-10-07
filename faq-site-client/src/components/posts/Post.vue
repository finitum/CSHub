<template>
    <div v-if="postReduced !== null">
        <v-card id="previewCard" :class="{previewCard: !isFullPost, fullCard: isFullPost}">
            <v-card-title primary-title>
                <v-breadcrumbs divider="/" style="width: 100%">
                    <v-breadcrumbs-item

                            :disabled="true"
                    >
                        HOi
                    </v-breadcrumbs-item>
                </v-breadcrumbs>
                <v-badge right color="green" overlap class="mr-3">
                    <span slot="badge">{{postReduced.upvotes}}</span>
                    <v-avatar
                            :tile="false"
                            :size="50"
                            :class="{adminBorder: postReduced.author.admin}"
                    >
                        <img src="https://www.w3schools.com/howto/img_avatar.png" alt="avatar">
                    </v-avatar>
                </v-badge>
                <div>
                    <h3 class="headline mb-0">{{postReduced.title}}</h3>
                    <div>{{postReduced.author.firstname}} {{postReduced.author.lastname}} - {{postReduced.datetime | formatDate}}</div>
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
    import {IPost, IPostReduced, ITopic} from "../../../../faq-site-shared/models";
    import router, {Routes} from "../../views/router";
    import dataState from "../../store/data";

    type thing = {title: string, url: string}

    export default Vue.extend({
        name: "Post",
        data() {
            return {
                postReduced: null as IPostReduced,
                postFull: null as IPost,
                topicNames: [] as Array<{name: string, url: string}>
            };
        },
        props: {
            postHash: Number,
            isFullPost: Boolean
        },
        mounted() {
            if (this.isFullPost) {
                this.getFullPostRequest();
            } else {
                this.getPreviewPostRequest();
            }
        },
        watch: {
            $route(to: Route, from: Route) {
                if (to.fullPath === Routes.INDEX && from.name === "post") {
                    LogStringConsole("Going from full to preview");
                }
            }
        },
        methods: {
            getTopicListWhereFinalChildIs(child: ITopic): Array<> {
                const parentTopic = dataState.topics.find((x) => x.children.findIndex((y) => y.id === child.id) !== -1);
                return new Array[...this.getTopicListWhereFinalChildIs(parentTopic), {name: child.name, url: Routes.TOPIC + "/" + child.hash}];
            },
            getPreviewPostRequest() {
                ApiWrapper.sendPostRequest(new PostPreviewRequest(this.postHash), (callbackData: PostPreviewCallBack) => {
                    this.postReduced = callbackData.post;
                    LogObjectConsole(callbackData.post, "PostPreview");
                });
            },
            getFullPostRequest() {
                ApiWrapper.sendPostRequest(new PostRequest(this.postHash), (callbackData: PostCallBack) => {

                    LogObjectConsole(callbackData.post, `Getting data for ${callbackData.post.title} fullpostrequest`);

                    const topicNames = this.getTopicListWhereFinalChildIs(callbackData.post.topic);

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
                this.getFullPostRequest();
            }
        }
    });
</script>

<style scoped>

    .adminBorder {
        box-shadow: 0 0 2pt 3pt #ad073b;
    }

    .previewCard {
        position: relative;
        width: 90%;
        overflow: hidden;
        margin: 5%;
        max-height: 220px;
    }

    .fullCard {
        position: absolute;
        width: 100%;
        overflow: hidden;
        margin: 0;
        height: 100%;
        max-height: 100%;
    }

    .viewButton {
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