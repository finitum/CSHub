<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div class="fullHeight">
        <div v-if="post !== null" class="fullHeight" @click.capture="handleClick" @dblclick.capture="handleDoubleClick">
            <!-- The following transition is just a trick so I get an event on the change from preview to full post (performance of the animation when the viewer is on is terrible) -->
            <transition
                :duration="300"
                @before-leave="showContent = alwaysShowContent"
                @before-enter="showContent = false"
                @after-enter="afterAnimation"
            >
                <div v-if="fullPostComputed"></div>
            </transition>
            <v-progress-circular
                v-if="showLoadingIcon"
                :size="100"
                color="primary"
                indeterminate
                class="loadingIcon"
            ></v-progress-circular>
            <v-card
                :class="{ previewCard: !fullPostComputed, fullCard: fullPostComputed, isIndex: alwaysShowContent }"
                class="fullHeight"
                style="box-shadow: none"
            >
                <v-layout align-start justify-start column fill-height>
                    <v-flex>
                        <v-card-title primary-title class="pb-0 xl-0 pt-1 titleCard">
                            <transition name="topMenuShow">
                                <div v-if="!showTopMenu && fullPostComputed">
                                    <v-btn
                                        color="primary"
                                        min-width="88"
                                        class="mr-1 my-1"
                                        depressed
                                        small
                                        dark
                                        @click="returnToPostMenu"
                                    >
                                        <v-icon>fas fa-chevron-left</v-icon>
                                    </v-btn>
                                    <v-btn
                                        color="secondary"
                                        depressed
                                        min-width="88"
                                        small
                                        class="ma-1 angleLighten3Dark"
                                        @click="showTopMenu = true"
                                    >
                                        <v-icon>fas fa-angle-down</v-icon>
                                    </v-btn>
                                </div>
                            </transition>
                            <span v-if="showTopMenu || !fullPostComputed" style="display: contents">
                                <transition name="breadcrumb">
                                    <div v-if="fullPostComputed">
                                        <v-btn
                                            color="primary"
                                            min-width="88"
                                            depressed
                                            class="my-1 mr-4 d-inline-block"
                                            small
                                            dark
                                            @click="returnToPostMenu"
                                        >
                                            <v-icon>fas fa-chevron-left</v-icon>
                                        </v-btn>

                                        <v-breadcrumbs :items="topicNames" class="d-inline-block pa-0 mr-4 my-1">
                                            <template v-slot:item="props">
                                                <v-breadcrumbs-item
                                                    v-if="props.item.topic"
                                                    :to="props.item.to"
                                                    :exact="true"
                                                >
                                                    {{ props.item.text }}
                                                </v-breadcrumbs-item>
                                                <v-breadcrumbs-item
                                                    v-else
                                                    :disabled="!editModeComputed"
                                                    @click="disableEdit"
                                                >
                                                    {{ props.item.text }}
                                                </v-breadcrumbs-item>
                                            </template>
                                        </v-breadcrumbs>
                                        <v-tooltip v-if="!editModeComputed && userAdminComputed" bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn
                                                    min-width="88"
                                                    color="red"
                                                    depressed
                                                    class="my-1 mr-4 d-inline-block"
                                                    small
                                                    v-on="on"
                                                    @click="hidePost()"
                                                >
                                                    <v-icon>fas fa-trash</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Delete the post (sorta)</span>
                                        </v-tooltip>

                                        <v-tooltip
                                            v-if="!editModeComputed && userIsLoggedIn && userAdminComputed"
                                            bottom
                                        >
                                            <template v-slot:activator="{ on }">
                                                <v-btn
                                                    min-width="88"
                                                    color="purple"
                                                    depressed
                                                    class="my-1 mr-4 d-inline-block"
                                                    small
                                                    v-on="on"
                                                    @click="wipPost()"
                                                >
                                                    <v-icon v-if="post.isWIP">fas fa-comments</v-icon>
                                                    <v-icon v-else>far fa-comments</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Toggle WIP (dark = WIP)</span>
                                        </v-tooltip>

                                        <v-tooltip v-if="!editModeComputed && userIsLoggedIn" bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn
                                                    min-width="88"
                                                    color="orange"
                                                    depressed
                                                    class="my-1 mr-4 d-inline-block"
                                                    small
                                                    v-on="on"
                                                    @click="enableEdit"
                                                >
                                                    <v-icon>fas fa-edit</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Edit the post</span>
                                        </v-tooltip>

                                        <v-tooltip v-if="!editModeComputed && userAdminComputed" bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn
                                                    min-width="88"
                                                    depressed
                                                    class="my-1 mr-4 d-inline-block"
                                                    small
                                                    color="green"
                                                    v-on="on"
                                                    @click="savePostDialog"
                                                >
                                                    <v-icon>fas fa-save</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Save the post</span>
                                        </v-tooltip>

                                        <v-tooltip v-if="!editModeComputed && userAdminComputed" bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn
                                                    min-width="88"
                                                    depressed
                                                    class="my-1 mr-4 d-inline-block"
                                                    small
                                                    color="blue"
                                                    v-on="on"
                                                    @click="forceEditPost"
                                                >
                                                    <v-icon>fas fa-gavel</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Force edit the post</span>
                                        </v-tooltip>

                                        <v-tooltip v-if="!editModeComputed" bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn
                                                    min-width="88"
                                                    depressed
                                                    small
                                                    class="my-1 mr-4 d-inline-block"
                                                    color="primary"
                                                    v-on="on"
                                                    @click="viewEditDialog"
                                                >
                                                    <v-icon>fas fa-history</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>View post history</span>
                                        </v-tooltip>

                                        <v-btn
                                            depressed
                                            small
                                            min-width="88"
                                            color="secondary"
                                            class="my-1 mr-4 d-inline-block angleLighten3Dark"
                                            @click="showTopMenu = false"
                                        >
                                            <v-icon>fas fa-angle-up</v-icon>
                                        </v-btn>
                                    </div>
                                </transition>
                                <v-list
                                    v-if="!alwaysShowContent || fullPostComputed"
                                    two-line
                                    style="width: 100%"
                                    class="pt-0"
                                >
                                    <v-list-item class="pa-0 postTile">
                                        <v-list-item-avatar>
                                            <img src="https://picsum.photos/40" class="profileBorder" />
                                        </v-list-item-avatar>
                                        <v-list-item-content class="pt-2 d-inline">
                                            <v-list-item-subtitle class="whitespaceInit post-title">
                                                <span>
                                                    {{ post.title }}
                                                    {{ post.isIndex ? "(index page)" : "" }}
                                                    {{ post.isExample ? "(example)" : "" }}
                                                </span>
                                            </v-list-item-subtitle>
                                            <v-list-item-subtitle class="whitespaceInit">
                                                {{ post.datetime | formatDate }}
                                            </v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </span>
                        </v-card-title>
                    </v-flex>
                    <v-flex class="fullHeight" style="width: 100%">
                        <v-card-text
                            v-if="
                                ((fullPostComputed && !editModeComputed) || (!fullPostComputed && alwaysShowContent)) &&
                                    !loadingIcon
                            "
                            class="pt-0 fullHeight"
                        >
                            <v-list-item-subtitle class="whitespaceInit post-title secondaryTitle">
                                <span>{{ post.title }}</span>
                            </v-list-item-subtitle>
                            <div class="ql-editor fullHeight pa-0">
                                <div
                                    v-show="showContent"
                                    id="htmlOutput"
                                    class="fullHeight"
                                    v-html="post.htmlContent"
                                ></div>
                            </div>
                        </v-card-text>
                        <v-card-text
                            v-else-if="fullPostComputed && !loadingIcon && editModeComputed"
                            class="fullHeight"
                        >
                            <Quill
                                key="editQuill"
                                ref="editQuill"
                                style="margin-bottom: 20px"
                                :editor-setup="{ allowEdit: true, showToolbar: true, postHash }"
                            ></Quill>
                        </v-card-text>
                    </v-flex>
                </v-layout>
                <div v-if="loadingIcon">
                    <v-progress-circular
                        :size="150"
                        :width="5"
                        color="primary"
                        indeterminate
                        style="width: 100%; margin: 10% auto;"
                    />
                </div>
            </v-card>
        </div>
        <div v-else-if="loadingIcon">
            <v-progress-circular
                :size="150"
                :width="5"
                color="primary"
                indeterminate
                style="width: 100%; margin: 10% auto;"
            />
        </div>
        <PostEditsDialog v-if="fullPostComputed" :key="postHash" :post-hash="postHash"></PostEditsDialog>
        <PostSaveEditDialog
            v-if="post !== null && fullPostComputed"
            :key="postHash - 1"
            :post="post"
        ></PostSaveEditDialog>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import localForage from "localforage";
