<template>
    <div v-if="postReduced !== null">
        <v-card id="previewCard" :class="{previewCard: !isFullPost, fullCard: isFullPost}" :style="{backgroundColor: backgroundColorComputed}">
            <v-card-title primary-title>
                <v-breadcrumbs divider="/" style="width: 100%" v-if="isFullPost">
                    <v-btn color="primary" depressed small dark @click="returnToPostMenu">
                        <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                    <v-breadcrumbs-item
                        v-for="item in topicNames"
                        :key="item.index"
                        :disabled="false"
                    >
                        <router-link :to="item.url">{{item.name}}</router-link>
                    </v-breadcrumbs-item>
                    <v-breadcrumbs-item
                            :disabled="true"
                    >
                        {{postReduced.title}}
                    </v-breadcrumbs-item>
                </v-breadcrumbs>
                <v-badge right color="green" overlap class="mr-3 pl-3">
                    <span slot="badge">{{postReduced.upvotes}}</span>
                    <v-avatar
                            :tile="false"
                            :size="50"
                            :class="{adminBorder: postReduced.author.admin}"
                    >
                        <img :src="postReduced.author.avatar" alt="avatar">
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

    import {ApiWrapper, LogObjectConsole, LogStringConsole} from "../../utilities";
    import {
        PostCallBack,
        PostPreviewCallBack,
        PostPreviewRequest,
        PostRequest
    } from "../../../../faq-site-shared/api-calls";
    import {IPost, IPostReduced, ITopic} from "../../../../faq-site-shared/models";
    import {Routes} from "../../views/router/router";
    import dataState from "../../store/data";

    interface IBreadCrumbType {
        name: string;
        url: string;
    }

    export default Vue.extend({
        name: "Post",
        data() {
            return {
                postReduced: null as IPostReduced,
                postFull: null as IPost,
                topicNames: [] as IBreadCrumbType[]
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
        computed: {
            backgroundColorComputed(): string {
                return !this.postReduced.approved ? "orange" : "";
            }
        },
        methods: {
            returnToPostMenu() {
                if (!this.$router.currentRoute.path.includes(Routes.USERDASHBOARD)) {
                    this.$router.go(-1);
                } else {
                    this.$emit("toggleFullPost", null);
                }
            },
            getParentTopic(child: ITopic, topics: ITopic[]): ITopic {
                for (const topic of topics) {
                    if (topic.children !== undefined && topic.children.findIndex((x) => x.id === child.id) !== -1) {
                        return topic;
                    } else if (topic.children !== undefined && topic.children.length > 0) {
                        const currTopic = this.getParentTopic(child, topic.children);
                        if (currTopic !== null) {
                            return currTopic;
                        }
                    }
                }
                return null;
            },
            getTopicListWhereFinalChildIs(child: ITopic): IBreadCrumbType[] {
                const parentTopic = this.getParentTopic(child, dataState.topics);

                const currTopic: IBreadCrumbType = {
                    name: child.name,
                    url: `${Routes.TOPIC}/${child.hash}`
                };

                if (parentTopic !== null) {
                    const parentArray: IBreadCrumbType[] = this.getTopicListWhereFinalChildIs(parentTopic);
                    return [...parentArray, currTopic];
                } else {
                    return [currTopic];
                }
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

                    this.topicNames = this.getTopicListWhereFinalChildIs(callbackData.post.topic);
                    this.postFull = callbackData.post;

                    this.postReduced = {
                        ...this.postFull,
                        lastEdit: callbackData.post.edits[0]
                    };

                    if (!this.$router.currentRoute.path.includes(Routes.USERDASHBOARD)) {
                        this.$router.push(`${Routes.POST}/${this.postReduced.hash}`);
                    } else {
                        this.$emit("toggleFullPost", callbackData.post.hash);
                    }
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
        margin: 20px 5% 20px 5%;
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