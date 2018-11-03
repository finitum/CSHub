import {PostVersionTypes} from "../../../../cshub-shared/api-calls/pages";
<template>
    <div v-if="post !== null && post.author !== undefined">
        <v-card :class="{previewCard: !isFullPost, fullCard: isFullPost}"
                :style="{backgroundColor: backgroundColorComputed}" id="postCard">
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
                    <v-btn color="orange" depressed small @click="enableEdit" v-if="(userOwnsThisPostComputed || userAdminComputed) && !editMode">
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn v-if="editMode" depressed small color="orange" @click="editPost">
                        <span>Submit edit</span>
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

            <v-card-text v-show="isFullPost" v-if="post.htmlContent !== null" id="postCardText">
                <Quill key="editQuill" ref="editQuill" v-if="editMode" :editorSetup="{allowEdit: true, showToolbar: true}" :value="editContent"></Quill>
                <div v-if="!editMode" v-html="post.htmlContent"></div>
            </v-card-text>

            <v-card-actions>
                <v-btn class="viewButton" flat color="primary" @click="navigateToPost" v-if="!isFullPost"><b>View</b>
                </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    import Quill from "../quill/Quill.vue";

    import {ApiWrapper, LogObjectConsole, LogStringConsole} from "../../utilities";
    import {
        EditPostCallback,
        EditPost,
        PostCallBack,
        PostRequest,
        PostVersionCallBack,
        PostVersionRequest,
        PostVersionTypes,
        VerifyPostCallBack,
        VerifyPostRequest, GetEditContent, GetEditContentCallback
    } from "../../../../cshub-shared/api-calls";
    import {IPost, ITopic} from "../../../../cshub-shared/models";
    import {Routes} from "../../views/router/router";
    import dataState from "../../store/data";
    import userState from "../../store/user";
    import Delta from "quill-delta/dist/Delta";
    import localForage from "localforage";
    import {getTopicFromHash} from "../../../../cshub-shared/utilities/topics";
    import {CacheTypes} from "../../utilities/cache-types";
    import {AxiosError} from "axios";

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
                editContent: {} as Delta,
                topicNames: [] as IBreadCrumbType[]
            };
        },
        props: {
            postHash: Number,
            isFullPost: Boolean
        },
        mounted() {
            window.addEventListener("resize", this.windowHeightChanged);

            this.getPostRequest();
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
            enableEdit() {
                ApiWrapper.sendPostRequest(new GetEditContent(this.postHash), (callbackData: GetEditContentCallback) => {
                    let baseDelta = new Delta(callbackData.deltas[0]);
                    for (let i = 1; i < callbackData.deltas.length; i++) {
                        baseDelta = baseDelta.compose(callbackData.deltas[i]);
                    }

                    this.editContent = baseDelta;
                    this.editMode = true;
                });
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

                const diff = this.editContent.diff(delta);

                ApiWrapper.sendPostRequest(new EditPost(this.postHash, diff), (callbackData: EditPostCallback) => {
                    this.editMode = false;
                    this.getPostRequest();
                });

            },
            getPostRequest() {
                localForage.getItem(CacheTypes.POSTS + this.postHash)
                // The compiler is unaware of localForage it seems, so:
                // @ts-ignore
                    .then((cachedValue: IPost) => {
                        if (cachedValue === null || cachedValue.id === undefined) {
                            ApiWrapper.sendPostRequest(new PostRequest(this.postHash), (callbackData: PostCallBack) => {
                                this.post = callbackData.post;
                                this.topicNames = this.getTopicListWhereFinalChildIs(getTopicFromHash(this.post.topicHash, dataState.topics));

                                LogObjectConsole(callbackData.post, "getPostRequest");

                                if (this.isFullPost) {
                                    this.getContentRequest(callbackData.post);
                                }
                            });
                        } else {
                            LogStringConsole("Gotten post from cache", "getPostRequest");

                            if (this.isFullPost) {
                                this.getContentRequest(cachedValue);
                            } else {
                                this.post = cachedValue;
                            }
                        }
                    });
            },
            getContentRequest(cachedValue: IPost) {
                ApiWrapper.sendPostRequest(new PostVersionRequest(this.postHash, typeof cachedValue.htmlContent !== "string", cachedValue.postVersion), (callbackContent: PostVersionCallBack) => {

                    let hasBeenUpdated = false;

                    if (callbackContent.postVersionType === PostVersionTypes.POSTDELETED) {
                        this.$router.push(Routes.INDEX);
                    } else if (callbackContent.postVersionType === PostVersionTypes.UPDATEDPOST) {
                        this.post = callbackContent.postUpdated;
                        this.post.htmlContent = callbackContent.htmlContent;
                        hasBeenUpdated = true;
                    } else if (callbackContent.postVersionType === PostVersionTypes.RETRIEVEDCONTENT) {
                        this.post = cachedValue;
                        this.post.htmlContent = callbackContent.htmlContent;
                        hasBeenUpdated = true;
                    } else if (callbackContent.postVersionType === PostVersionTypes.NOCHANGE) {
                        this.post = cachedValue;
                    }

                    if (hasBeenUpdated) {
                        this.$forceUpdate();
                        localForage.setItem(CacheTypes.POSTS + this.postHash, this.post)
                            .then(() => {
                                LogStringConsole("Changed post in cache", "getContentRequest");
                            });
                    }
                }, (err: AxiosError) => {
                    this.post.htmlContent = cachedValue.htmlContent;
                    this.$forceUpdate();
                });
            },
            navigateToPost(): void {
                LogStringConsole(`Going to post ${this.post.title}`, "PostPreview navigateToPost");
                this.getPostRequest();

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