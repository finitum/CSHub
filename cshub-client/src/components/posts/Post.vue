<template>
    <div v-if="post !== null">
        <v-card :class="{previewCard: !isFullPost, fullCard: isFullPost}" :style="{backgroundColor: backgroundColorComputed}" id="postCard">
            <v-card-title primary-title id="postCardTitle">
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
                        {{post.title}}
                    </v-breadcrumbs-item>
                    <v-btn color="green" depressed small @click="verifyPost" v-if="!post.approved && userAdminComputed">
                        <v-icon>mdi-check</v-icon>
                    </v-btn>
                    <v-btn color="orange" depressed small @click="editMode = true" v-if="userOwnsThisPostComputed || userAdminComputed">
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn v-if="editMode" depressed small color="primary" @click="editPost">
                        <span>Submit</span>
                    </v-btn>
                </v-breadcrumbs>
                <v-badge right color="green" overlap class="mr-3 pl-3">
                    <span slot="badge">{{post.upvotes}}</span>
                    <v-avatar
                            :tile="false"
                            :size="50"
                            :class="{adminBorder: post.author.admin}"
                    >
                        <img :src="post.author.avatar" alt="avatar">
                    </v-avatar>
                </v-badge>
                <div>
                    <h3 class="headline mb-0">{{post.title}}</h3>
                    <div>{{post.author.firstname}} {{post.author.lastname}} - {{post.datetime | formatDate}}</div>
                </div>
            </v-card-title>

            <v-card-text v-show="isFullPost" v-if="content !== null" id="postCardText">
                <Quill key="editQuill" ref="editQuill" v-if="editMode" :editorSetup="{allowEdit: true, showToolbar: true}" :value="content"></Quill>
                <Quill key="viewQuill" ref="viewQuill" v-if="!editMode" :editorSetup="{allowEdit: false, showToolbar: false}" :value="content"></Quill>
            </v-card-text>

            <v-card-actions>
                <v-btn class="viewButton" flat color="primary" @click="navigateToPost" v-if="!isFullPost"><b>View</b></v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    import Quill from "../quill/Quill.vue";

    import {ApiWrapper, LogObjectConsole, LogStringConsole} from "../../utilities";
    import {
        PostCallBack,
        PostRequest, VerifyPostCallBack,
        VerifyPostRequest,
        EditPostRequest, EditPostCallback, PostContentRequest, PostContentCallBack
    } from "../../../../cshub-shared/api-calls";
    import {IPost, ITopic} from "../../../../cshub-shared/models";
    import {Routes} from "../../views/router/router";
    import dataState from "../../store/data";
    import userState from "../../store/user";
    import Delta from "quill-delta/dist/Delta";
    import {getTopicFromHash} from "../../../../cshub-shared/utilities/topics";

    interface IBreadCrumbType {
        name: string;
        url: string;
    }

    export default Vue.extend({
        name: "Post",
        components: {Quill},
        data() {
            return {
                post: null as IPost,
                editMode: false as boolean,
                topicNames: [] as IBreadCrumbType[],
                content: null as Delta
            };
        },
        props: {
            postHash: Number,
            isFullPost: Boolean
        },
        mounted() {
            window.addEventListener("resize", this.windowHeightChanged);

            if (this.isFullPost) {
                this.getFullPostRequest();
            } else {
                this.getPreviewPostRequest();
            }
        },
        computed: {
            backgroundColorComputed(): string {
                return !this.post.approved ? "#FFD740" : "";
            },
            userOwnsThisPostComputed: {
                get(): boolean {
                    if (userState.userModel !== null) {
                        return userState.userModel.id === this.post.author.id;
                    } else {
                        return false;
                    }
                }
            },
            userAdminComputed: {
                get(): boolean {
                    return userState.isAdmin;
                }
            }
        },
        methods: {
            windowHeightChanged() {
                // Calculate the right height for the postcardtext, 100px padding
                LogStringConsole("Resizing viewport");
                const newHeight = $("#postCard").height() - $("#postCardTitle").height() - 100;
                $("#postCardText").height(newHeight);
            },
            verifyPost() {
                ApiWrapper.sendPostRequest(new VerifyPostRequest(this.postHash), (callback: VerifyPostCallBack) => {
                    LogStringConsole("Verified post");
                    this.$router.push(Routes.INDEX);
                });
            },
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
            editPost() {
                LogStringConsole("Edited post");
                const delta: Delta = (this.$refs as any).editQuill.getDelta();

                ApiWrapper.sendPostRequest(new EditPostRequest(this.postHash, delta), (callbackData: EditPostCallback) => {
                    this.$router.push(Routes.INDEX);
                });

            },
            getPreviewPostRequest() {
                ApiWrapper.sendPostRequest(new PostRequest(this.postHash, false), (callbackData: PostCallBack) => {
                    this.post = callbackData.post;
                    LogObjectConsole(callbackData.post, "PostPreview");

                    this.getContentRequest();
                });
            },
            getContentRequest() {
                ApiWrapper.sendPostRequest(new PostContentRequest(this.postHash), (callbackContent: PostContentCallBack) => {
                    LogStringConsole("Preview post gotten content");
                    this.topicNames = this.getTopicListWhereFinalChildIs(getTopicFromHash(this.post.topicHash, dataState.topics));
                    this.content = callbackContent.content;
                });
            },
            getFullPostRequest() {
                if (this.post === null) {
                    ApiWrapper.sendPostRequest(new PostRequest(this.postHash, this.content === null), (callbackData: PostCallBack) => {

                        LogObjectConsole(callbackData.post, `Getting data for ${callbackData.post.title} fullpostrequest`);

                        const currTopic: ITopic = getTopicFromHash(callbackData.post.topicHash, dataState.topics);
                        this.topicNames = this.getTopicListWhereFinalChildIs(currTopic);
                        this.post = callbackData.post;

                        if (this.content === null && callbackData.content !== null) {
                            this.content = callbackData.content;
                        }

                        // Wait for one tick, then init height
                        Vue.nextTick()
                            .then(() => {
                                this.windowHeightChanged();
                            });
                    });
                } else if (this.content === null) {
                    this.getContentRequest();
                }

                // Wait for one tick, then init height
                Vue.nextTick()
                    .then(() => {
                        this.windowHeightChanged();
                    });
            },
            navigateToPost(): void {
                LogStringConsole(`Going to post ${this.post.title}`, "PostPreview navigateToPost");
                this.getFullPostRequest();

                if (!this.$router.currentRoute.path.includes(Routes.USERDASHBOARD) && !this.$router.currentRoute.path.includes(Routes.ADMINDASHBOARD)) {
                    this.$router.push(`${Routes.POST}/${this.post.hash}`);
                } else {
                    this.$emit("toggleFullPost", this.post.hash);
                }

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
        text-align: right;
        margin: 0;
        padding: 0;
        background-image: linear-gradient(to bottom, transparent, white);
    }
</style>