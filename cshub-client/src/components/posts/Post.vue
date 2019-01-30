<template>
    <div>
        <div v-if="post !== null">
            <!-- The following transition is just a trick so I get an event on the change from preview to full post (performance of the animation when the viewer is on is terrible) -->
            <transition :duration="300" @before-leave="showContent = false" @before-enter="showContent = false"
                        @after-enter="afterAnimation">
                <div v-if="fullPostComputed"></div>
            </transition>
            <v-progress-circular
                    v-if="showLoadingIcon"
                    :size="100"
                    color="primary"
                    indeterminate
                    class="loadingIcon"
            ></v-progress-circular>
            <v-card :class="{previewCard: !fullPostComputed, fullCard: fullPostComputed}" :id="'post_' + domId" style="box-shadow: none">
                <v-card-title primary-title :id="'postTitle_' + domId" class="pb-0 xl-0 pt-1 titleCard"
                              @click.capture="navigateToPost">
                    <transition name="topMenuShow">
                        <div v-if="!showTopMenu && fullPostComputed">
                            <v-btn color="primary" depressed small dark @click="returnToPostMenu">
                                <v-icon>fas fa-chevron-left</v-icon>
                            </v-btn>
                            <v-btn color="secondary" depressed small @click="showTopMenu = true" class="angleLighten3Dark">
                                <v-icon>fas fa-angle-down</v-icon>
                            </v-btn>
                        </div>
                    </transition>
                    <span v-if="(showTopMenu || !fullPostComputed)" style="display: contents">
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
                                <v-breadcrumbs-item :disabled="!editModeComputed" @click="disableEdit">
                                    {{post.title}}
                                </v-breadcrumbs-item>
                                <v-btn color="red" depressed small @click="hidePost()" v-if="!editModeComputed && userAdminComputed">
                                    <v-icon>fas fa-trash</v-icon>
                                </v-btn>
                                <v-btn color="lime" depressed small @click="toggleFavorite()" v-if="!editModeComputed">
                                    <v-icon v-if="post.isMyFavorite">fas fa-star</v-icon>
                                    <v-icon v-else>far fa-star</v-icon>
                                </v-btn>
                                <v-btn color="orange" depressed small @click="enableEdit"
                                       v-if="!editModeComputed && userIsLoggedIn">
                                    <v-icon>fas fa-edit</v-icon>
                                </v-btn>
                                <v-btn v-if="!editModeComputed && userAdminComputed" depressed small color="green" @click="savePostDialog">
                                    <v-icon>fas fa-save</v-icon>
                                </v-btn>
                                <v-btn v-if="!editModeComputed && userAdminComputed" depressed small color="blue" @click="forceEditPost">
                                    <v-icon>fas fa-gavel</v-icon>
                                </v-btn>
                                <v-btn depressed small color="primary" @click="viewEditDialog" v-if="!editModeComputed">
                                    <v-icon>fas fa-history</v-icon>
                                </v-btn>
                                <v-btn depressed small color="secondary" @click="showTopMenu = false" class="angleLighten3Dark">
                                    <v-icon>fas fa-angle-up</v-icon>
                                </v-btn>
                            </v-breadcrumbs>
                        </transition>
                        <v-list two-line style="width: 100%">
                            <v-list-tile avatar class="mb-1 postTile">
                                <v-list-tile-avatar>
                                    <img :src="getAvatarURL(post.author.avatar)" class="profileBorder"/>
                                </v-list-tile-avatar>
                                <v-list-tile-content class="pt-2 d-inline">
                                    <v-list-tile-sub-title class="whitespaceInit post-title">
                                        <span>{{post.title}}{{isNewPost !== null ? (isNewPost ? " - new post" : " - new edits") : ""}}</span>
                                    </v-list-tile-sub-title>
                                    <v-list-tile-sub-title class="whitespaceInit">{{post.author.firstname}} {{post.author.lastname}} - {{post.datetime | formatDate}}</v-list-tile-sub-title>
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
                            id="htmlContentContainer"
                            column
                            align-center
                            justify-center
                            v-scroll:#post-scroll-target>
                        <v-card-text v-if="!loadingIcon" id="postCardText">
                            <v-list-tile-sub-title class="whitespaceInit post-title secondaryTitle">
                                <span>{{post.title}}</span>
                            </v-list-tile-sub-title>
                            <div class="ql-editor">
                                <div v-show="showContent" v-html="post.htmlContent" id="htmlOutput"></div>
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
        <PostEditsDialog v-if="fullPostComputed" :key="postHash" :postHash="postHash"></PostEditsDialog>
        <PostSaveEditDialog v-if="post !== null && fullPostComputed" :key="postHash - 1" :post="post"></PostSaveEditDialog>

        <v-dialog
            v-if="fullPostComputed"
            v-model="dialogOpen"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">Editing</v-card-title>

                <v-card-text>
                    We've recently added realtime editing, though operational transform doesn't completely work yet, meaning that if 2 people type decently fast on the same post, some letters might be shifted.
                    <br><br>
                    So if you see a person editing, don't do anything...
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                            color="green darken-1"
                            flat="flat"
                            @click="dialogOpen = false"
                    >
                        Close
                    </v-btn>
                    <v-btn
                            color="primary darken-1"
                            flat="flat"
                            @click="closeDialog"
                    >
                        Close and hide from now on
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script lang="ts">
    import Vue from "vue";
    import localForage from "localforage";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import {Route} from "vue-router";
    import {AxiosError} from "axios";
    import CodeMirror from "codemirror";

    import Quill from "../quill/Quill.vue";
    import PostEditsDialog from "./PostEditsDialog.vue";

    import {
        GetPost,
        GetPostCallBack,
        GetPostContent,
        GetPostContentCallBack,
        HidePostCallBack,
        PostSettings, PostSettingsEditType,
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
    import {ForceEditPost} from "../../../../cshub-shared/src/api-calls/pages/ForceEditPost";
    import {colorize} from "../../utilities/codemirror-colorize";
    import {LocalStorageData} from "../../store/localStorageData";
    import PostSaveEditDialog from "./PostSaveEditDialog.vue";

    interface IBreadCrumbType {
        name: string;
        url: string;
    }

    @Component({
        name: "Post",
        components: {Quill, PostEditsDialog, PostSaveEditDialog}
    })
    export default class Post extends Vue {

        /**
         * Data
         */
        @Prop(Number) private postHash: number;
        @Prop(Boolean) private isNewPost: boolean;

        private dialogOpen = false;

        private domId: string = idGenerator();
        private post: IPost = null;
        private topicNames: IBreadCrumbType[] = [];
        private canResize = true;
        private showContent = true;
        private loadingIcon = false;
        private previousTopicURL = "";
        private showTopMenu = true;
        private resizeInterval: number;
        private showLoadingIcon = false;

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

        get saveDialogComputed(): boolean {
            return this.$route.fullPath === `${this.currentPostURLComputed}/save`;
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
                } else if (this.saveDialogComputed) {
                    this.savePostDialog();
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

        @Watch("editModeComputed")
        private editModeComputedChanged(to: boolean) {
            if (to) {
                if (localStorage.getItem(LocalStorageData.DIALOGOPENED) !== "true") {
                    this.dialogOpen = true;
                }
            }
        }

        @Watch("saveDialogComputed")
        private saveDialogComputedChanged(to: boolean) {
            const notificationDialogState = uiState.currentEditDialogState;
            if (!to && !notificationDialogState.on && notificationDialogState.hasJustSaved) {
                this.getPostRequest();
                uiState.setCurrentEditDialogState({
                    ...notificationDialogState,
                    hasJustSaved: false
                });
            }
        }

        /**
         * Lifecycle hooks
         */
        public metaInfo(): any {
            if (this.fullPostComputed && this.post !== null) {
                return {
                    title: `${this.post.title} - CSHub`,
                    meta: [
                        {name: "description", content: `A post by ${this.post.author.firstname} ${this.post.author.lastname}. Join now and start writing!`}
                    ]
                };
            } else {
                return {};
            }
        }

        private mounted() {

            this.$socket.on("connect_error", () => {
                this.socketError();
            });

            this.$socket.on("connect_failed", () => {
                this.socketError();
            });

            if (this.$vuetify.breakpoint.xsOnly) {
                this.showTopMenu = false;
            }

            window.addEventListener("resize", this.windowHeightChanged);
            this.getPostRequest();

            if (uiState.previousRoute.fullPath === Routes.USERDASHBOARD) {
                this.previousTopicURL = Routes.USERDASHBOARD;
            } else if (uiState.previousRoute.fullPath === Routes.ADMINDASHBOARD) {
                this.previousTopicURL = Routes.ADMINDASHBOARD;
            } else if (uiState.previousRoute.fullPath === Routes.FAVORITES) {
                this.previousTopicURL = Routes.FAVORITES;
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
            } else if (this.saveDialogComputed) {
                uiState.setCurrentEditDialogState({
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
        private socketError() {
            if (this.editModeComputed) {
                uiState.setNotificationDialogState({
                    header: "Connection failed",
                    text: "The connection with the server failed :( perhaps try refreshing or hope that it's been fixed in a few minutes (your edits won't be saved!)",
                    on: true
                });
            }
        }

        private closeDialog() {
            this.dialogOpen = false;
            localStorage.setItem(LocalStorageData.DIALOGOPENED, "true");
        }

        private forceEditPost() {
            this.showLoadingIcon = true;

            ApiWrapper.sendPostRequest(new ForceEditPost(this.postHash), () => {
                this.showLoadingIcon = false;
                uiState.setNotificationDialogState({
                    on: true,
                    header: "Edited post",
                    text: "Post was edited successfully"
                });

                this.$router.push(this.currentPostURLComputed);
                this.getPostRequest();
            });
        }

        private highlightCode() {
            colorize(null, CodeMirror);
        }

        private getAvatarURL(dbImage: string) {
            if (dbImage !== null) {
                return `data:image/jpg;base64,${dbImage}`;
            } else {
                return "/img/defaultAvatar.png";
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

        private toggleFavorite() {
            ApiWrapper.sendPostRequest(new PostSettings(this.postHash, PostSettingsEditType.FAVORITE, !this.post.isMyFavorite), (callback: HidePostCallBack) => {
                logStringConsole("Toggled favorite");
                this.post.isMyFavorite = !this.post.isMyFavorite;
            });
        }

        private hidePost() {
            ApiWrapper.sendPostRequest(new PostSettings(this.postHash, PostSettingsEditType.HIDE), (callback: HidePostCallBack) => {
                logStringConsole("Removed post");
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
            if (localStorage.getItem(LocalStorageData.DIALOGOPENED) !== "true") {
                this.dialogOpen = true;
            }
        }

        private disableEdit() {
            this.$router.push(`${this.currentPostURLComputed}`);
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
                    this.post = {
                        ...callbackContent.postUpdated,
                        isMyFavorite: callbackContent.isMyFavorite
                    };
                    this.post.htmlContent = callbackContent.content.html;
                    hasBeenUpdated = true;
                } else if (callbackContent.postVersionType === PostVersionTypes.RETRIEVEDCONTENT) {
                    this.post = {
                        ...cachedValue,
                        isMyFavorite: callbackContent.isMyFavorite
                    };
                    this.post.htmlContent = callbackContent.content.html;
                    hasBeenUpdated = true;
                } else if (callbackContent.postVersionType === PostVersionTypes.NOCHANGE) {
                    this.post = {
                        ...cachedValue,
                        isMyFavorite: callbackContent.isMyFavorite
                    };
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

        private savePostDialog() {

            if (this.$route.fullPath !== `${this.currentPostURLComputed}/save`) {
                this.$router.push(`${this.currentPostURLComputed}/save`);
            }

            uiState.setCurrentEditDialogState({
                on: true,
                hash: this.postHash
            });
        }
    }
</script>

<style scoped>

    .profileBorder {
        border-radius: 0;
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

    .loadingIcon {
        position: fixed;
        top: 50%;
        left: 50%;
        width: auto;
        height: auto;
        transform: translate(-50%,-50%);
        z-index: 9999;
    }

    .secondaryTitle {
        display: none;
    }

    @media print {
        #postCardText {
            padding: 0 !important;
        }

        .container {
            padding: 0 !important;
            max-height: none !important;
        }
        
        .titleCard {
            display: none;
        }

        .secondaryTitle {
            display: inline;
        }

        .fullCard {
            position: relative !important;
        }
    }

    .theme--light.v-list .v-list__tile__sub-title {
        color: black;
    }

    .theme--dark .angleLighten3Dark {
        background-color: #8b8b8b !important;
    }
</style>
