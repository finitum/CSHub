import {EditPostReturnTypes} from "../../../../cshub-shared/src/api-calls/pages";
<template>
    <div>
        <div v-if="post !== null">
            <!-- The following transition is just a trick so I get an event on the change from preview to full post (performance of the animation when the viewer is on is terrible) -->
            <transition :duration="300" @before-leave="showContent = false" @before-enter="showContent = false"
                        @after-enter="afterAnimation">
                <div v-if="fullPostComputed"></div>
            </transition>
            <v-card :class="{previewCard: !fullPostComputed, fullCard: fullPostComputed}" :id="'post_' + domId">
                <v-card-title primary-title :id="'postTitle_' + domId" class="pb-0 xl-0 pt-1"
                              @click.capture="navigateToPost">
                    <transition name="topMenuShow">
                        <div v-if="!showTopMenu && fullPostComputed">
                            <v-btn color="primary" depressed small dark @click="returnToPostMenu">
                                <v-icon>fas fa-chevron-left</v-icon>
                            </v-btn>
                            <v-btn color="secondary" depressed small @click="showTopMenu = true">
                                <v-icon>fas fa-angle-down</v-icon>
                            </v-btn>
                        </div>
                    </transition>
                    <span v-if="showTopMenu || !fullPostComputed" style="display: contents">
                        <transition name="breadcrumb">
                            <v-breadcrumbs divider="/" style="width: 100%" v-if="fullPostComputed">
                                <v-btn color="primary" depressed small dark @click="returnToPostMenu">
                                    <v-icon>fas fa-chevron-left</v-icon>
                                </v-btn>
                                <v-breadcrumbs-item
                                        v-for="item in topicNames"
                                        :key="item.index"
                                        :disabled="false">
                                    <router-link :to="item.url">{{item.name}}</router-link>
                                </v-breadcrumbs-item>
                                <v-breadcrumbs-item :disabled="true"> {{post.title}} </v-breadcrumbs-item>
                                <v-btn color="red" depressed small @click="hidePost()" v-if="!editModeComputed && userAdminComputed">
                                    <v-icon>fas fa-trash</v-icon>
                                </v-btn>
                                <v-btn color="orange" depressed small @click="enableEdit"
                                       v-if="!editModeComputed && userIsLoggedIn">
                                    <v-icon>fas fa-edit</v-icon>
                                </v-btn>
                                <v-btn v-if="editModeComputed && userAdminComputed" depressed small color="orange"
                                       @click="editPost">
                                    <v-icon>fas fa-save</v-icon>
                                </v-btn>
                                <v-btn depressed small color="primary" @click="viewEditDialog" v-if="!editModeComputed">
                                    <v-icon>fas fa-history</v-icon>
                                </v-btn>
                                <v-btn depressed small color="secondary" @click="showTopMenu = false">
                                    <v-icon>fas fa-angle-up</v-icon>
                                </v-btn>
                            </v-breadcrumbs>
                        </transition>
                        <v-list two-line style="width: 100%">
                            <v-list-tile avatar class="mb-1 postTile">
                                <v-list-tile-avatar>
                                    <img :src="getAvatarURL(post.author.avatar)"
                                         :class="{adminBorder: post.author.admin, leekBorder: !post.author.admin}"/>
                                </v-list-tile-avatar>
                                <v-list-tile-content class="pt-2 d-inline">
                                    <v-list-tile-sub-title class="whitespaceInit black--text post-title">
                                        <span v-if="!editModeComputed || !userAdminComputed">{{post.title}}{{isNewPost !== null ? (isNewPost ? " - new post" : " - new edits") : ""}}</span>
                                        <input v-else style="width: 100%" v-model="post.title"/>
                                    </v-list-tile-sub-title>
                                    <v-list-tile-sub-title class="whitespaceInit">{{post.author.firstname}} {{post.author.lastname}} - {{post.datetime | formatDate}}</v-list-tile-sub-title>
                                    <v-treeview
                                            v-if="topics !== null && editModeComputed && userAdminComputed"
                                            :active.sync="activeTopicHash"
                                            :items="topics"
                                            item-key="hash"
                                            activatable
                                            active-class="primary--text"
                                            transition>
                                    </v-treeview>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-list>
                    </span>
                </v-card-title>
                <v-container
                        v-if="fullPostComputed && !editModeComputed"
                        position="relative"
                        class="scroll-y"
                        :class="'postScrollWindow_' + domId"
                        style="margin: 0; padding-top: 0; max-width: none; overflow-wrap: break-word">
                    <v-layout
                            column
                            align-center
                            justify-center
                            v-scroll:#post-scroll-target>
                        <v-card-text v-if="!loadingIcon" id="postCardText">
                            <div class="ql-editor">
                                <div v-show="showContent" v-html="post.htmlContent"></div>
                            </div>
                        </v-card-text>
                    </v-layout>
                </v-container>
                <Quill key="editQuill"
                       ref="editQuill"
                       :class="'postScrollWindow_' + domId"
                       v-if="fullPostComputed && !loadingIcon && editModeComputed"
                       style="margin-bottom: 20px"
                       :editorSetup="{allowEdit: true, showToolbar: true, postHash}"
                ></Quill>

                <div v-if="loadingIcon">
                    <v-progress-circular
                            :size="150"
                            :width="5"
                            color="primary"
                            indeterminate
                            style="width: 100%; margin: 10% auto;"/>
                </div>
            </v-card>
        </div>
        <div v-else-if="loadingIcon">
            <v-progress-circular
                    :size="150"
                    :width="5"
                    color="primary"
                    indeterminate
                    style="width: 100%; margin: 10% auto;"/>
        </div>
        <PostEditsDialog :key="postHash" :postHash="postHash"></PostEditsDialog>
    </div>