import { Component, Prop, Watch } from "vue-property-decorator";
import { Route } from "vue-router";
import { AxiosError } from "axios";
import CodeMirror from "codemirror";

import Quill from "../quill/Quill.vue";
import PostEditsDialog from "./PostEditsDialog.vue";

import {
    ForceEditPost,
    GetPostCallBack,
    GetPostContentCallBack,
    PostContent,
    PostData,
    PostSettings,
    PostSettingsEditType,
    PostVersionTypes,
    Requests
} from "../../../../cshub-shared/src/api-calls";
import { Routes } from "../../../../cshub-shared/src/Routes";

import { ApiWrapper, logObjectConsole, logStringConsole } from "../../utilities";
import { CacheTypes } from "../../utilities/cache-types";

import { dataState, uiState, userState } from "../../store";
import { colorize } from "../../utilities/codemirror-colorize";
import PostSaveEditDialog from "./PostSaveEditDialog.vue";
import { IPost } from "../../../../cshub-shared/src/entities/post";
import { ITopic } from "../../../../cshub-shared/src/entities/topic";
import { getTopicFromHash } from "../../utilities/Topics";

interface IBreadCrumbType {
    topic: boolean;
    text: string;
    to: string;
}

@Component({
    name: "Post",
    components: { Quill, PostEditsDialog, PostSaveEditDialog }
})
export default class Post extends Vue {
    /**
     * Data
     */
    @Prop({ required: true }) private postHash!: number;

