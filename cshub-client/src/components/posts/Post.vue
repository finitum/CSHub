import {PostVersionTypes} from "../../../../cshub-shared/api-calls/pages";
<template>
    <div v-if="post !== null && post.author !== undefined">
        <v-card :class="{previewCard: !fullPostComputed, fullCard: fullPostComputed}"
                :style="{backgroundColor: backgroundColorComputed}" id="postCard">
            <v-card-title primary-title id="postCardTitle">
                <v-breadcrumbs divider="/" style="width: 100%" v-if="fullPostComputed">
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
                    <v-btn color="orange" depressed small @click="enableEdit" v-if="(userOwnsThisPostComputed || userAdminComputed) && !editModeComputed">
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn v-if="editModeComputed" depressed small color="orange" @click="editPost">
                        <v-icon>mdi-circle-edit-outline</v-icon>
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

            <v-card-text v-show="fullPostComputed" v-if="post.htmlContent !== null" id="postCardText">
                <Quill key="editQuill" ref="editQuill" v-if="editModeComputed" :editorSetup="{allowEdit: true, showToolbar: true, postHash}" :value="editContent"></Quill>
                <div v-if="!editModeComputed" v-html="post.htmlContent"></div>
            </v-card-text>

            <v-card-actions>
                <v-btn class="viewButton" flat color="primary" @click="navigateToPost" v-if="!fullPostComputed"><b>View</b>
                </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    import Quill from "../quill/Quill.vue";

    import {ApiWrapper, logObjectConsole, logStringConsole} from "../../utilities";
    import {
        EditPostCallback,
        EditPost,
        GetPostCallBack,
        GetPost,
        GetPostContentCallBack,
        GetPostContent,
        PostVersionTypes,
        VerifyPostCallBack,
        VerifyPost, GetEditContent, GetEditContentCallback
    } from "../../../../cshub-shared/api-calls";
    import {IPost, ITopic} from "../../../../cshub-shared/models";
    import {Routes} from "../../views/router/router";
    import dataState from "../../store/data";
    import userState from "../../store/user";
    import Delta from "quill-delta/dist/Delta";
    import localForage from "localforage";
    import {getTopicFromHash} from "../../../../cshub-shared/utilities/Topics";
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
                editContent: {} as Delta,
                topicNames: [] as IBreadCrumbType[]
            };
        },
        props: {
            postHash: Number
        },
        mounted() {
            window.addEventListener("resize", this.windowHeightChanged);

            this.getPostRequest();

            if (this.editModeComputed) {
                this.enableEdit();
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
            },
            currentPostURLComputed: {
                get(): string {
                    return `${Routes.POST}/${this.postHash}`;
                }
            },
            fullPostComputed: {
                get(): boolean {
                    return this.$route.fullPath.includes(this.currentPostURLComputed);
                }
            },
            editModeComputed: {
                get(): boolean {
                    return this.$route.fullPath.includes(`${this.currentPostURLComputed}/edit`);
                }
            }
        },
        methods: {
            windowHeightChanged() {
                // Calculate the right height for the postcardtext, 100px padding
                logStringConsole("Resizing viewport");
                const newHeight = $("#postCard").height() - $("#postCardTitle").height() - 100;
                $("#postCardText").height(newHeight);
            },
            verifyPost() {
                ApiWrapper.sendPostRequest(new VerifyPost(this.postHash), (callback: VerifyPostCallBack) => {
                    logStringConsole("Verified post");
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

                    this.$router.push(`${this.currentPostURLComputed}/edit`);
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
                logStringConsole("Edited post");
                const delta: Delta = (this.$refs as any).editQuill.getDelta();

                const diff = this.editContent.diff(delta);

                ApiWrapper.sendPostRequest(new EditPost(this.postHash, diff), (callbackData: EditPostCallback) => {
                    this.$router.push(this.currentPostURLComputed);
                    this.getPostRequest();
                });

            },
            getPostRequest() {
                localForage.getItem(CacheTypes.POSTS + this.postHash)
                // The compiler is unaware of localForage it seems, so:
                // @ts-ignore
                    .then((cachedValue: IPost) => {
                        if (cachedValue === null || cachedValue.id === undefined) {
                            ApiWrapper.sendPostRequest(new GetPost(this.postHash), (callbackData: GetPostCallBack) => {
                                this.post = callbackData.post;
                                this.topicNames = this.getTopicListWhereFinalChildIs(getTopicFromHash(this.post.topicHash, dataState.topics));

                                logObjectConsole(callbackData.post, "getPostRequest");

                                if (this.fullPostComputed) {
                                    this.getContentRequest(callbackData.post);
                                }
                            });
                        } else {
                            logStringConsole("Gotten post from cache", "getPostRequest");

                            if (this.fullPostComputed) {
                                this.getContentRequest(cachedValue);
                            } else {
                                this.post = cachedValue;
                            }
                        }
                    });
            },
            getContentRequest(cachedValue: IPost) {
                ApiWrapper.sendPostRequest(new GetPostContent(this.postHash, typeof cachedValue.htmlContent !== "string", cachedValue.postVersion), (callbackContent: GetPostContentCallBack) => {

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
                                logStringConsole("Changed post in cache", "getContentRequest");
                            });
                    }
                }, (err: AxiosError) => {
                    this.post.htmlContent = cachedValue.htmlContent;
                    this.$forceUpdate();
                });
            },
            navigateToPost(): void {
                logStringConsole(`Going to post ${this.post.title}`, "PostPreview navigateToPost");
                this.getPostRequest();

                if (!this.$router.currentRoute.path.includes(Routes.USERDASHBOARD) && !this.$router.currentRoute.path.includes(Routes.ADMINDASHBOARD)) {
                    this.$router.push(this.currentPostURLComputed);
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