</template>
<script lang="ts">
    import Vue from "vue";
    import localForage from "localforage";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import {Route} from "vue-router";
    import {AxiosError} from "axios";

    import Quill from "../quill/Quill.vue";
    import PostEditsDialog from "./PostEditsDialog.vue";

    import {
        EditPost,
        EditPostCallback, EditPostReturnTypes,
        GetPost,
        GetPostCallBack,
        GetPostContent,
        GetPostContentCallBack,
        HidePost,
        HidePostCallBack,
        PostVersionTypes
    } from "../../../../cshub-shared/src/api-calls";
    import {IPost, ITopic} from "../../../../cshub-shared/src/models";
    import {getTopicFromHash} from "../../../../cshub-shared/src/utilities/Topics";
    import {Routes} from "../../../../cshub-shared/src/Routes";

    import {ApiWrapper, logObjectConsole, logStringConsole} from "../../utilities";
    import {CacheTypes} from "../../utilities/cache-types";
    import {idGenerator} from "../../utilities/id-generator";

    import dataState from "../../store/data";
    import userState from "../../store/user";
    import uiState from "../../store/ui";
    import Delta from "quill-delta/dist/Delta";

    interface IBreadCrumbType {
        name: string;
        url: string;
    }

    @Component({
        name: "Post",
        components: {Quill, PostEditsDialog},
    })
    export default class Post extends Vue {

        /**
         * Data
         */
        @Prop(Number) private postHash: number;
        @Prop(Boolean) private isNewPost: boolean;

        private domId: string = idGenerator();
        private post: IPost = null;
        private topicNames: IBreadCrumbType[] = [];
        private canResize = true;
        private showContent = true;
        private loadingIcon = false;
        private previousTopicURL = "";
        private showTopMenu = true;
        private resizeInterval: number;

        private activeTopicHash: number[] = [];

        /**
         * Computed properties
         */
        get userOwnsThisPostComputed(): boolean {
            if (userState.userModel !== null) {
                return userState.userModel.id === this.post.author.id;
            } else {
                return false;
            }
        }

        get userAdminComputed(): boolean {
            return userState.isAdmin;
        }

        get userIsLoggedIn(): boolean {
            return userState.isLoggedIn;
        }

        get currentPostURLComputed(): string {
            return `${Routes.POST}/${this.postHash}`;
        }

        get fullPostComputed(): boolean {
            return this.$route.fullPath.includes(this.postHash.toString());
        }

        get editModeComputed(): boolean {
            return this.$route.fullPath === `${this.currentPostURLComputed}/edit`;
        }

        get editsListComputed(): boolean {
            return this.$route.fullPath === `${this.currentPostURLComputed}/edits`;
        }

        get topics(): ITopic[] {
            return dataState.topics;
        }

        /**
         * Watchers
         */
        @Watch("$route")
        private routeChanged(to: Route, from: Route) {
            if (this.fullPostComputed || to.fullPath.includes(this.postHash.toString())) {
                if (from.name === "topic" || from.fullPath === Routes.INDEX) {
                    this.getContentRequest(this.post);
                    this.previousTopicURL = from.fullPath;
                } else if (this.editsListComputed) {
                    this.viewEditDialog();
                } else if (!this.editModeComputed) {
                    this.previousTopicURL = Routes.INDEX;
                }
            }

        }

        @Watch("showContent")
        private showContentChanged(to: boolean) {
            if (to) {
                this.highlightCode();
            }
        }

        /**
         * Lifecycle hooks
         */
        private mounted() {

            if (this.$vuetify.breakpoint.xsOnly) {
                this.showTopMenu = false;
            }

            window.addEventListener("resize", this.windowHeightChanged);
            this.getPostRequest();

            if (uiState.previousRoute.fullPath === Routes.USERDASHBOARD) {
                this.previousTopicURL = Routes.USERDASHBOARD;
            } else if (uiState.previousRoute.fullPath === Routes.ADMINDASHBOARD) {
                this.previousTopicURL = Routes.ADMINDASHBOARD;
            }

            if (this.previousTopicURL === "") {
                this.previousTopicURL = Routes.INDEX;
            }

            if (this.editModeComputed) {
                this.enableEdit();
            } else if (this.editsListComputed) {
                uiState.setEditDialogState({
                    on: true,
                    hash: this.postHash
                });
            }

            this.resizeInterval = setInterval(() => {
                const postCard = document.getElementById(`post_${this.domId}`);
                const postCardTitle = document.getElementById(`postTitle_${this.domId}`);
                if (postCard !== null) {

                    let postCardTitleHeight = 0;
                    if (postCardTitle !== null) {
                        postCardTitleHeight = postCardTitle.clientHeight;
                    }

                    const newHeight = postCard.clientHeight - postCardTitleHeight - 50;

                    if (newHeight > 0) {
                        this.windowHeightChanged();
                        clearInterval(this.resizeInterval);
                    } else {
                        this.windowHeightChanged();
                    }
                }
            }, 100);

        }

        private updated() {
            if (this.fullPostComputed && this.post !== null && !this.loadingIcon) {
                this.windowHeightChanged();
                this.highlightCode();
            }
        }

        /**
         * Methods
         */
        private highlightCode() {
            const domElements = document.getElementsByClassName("hljsBlock");
            if (domElements.length > 0) {
                for (const domElement of domElements) {
                    (window as any).hljs.highlightBlock(domElement);
                }
            }

        }

        private getAvatarURL(dbImage: string) {
            if (dbImage !== null) {
                return `data:image/jpg;base64,${dbImage}`;
            } else {
                return "/assets/defaultAvatar.png";
            }
        }

        private windowHeightChanged() {
            if (this.canResize && this.fullPostComputed) {
                // Calculate the right height for the postcardtext, 100px padding
                this.canResize = false;

                const postCard = document.getElementById(`post_${this.domId}`);
                const postCardTitle = document.getElementById(`postTitle_${this.domId}`);
                if (postCard !== null) {

                    let postCardTitleHeight = 0;
                    if (postCardTitle !== null) {
                        postCardTitleHeight = postCardTitle.clientHeight;
                    }

                    const newHeight = postCard.clientHeight - postCardTitleHeight - 50;

                    const element = (document.getElementsByClassName(`postScrollWindow_${this.domId}`).item(0) as HTMLElement);

                    if (element !== null && newHeight > 0) {
                        element.style.maxHeight = `${newHeight}px`;
                        setTimeout(() => {
                            this.canResize = true;
                        }, 250);
                    } else {
                        this.canResize = true;
                    }
                } else {
                    this.canResize = true;
                }
            }
        }

        private hidePost() {
            ApiWrapper.sendPostRequest(new HidePost(this.postHash), (callback: HidePostCallBack) => {
                logStringConsole("Verified post");
                this.$router.push(Routes.INDEX);
            });
        }

        private returnToPostMenu() {
            this.$router.push(this.previousTopicURL);
        }

        private getParentTopic(child: ITopic, topics: ITopic[]): ITopic {
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
        }

        private enableEdit() {
            this.$router.push(`${this.currentPostURLComputed}/edit`);
        }

        private getTopicListWhereFinalChildIs(child: ITopic): IBreadCrumbType[] {
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
        }

        private getPostRequest() {
            localForage.getItem<IPost>(CacheTypes.POSTS + this.postHash)
                .then((cachedValue: IPost) => {
                    if (cachedValue === null || cachedValue.id === undefined) {
                        ApiWrapper.sendPostRequest(new GetPost(this.postHash), (callbackData: GetPostCallBack) => {
                            if (callbackData.post !== null) {
                                this.post = callbackData.post;
                                this.activeTopicHash = [callbackData.post.topicHash];

                                logObjectConsole(callbackData.post, "getPostRequest");

                                if (this.fullPostComputed) {
                                    this.getContentRequest(callbackData.post);
                                } else {
                                    localForage.setItem<IPost>(CacheTypes.POSTS + this.postHash, callbackData.post);
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
                            this.activeTopicHash = [cachedValue.topicHash];
                        }
                    }
                });
        }

        private getContentRequest(cachedValue: IPost) {
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
                    this.activeTopicHash = [callbackContent.postUpdated.topicHash];
                    this.post.htmlContent = callbackContent.content.html;
                    hasBeenUpdated = true;
                } else if (callbackContent.postVersionType === PostVersionTypes.RETRIEVEDCONTENT) {
                    this.post = cachedValue;
                    this.activeTopicHash = [cachedValue.topicHash];
                    this.post.htmlContent = callbackContent.content.html;
                    hasBeenUpdated = true;
                } else if (callbackContent.postVersionType === PostVersionTypes.NOCHANGE) {
                    this.post = cachedValue;
                    this.activeTopicHash = [cachedValue.topicHash];
                }

                this.topicNames = this.getTopicListWhereFinalChildIs(getTopicFromHash(this.post.topicHash, dataState.topics));

                if (hasBeenUpdated) {
                    this.$forceUpdate();
                    localForage.setItem<IPost>(CacheTypes.POSTS + this.postHash, this.post)
                        .then(() => {
                            logStringConsole("Changed post in cache", "getContentRequest");
                        });
                }
            }, (err: AxiosError) => {

                clearTimeout(timeOut);
                this.loadingIcon = false;

                if (cachedValue !== null && this.post !== null) {
                    this.post.htmlContent = cachedValue.htmlContent;
                }
                this.$forceUpdate();
            });
        }

        private afterAnimation() {
            this.showContent = true;
        }

        private viewEditDialog() {
            if (this.$route.fullPath !== `${this.currentPostURLComputed}/edits`) {
                this.$router.push(`${this.currentPostURLComputed}/edits`);
            }
            uiState.setEditDialogState({
                on: true,
                hash: this.postHash
            });
        }

        private navigateToPost(): void {
            if (!this.editModeComputed && !this.fullPostComputed) {
                logStringConsole(`Going to post ${this.post.title}`, "PostPreview navigateToPost");

                this.$router.push(this.currentPostURLComputed);
            }
        }

        private editPost() {
            logStringConsole("Editing post");
            ApiWrapper.sendPostRequest(new EditPost(
                this.postHash,
                this.post.title,
                this.activeTopicHash[0]
            ), (callbackData: EditPostCallback) => {
                if (callbackData.result === EditPostReturnTypes.SUCCESS) {
                    uiState.setNotificationDialogState({
                        on: true,
                        header: "Edited post",
                        text: "Post was edited successfully"
                    });
                } else {
                    uiState.setNotificationDialogState({
                        on: true,
                        header: "Didn't edit post",
                        text: "There was nothing to update!"
                    });
                }

                this.$router.push(this.currentPostURLComputed);
                this.getPostRequest();
            });
        }
    }