    private dialogOpen = false;

    private post: IPost | null = null;
    private topicNames: IBreadCrumbType[] = [];
    private canResize = true;
    private showContent = true;
    private loadingIcon = false;
    private showTopMenu = true;
    private resizeInterval: number | null = null;
    private showLoadingIcon = false;

    /**
     * Computed properties
     */
    get userAdminComputed(): boolean {
        return this.userIsLoggedIn && userState.isAdmin;
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
        return dataState.topTopic ? dataState.topTopic.children : [];
    }

    get isOnAdminDashboard(): boolean {
        return this.$route.fullPath === Routes.ADMINDASHBOARD;
    }

    get isOnUnsavedPosts(): boolean {
        return this.$route.fullPath === Routes.UNSAVEDPOSTS;
    }

    get isOnUserDashboard(): boolean {
        return this.$route.fullPath === Routes.USERDASHBOARD;
    }

    get alwaysShowContent(): boolean {
        if (this.post) {
            return (
                (this.post.isIndex || this.post.isExample) &&
                !this.isOnAdminDashboard &&
                !this.isOnUserDashboard &&
                !this.isOnUnsavedPosts
            );
        }
        return false;
    }

    /**
     * Watchers
     */
    @Watch("$route")
    private routeChanged(to: Route, from: Route) {
        if (this.fullPostComputed || to.fullPath.includes(this.postHash.toString())) {
            if (from.name === "topic" || from.name === "topicexamples" || from.fullPath === Routes.INDEX) {
                if (this.post) {
                    this.getContentRequest(this.post);
                }
            } else if (this.editsListComputed) {
                this.viewEditDialog();
            } else if (this.saveDialogComputed) {
                this.savePostDialog();
            }
        }
    }

