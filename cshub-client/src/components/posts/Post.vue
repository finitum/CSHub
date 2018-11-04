<template>
    <div>
        <div v-if="post !== null">
            <!-- The following transition is just a trick so I get an event on the change from preview to full post (performance of the animation when the viewer is on is terrible) -->
            <transition :duration="300" @before-leave="showContent = false" @before-enter="showContent = false" @after-enter="afterAnimation">
                <div v-if="fullPostComputed"></div>
            </transition>

            <v-card :class="{previewCard: !fullPostComputed, fullCard: fullPostComputed}" id="postCard">
                <v-card-title primary-title id="postCardTitle" style="padding-bottom: 0;">
                    <transition name="breadcrumb">
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
                            <v-btn color="green" depressed small @click="verifyPost"
                                   v-if="!post.approved && userAdminComputed">
                                <v-icon>mdi-check</v-icon>
                            </v-btn>
                            <v-btn color="orange" depressed small @click="enableEdit"
                                   v-if="(userOwnsThisPostComputed || userAdminComputed) && !editModeComputed">
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                            <v-btn v-if="editModeComputed" depressed small color="orange" @click="editPost">
                                <v-icon>mdi-circle-edit-outline</v-icon>
                            </v-btn>
                        </v-breadcrumbs>
                    </transition>
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
                        <h3 class="headline mb-0">{{post.title}}</h3><p v-if="!post.approved && fullPostComputed" style="color: grey">(unverified)</p>
                        <div>{{post.author.firstname}} {{post.author.lastname}} - {{post.datetime | formatDate}}</div>
                    </div>
                </v-card-title>

                <v-container
                    v-show="fullPostComputed"
                    position="relative"
                    class="scroll-y"
                    id="post-scroll-target"
                    style="margin: 0; padding-top: 0; max-width: none; overflow-wrap: break-word"
                >
                    <v-layout
                      column
                      align-center
                      justify-center
                      v-scroll:#post-scroll-target>
                        <v-card-text v-if="!loadingIcon" id="postCardText">
                            <Quill key="editQuill" ref="editQuill" v-if="editModeComputed"
                                   :editorSetup="{allowEdit: true, showToolbar: true, postHash}"
                                   :value="editContent"></Quill>
                            <div v-if="!editModeComputed" v-show="showContent" v-html="post.htmlContent"></div>
                        </v-card-text>
                    </v-layout>
                </v-container>
                <div v-if="loadingIcon">
                    <v-progress-circular
                            :size="150"
                            :width="5"
                            color="primary"
                            indeterminate
                            style="width: 100%; margin: 10% auto;"
                    ></v-progress-circular>
                </div>

                <v-card-actions>
                    <v-btn class="viewButton" flat color="primary" @click="navigateToPost" v-if="!fullPostComputed"><b>View</b>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </div>
        <div v-else-if="loadingIcon">
            <v-progress-circular
                    :size="150"
                    :width="5"
                    color="primary"
                    indeterminate
                    style="width: 100%; margin: 10% auto;"
            ></v-progress-circular>
        </div>
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
    import {ImgurUpload} from "../../utilities/imgur";
    import {Route} from "vue-router";

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
                canResize: true,
                editContent: {} as Delta,
                showContent: true,
                topicNames: [] as IBreadCrumbType[],
                loadingIcon: false
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
                    return this.$route.fullPath.includes(this.postHash.toString());
                }
            },
            editModeComputed: {
                get(): boolean {
                    return this.$route.fullPath.includes(`${this.postHash}/edit`);
                }
            }
        },
        watch: {
            $route(to: Route, from: Route) {
                if (this.fullPostComputed && (from.name === "topic" || from.fullPath === Routes.INDEX)) {
                    this.getContentRequest(this.post);
                }
            }
        },
        updated() {
            this.windowHeightChanged();
        },
        methods: {
            windowHeightChanged() {
                if (this.canResize) {
                    // Calculate the right height for the postcardtext, 100px padding
                    this.canResize = false;

                    const postCard = document.getElementById("postCard");
                    const postCardTitle = document.getElementById("postCardTitle");
                    if (postCard !== null && postCardTitle !== null) {
                        const newHeight = postCard.clientHeight - postCardTitle.clientHeight - 50;
                        document.getElementById("post-scroll-target").style.maxHeight = `${newHeight}px`;

                        setTimeout(() => {
                            this.canResize = true;
                        }, 500);
                    } else {
                        this.canResize = true;
                    }

                }

            },
            verifyPost() {
                ApiWrapper.sendPostRequest(new VerifyPost(this.postHash), (callback: VerifyPostCallBack) => {
                    logStringConsole("Verified post");
                    this.$router.push(Routes.INDEX);
                });
            },
            returnToPostMenu() {
                this.$router.go(-1);
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

                ImgurUpload.findAndReplaceImagesWithImgurLinks(delta)
                    .then((newValue: Delta) => {
                        const diff = this.editContent.diff(newValue);

                        ApiWrapper.sendPostRequest(new EditPost(this.postHash, diff), (callbackData: EditPostCallback) => {
                            this.$router.push(this.currentPostURLComputed);
                            this.getPostRequest();
                        });
                    });
            },
            getPostRequest() {
                localForage.getItem(CacheTypes.POSTS + this.postHash)
                // The compiler is unaware of localForage it seems, so:
                // @ts-ignore
                    .then((cachedValue: IPost) => {
                        if (cachedValue === null || cachedValue.id === undefined) {
                            ApiWrapper.sendPostRequest(new GetPost(this.postHash), (callbackData: GetPostCallBack) => {
                                if (callbackData.post !== null) {
                                    this.post = callbackData.post;

                                    logObjectConsole(callbackData.post, "getPostRequest");

                                    if (this.fullPostComputed) {
                                        this.getContentRequest(callbackData.post);
                                    }
                                } else {
                                    this.$router.push(Routes.INDEX);
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
                const timeOut = setTimeout(() => {
                    this.loadingIcon = true;
                }, 250);

                ApiWrapper.sendPostRequest(new GetPostContent(this.postHash, typeof cachedValue.htmlContent !== "string", cachedValue.postVersion), (callbackContent: GetPostContentCallBack) => {

                    clearTimeout(timeOut);
                    this.loadingIcon = false;

                    let hasBeenUpdated = false;

                    if (callbackContent.postVersionType === PostVersionTypes.POSTDELETED) {
                        this.$router.push(Routes.INDEX);
                    } else if (callbackContent.postVersionType === PostVersionTypes.UPDATEDPOST) {
                        this.post = callbackContent.postUpdated;
                        this.post.htmlContent = callbackContent.content.html;
                        this.post.approved = callbackContent.content.approved;
                        hasBeenUpdated = true;
                    } else if (callbackContent.postVersionType === PostVersionTypes.RETRIEVEDCONTENT) {
                        this.post = cachedValue;
                        this.post.htmlContent = callbackContent.content.html;
                        this.post.approved = callbackContent.content.approved;
                        hasBeenUpdated = true;
                    } else if (callbackContent.postVersionType === PostVersionTypes.NOCHANGE) {
                        this.post = cachedValue;
                    }

                    this.topicNames = this.getTopicListWhereFinalChildIs(getTopicFromHash(this.post.topicHash, dataState.topics));

                    if (hasBeenUpdated) {
                        this.$forceUpdate();
                        localForage.setItem(CacheTypes.POSTS + this.postHash, this.post)
                            .then(() => {
                                logStringConsole("Changed post in cache", "getContentRequest");
                            });
                    }

                    Vue.nextTick()
                        .then(() => {
                            logStringConsole("Resizing viewport after post content set");
                            this.windowHeightChanged();
                        });
                }, (err: AxiosError) => {

                    clearTimeout(timeOut);
                    this.loadingIcon = false;

                    this.post.htmlContent = cachedValue.htmlContent;
                    this.$forceUpdate();
                });
            },
            afterAnimation() {
                this.showContent = true;
            },
            navigateToPost(): void {
                logStringConsole(`Going to post ${this.post.title}`, "PostPreview navigateToPost");

                this.$router.push(this.currentPostURLComputed);
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
        max-height: 110px;
        width: 90%;
        overflow: hidden;
        margin: 20px 5% 20px 5%;
        transition: 0.3s;
    }

    .fullCard {
        position: absolute;
        width: 100%;
        overflow: hidden;
        margin: 0;
        height: 100%;
        max-height: 100%;
        transition: 0.3s;
    }

    .viewButton {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        text-align: right;
        margin: 0;
        padding: 0;
    }

    .breadcrumb-enter-active {
        transition: opacity .2s;
    }
    .breadcrumb-leave-active {
        transition: opacity .1s;
    }
    .breadcrumb-enter, .breadcrumb-leave-to {
        opacity: 0;
    }
</style>