</script>

<style scoped>

    .adminBorder {
        box-shadow: 0 0 2pt 3pt #ad073b;
    }

    .leekBorder {
        box-shadow: 0 0 2pt 3pt #727272;
    }

    .previewCard {
        position: relative;
        width: 90%;
        overflow: hidden;
        margin: 20px 5% 20px 5%;
        padding: 0;
        transition: 0.3s;
        cursor: pointer;
    }

    .previewCard:hover {
        transform: scale(1.05);
        border: HSL(194, 100%, 42%) 1px solid;
    }

    .whitespaceInit {
        white-space: initial;
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

    .post-title {
        font-weight: 400;
        font-size: 1.5rem;
        line-height: 24px;
        font-family: Roboto, sans-serif;
        word-break: break-word;
    }

    .viewButton {
        position: relative;
        bottom: 0;
        left: 0;
        width: 100%;
        text-align: right;
        margin: 0;
        padding: 0;
        height: 2em;
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

    .topMenuShow-enter-active, .topMenuShow-leave-active {
        transition: opacity .2s;
    }

    .topMenuShow-enter, .topMenuShow-leave-to {
        opacity: 0;
    }

    @font-face {
        font-family: 'SailecLight';
        src: url("../../../public/assets/Sailec-Light.otf");
    }

    .ql-editor {
        border: none;
        font-family: 'SailecLight', sans-serif;
    }
</style>