    @Watch("showContent")
    private showContentChanged(to: boolean) {
        if (to) {
            this.highlightCode();
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
        if (this.fullPostComputed && this.post) {
            return {
                title: `${this.post.title} - CSHub`
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

        this.getPostRequest();

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
    }

    private updated() {
        if (this.fullPostComputed && this.post !== null && !this.loadingIcon) {
            this.highlightCode();
        }
    }

    /**
     * Methods
     */
    private socketError() {
        if (this.editModeComputed) {
            uiState.setNotificationDialog({
                header: "Connection failed",
                text:
                    "The connection with the server failed :( perhaps try refreshing or hope that it's been fixed in a few minutes (your edits won't be saved!)",
                on: true
            });
        }
    }

    private forceEditPost() {
        this.showLoadingIcon = true;

        ApiWrapper.sendPutRequest(new ForceEditPost(this.postHash), () => {
            this.showLoadingIcon = false;
            uiState.setNotificationDialog({
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

    private getAvatarURLApi(id: number) {
        const profileurl = Requests.PROFILE.replace(/:userId/, id.toString());
        return `${process.env.VUE_APP_API_URL || (window as any).appConfig.VUE_APP_API_URL}${profileurl}`;
    }

    private getAvatarURL(dbImage: string) {
        if (dbImage !== null) {
            return `data:image/jpg;base64,${dbImage}`;
        } else {
            return "/img/defaultAvatar.png";
        }
    }

    private hidePost() {
        ApiWrapper.sendPutRequest(new PostSettings(this.postHash, PostSettingsEditType.HIDE), () => {
            logStringConsole("Removed post");
            this.$router.push(Routes.INDEX);
        });
    }

    private wipPost() {
        ApiWrapper.sendPutRequest(new PostSettings(this.postHash, PostSettingsEditType.WIP), () => {
            logStringConsole("WIPPED post");
            if (this.post) {
                this.post.wip = !this.post.wip;
            }
        });
    }

    private returnToPostMenu() {
        this.$router.go(-1);
    }

    private enableEdit() {
        this.$router.push(`${this.currentPostURLComputed}/edit`);
    }

    private disableEdit() {
        this.$router.push(`${this.currentPostURLComputed}`);
    }

    private getTopicListWhereFinalChildIs(child: ITopic): IBreadCrumbType[] {
        const parentTopic = child.parent;

        const currTopic: IBreadCrumbType = {
            text: child.name,
            to: `${Routes.TOPIC}/${child.hash}`,
            topic: true
        };

        if (parentTopic) {
            const parentArray: IBreadCrumbType[] = this.getTopicListWhereFinalChildIs(parentTopic);
            return [...parentArray, currTopic];
        } else {
            return [currTopic];
        }
    }

    private getPostRequest() {
        localForage.getItem<IPost>(CacheTypes.POSTS + this.postHash).then((cachedValue: IPost) => {
            if (cachedValue === null || cachedValue.id === undefined) {
                ApiWrapper.sendGetRequest(new PostData(this.postHash), (callbackData: GetPostCallBack) => {
                    if (callbackData.post !== null) {
                        this.post = callbackData.post;

                        logObjectConsole(callbackData.post, "getPostRequest");

                        if (this.fullPostComputed || this.post.isIndex || this.post.isExample) {
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

                this.post = cachedValue;

                if (this.fullPostComputed) {
                    this.getContentRequest(cachedValue);
                } else if (cachedValue.isIndex || cachedValue.isExample) {
                    this.getContentRequest(cachedValue);
                }
            }
        });
    }

    private async getContentRequest(knownPost: IPost) {
        const timeOut = setTimeout(() => {
            this.loadingIcon = true;
        }, 250);

        const postVersion: number = typeof knownPost.htmlContent !== "string" ? -1 : knownPost.postVersion;

        try {
            const content = await ApiWrapper.get(new PostContent(this.postHash, postVersion));

            clearTimeout(timeOut);
            this.loadingIcon = false;

            let hasBeenUpdated = false;

            let currentPost: IPost = {
                ...knownPost
            };

            if (content !== null) {
                switch (content.data.type) {
                    case PostVersionTypes.UPDATEDPOST:
                        currentPost = {
                            ...content.data.postUpdated
                        };
                        currentPost.htmlContent = content.data.content.html;
                        hasBeenUpdated = true;
                        break;
                    case PostVersionTypes.POSTDELETED:
                        this.$router.push(Routes.INDEX);
                        currentPost = {
                            ...knownPost
                        };
                        break;
                }
            }

            const children = dataState.topTopic ? dataState.topTopic.children : [];
            const topicFromHash = getTopicFromHash(currentPost.topic.hash, children);

            if (topicFromHash) {
                this.topicNames = this.getTopicListWhereFinalChildIs(topicFromHash);
                this.topicNames.push({
                    text: currentPost.title,
                    to: this.$route.fullPath,
                    topic: true
                });
            }

            if (hasBeenUpdated) {
                this.$forceUpdate();
                localForage.setItem<IPost>(CacheTypes.POSTS + this.postHash, currentPost).then(() => {
                    logStringConsole("Changed post in cache", "getContentRequest");
                });
            }

            this.post = currentPost;

            this.scrollToHash();
        } catch (err) {
            clearTimeout(timeOut);
            this.loadingIcon = false;
            this.post = knownPost;

            this.$forceUpdate();

            this.scrollToHash();
        }
    }

    private scrollToHash() {
        this.$nextTick().then(() => {
            if (this.$route.hash) {
                const hashElement = document.getElementById(this.$route.hash.substr(1));
                if (hashElement !== null) {
                    hashElement.scrollIntoView();
                }
            }
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

    private handleClick(): void {
        if (!this.alwaysShowContent) {
            this.handleDoubleClick();
        }
    }

    private handleDoubleClick(): void {
        if (!this.editModeComputed && !this.fullPostComputed) {
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

<style scoped lang="scss">
@import "../../styling/vars";

.profileBorder {
    border-radius: 0;
}

.previewCard {
    position: relative;
    /*width: 90%;*/
    overflow: hidden;
    margin: 10px 10px 10px 10px;
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
    transition: opacity 0.2s;
}

.breadcrumb-leave-active {
    transition: opacity 0.1s;
}

.breadcrumb-enter,
.breadcrumb-leave-to {
    opacity: 0;
}

.topMenuShow-enter-active,
.topMenuShow-leave-active {
    transition: opacity 0.2s;
}

.topMenuShow-enter,
.topMenuShow-leave-to {
    opacity: 0;
}

@font-face {
    font-family: "SailecLight";
    src: url("../../../public/assets/Sailec-Light.otf");
}

.ql-editor {
    border: none;
    font-family: "SailecLight", sans-serif;
}

.loadingIcon {
    position: fixed;
    top: 50%;
    left: 50%;
    width: auto;
    height: auto;
    transform: translate(-50%, -50%);
    z-index: 9999;
}

.secondaryTitle {
    display: none;
}

#postCardText {
    padding: 0 !important;
}

@media print {
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

.theme--light.v-list .v-list-item__subtitle {
    color: black;
}

.theme--light.v-card .v-card__text {
    color: rgba(0, 0, 0, 0.87);
}

.theme--dark.v-card .v-card__text {
    color: rgba(255, 255, 255, 0.87);
}

.theme--dark .angleLighten3Dark {
    background-color: #8b8b8b !important;
}

.indexPostCardText .ql-editor {
    padding: 0;
}

.indexPostCardText {
    padding: 0;
}

.indexPostCardText #htmlOutput {
    cursor: pointer;
}

.noPaddingTop {
    padding-top: 0;
}

.fixedPadding {
    padding: 10px 10px 10px 30px;
}
</style>
