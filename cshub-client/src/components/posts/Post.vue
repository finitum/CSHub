<template>
    <div>
        <div v-if="post !== null" @click.capture="navigateToPost">
            <!-- The following transition is just a trick so I get an event on the change from preview to full post (performance of the animation when the viewer is on is terrible) -->
            <transition
                :duration="300"
                @before-leave="showContent = isIndexComputed"
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
                :id="'post_' + domId"
                :class="{ previewCard: !fullPostComputed, fullCard: fullPostComputed, isIndex: isIndexComputed }"
                style="box-shadow: none"
            >
                <v-card-title :id="'postTitle_' + domId" primary-title class="pb-0 xl-0 pt-1 titleCard">
                    <transition name="topMenuShow">
                        <div v-if="!showTopMenu && fullPostComputed">
                            <v-btn color="primary" depressed small dark @click="returnToPostMenu">
                                <v-icon>fas fa-chevron-left</v-icon>
                            </v-btn>
                            <v-btn
                                color="secondary"
                                depressed
                                small
                                class="angleLighten3Dark"
                                @click="showTopMenu = true"
                            >
                                <v-icon>fas fa-angle-down</v-icon>
                            </v-btn>
                        </div>
                    </transition>
                    <span v-if="showTopMenu || !fullPostComputed" style="display: contents">
                        <transition name="breadcrumb">
                            <v-breadcrumbs v-if="fullPostComputed" divider="/" style="width: 100%">
                                <v-btn color="primary" depressed small dark @click="returnToPostMenu">
                                    <v-icon>fas fa-chevron-left</v-icon>
                                </v-btn>
                                <v-breadcrumbs-item v-for="item in topicNames" :key="item.index" :disabled="false">
                                    <router-link :to="item.url">{{ item.name }}</router-link>
                                </v-breadcrumbs-item>
                                <v-breadcrumbs-item :disabled="!editModeComputed" @click="disableEdit">
                                    {{ post.title }}
                                </v-breadcrumbs-item>

                                <v-tooltip v-if="!editModeComputed && userAdminComputed" bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn color="red" depressed small v-on="on" @click="hidePost()">
                                            <v-icon>fas fa-trash</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Delete the post (sorta)</span>
                                </v-tooltip>

                                <v-tooltip v-if="!editModeComputed && userIsLoggedIn && userAdminComputed" bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn color="purple" depressed small v-on="on" @click="wipPost()">
                                            <v-icon v-if="post.isWIP">fas fa-comments</v-icon>
                                            <v-icon v-else>far fa-comments</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Toggle WIP (dark = WIP)</span>
                                </v-tooltip>

                                <v-tooltip v-if="!editModeComputed && userIsLoggedIn" bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn color="orange" depressed small v-on="on" @click="enableEdit">
                                            <v-icon>fas fa-edit</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Edit the post</span>
                                </v-tooltip>

                                <v-tooltip v-if="!editModeComputed && userAdminComputed" bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn depressed small color="green" v-on="on" @click="savePostDialog">
                                            <v-icon>fas fa-save</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Save the post</span>
                                </v-tooltip>

                                <v-tooltip v-if="!editModeComputed && userAdminComputed" bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn depressed small color="blue" v-on="on" @click="forceEditPost">
                                            <v-icon>fas fa-gavel</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Force edit the post</span>
                                </v-tooltip>

                                <v-tooltip v-if="!editModeComputed" bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn depressed small color="primary" v-on="on" @click="viewEditDialog">
                                            <v-icon>fas fa-history</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>View post history</span>
                                </v-tooltip>

                                <v-btn
                                    depressed
                                    small
                                    color="secondary"
                                    class="angleLighten3Dark"
                                    @click="showTopMenu = false"
                                >
                                    <v-icon>fas fa-angle-up</v-icon>
                                </v-btn>
                            </v-breadcrumbs>
                        </transition>
                        <v-list v-if="!isIndexComputed || fullPostComputed" two-line style="width: 100%">
                            <v-list-item class="mb-1 postTile">
                                <v-list-item-avatar>
                                    <img :src="getAvatarURL(post.author.avatar)" class="profileBorder" />
                                </v-list-item-avatar>
                                <v-list-item-content class="pt-2 d-inline">
                                    <v-list-item-subtitle class="whitespaceInit post-title">
                                        <span>{{ post.title }} {{ post.isIndex ? "(index page)" : "" }}</span>
                                    </v-list-item-subtitle>
                                    <v-list-item-subtitle class="whitespaceInit"
                                        >{{ post.author.firstname }} {{ post.author.lastname }} -
                                        {{ post.datetime | formatDate }}</v-list-item-subtitle
                                    >
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </span>
                </v-card-title>
                <v-container
                    v-if="(fullPostComputed && !editModeComputed) || (!fullPostComputed && isIndexComputed)"
                    position="relative"
                    class="scroll-y"
                    :class="[
                        { noPaddingTop: fullPostComputed, fixedPadding: isIndexComputed },
                        'postScrollWindow_' + domId
                    ]"
                    style="margin: 0; max-width: none; overflow-wrap: break-word"
                >
                    <v-layout id="htmlContentContainer" v-scroll:#post-scroll-target column align-center justify-center>
                        <v-card-text
                            v-if="!loadingIcon"
                            id="postCardText"
                            :class="{ indexPostCardText: isIndexComputed }"
                        >
                            <v-list-item-sub-title class="whitespaceInit post-title secondaryTitle">
                                <span>{{ post.title }}</span>
                            </v-list-item-sub-title>
                            <div class="ql-editor">
                                <div v-show="showContent" id="htmlOutput" v-html="post.htmlContent"></div>
                            </div>
                        </v-card-text>
                    </v-layout>
                </v-container>
                <Quill
                    v-if="fullPostComputed && !loadingIcon && editModeComputed"
                    key="editQuill"
                    ref="editQuill"
                    :class="'postScrollWindow_' + domId"
                    style="margin-bottom: 20px"
                    :editor-setup="{ allowEdit: true, showToolbar: true, postHash }"
                    @markdownPreviewToggle="markDownToggled"
                ></Quill>

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
    PostData,
    GetPostCallBack,
    PostContent,
    GetPostContentCallBack,
    PostSettings,
    PostSettingsCallback,
    PostSettingsEditType,
    PostVersionTypes,
    Requests
} from "../../../../cshub-shared/src/api-calls";
import { getTopicFromHash } from "../../../../cshub-shared/src/utilities/Topics";
import { Routes } from "../../../../cshub-shared/src/Routes";

import { ApiWrapper, errorLogStringConsole, logObjectConsole, logStringConsole } from "../../utilities";
import { CacheTypes } from "../../utilities/cache-types";
import { idGenerator } from "../../utilities/id-generator";

import { dataState } from "../../store";
import { userState } from "../../store";
import { uiState } from "../../store";
import { ForceEditPost } from "../../../../cshub-shared/src/api-calls";
import { colorize } from "../../utilities/codemirror-colorize";
import PostSaveEditDialog from "./PostSaveEditDialog.vue";
import { IPost } from "../../../../cshub-shared/src/entities/post";
import { ITopic } from "../../../../cshub-shared/src/entities/topic";

interface IBreadCrumbType {
    name: string;
    url: string;
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

    private domId: string = idGenerator();
    private post: IPost | null = null;
    private topicNames: IBreadCrumbType[] = [];
    private canResize = true;
    private showContent = true;
    private loadingIcon = false;
    private previousTopicURL = "";
    private showTopMenu = true;
    private resizeInterval: number | undefined = undefined;
    private showLoadingIcon = false;

    /**
     * Computed properties
     */
    get userOwnsThisPostComputed(): boolean {
        if (this.post) {
            return userState.userModel.id === this.post.author.id;
        } else {
            return false;
        }
    }

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
        return dataState.topics;
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

    get isIndexComputed(): boolean {
        if (this.post) {
            return this.post.isIndex && !this.isOnAdminDashboard && !this.isOnUserDashboard && !this.isOnUnsavedPosts;
        }
        return false;
    }

    /**
     * Watchers
     */
    @Watch("$route")
    private routeChanged(to: Route, from: Route) {
        if (this.fullPostComputed || to.fullPath.includes(this.postHash.toString())) {
            if (from.name === "topic" || from.fullPath === Routes.INDEX) {
                if (this.post) {
                    this.getContentRequest(this.post);
                    this.previousTopicURL = from.fullPath;
                }
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

        window.addEventListener("resize", this.windowHeightChanged);
        this.windowHeightChanged();
        this.getPostRequest();

        if (uiState.previousRoute) {
            if (uiState.previousRoute.fullPath === Routes.USERDASHBOARD) {
                this.previousTopicURL = Routes.USERDASHBOARD;
            } else if (uiState.previousRoute.fullPath === Routes.ADMINDASHBOARD) {
                this.previousTopicURL = Routes.ADMINDASHBOARD;
            } else if (uiState.previousRoute.fullPath === Routes.UNSAVEDPOSTS) {
                this.previousTopicURL = Routes.UNSAVEDPOSTS;
            }
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

    private markDownToggled(value: boolean) {
        Vue.nextTick(() => {
            this.windowHeightChanged();
        });
    }

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

                const rootElement = document.getElementsByClassName(`postScrollWindow_${this.domId}`);
                let elements: HTMLCollectionOf<Element>;

                if (rootElement.length === 1) {
                    const elementsByClassNameElement = rootElement[0];
                    elements = elementsByClassNameElement.getElementsByClassName("flex");

                    if (elements !== null && newHeight > 0) {
                        // @ts-ignore
                        elementsByClassNameElement.style.maxHeight = `${newHeight}px`;

                        for (const element of elements) {
                            // @ts-ignore
                            element.style.maxHeight = `${newHeight}px`;
                        }

                        setTimeout(() => {
                            this.canResize = true;
                        }, 250);
                    } else {
                        this.canResize = true;
                    }
                } else {
                    this.canResize = true;
                    errorLogStringConsole("Found multiple postScrollWindows", "Post.vue");
                }
            } else {
                this.canResize = true;
            }
        }
    }

    private hidePost() {
        ApiWrapper.sendPutRequest(
            new PostSettings(this.postHash, PostSettingsEditType.HIDE),
            (callback: PostSettingsCallback) => {
                logStringConsole("Removed post");
                this.$router.push(Routes.INDEX);
            }
        );
    }

    private wipPost() {
        ApiWrapper.sendPutRequest(
            new PostSettings(this.postHash, PostSettingsEditType.WIP),
            (callback: PostSettingsCallback) => {
                logStringConsole("WIPPED post");
                if (this.post) {
                    this.post.wip = !this.post.wip;
                }

                // this.$router.push(Routes.WIPPOSTS);
            }
        );
    }

    private returnToPostMenu() {
        this.$router.push(this.previousTopicURL);
    }

    private getParentTopic(child: ITopic, topics: ITopic[]): ITopic | null {
        for (const topic of topics) {
            if (topic.children !== undefined && topic.children.findIndex(x => x.id === child.id) !== -1) {
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
        localForage.getItem<IPost>(CacheTypes.POSTS + this.postHash).then((cachedValue: IPost) => {
            if (cachedValue === null || cachedValue.id === undefined) {
                ApiWrapper.sendGetRequest(new PostData(this.postHash), (callbackData: GetPostCallBack) => {
                    if (callbackData.post !== null) {
                        this.post = callbackData.post;

                        logObjectConsole(callbackData.post, "getPostRequest");

                        if (this.fullPostComputed || this.post.isIndex) {
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
                    if (cachedValue.isIndex) {
                        this.getContentRequest(cachedValue);
                    } else {
                        this.post = cachedValue;
                    }
                }
            }
        });
    }

    private getContentRequest(cachedValue: IPost) {
        const timeOut = setTimeout(() => {
            this.loadingIcon = true;
        }, 250);

        const postVersion: number = typeof cachedValue.htmlContent !== "string" ? -1 : cachedValue.postVersion;

        ApiWrapper.sendGetRequest(
            new PostContent(this.postHash, postVersion),
            (callbackContent: GetPostContentCallBack) => {
                clearTimeout(timeOut);
                this.loadingIcon = false;

                let hasBeenUpdated = false;

                if (callbackContent === null) {
                    this.post = {
                        ...cachedValue
                    };
                } else if (callbackContent.postVersionType === PostVersionTypes.POSTDELETED) {
                    this.$router.push(Routes.INDEX);
                } else if (callbackContent.postVersionType === PostVersionTypes.UPDATEDPOST) {
                    if (callbackContent.postUpdated && callbackContent.content) {
                        this.post = {
                            ...callbackContent.postUpdated
                        };
                        this.post.htmlContent = callbackContent.content.html;
                        hasBeenUpdated = true;
                    }
                } else if (callbackContent.postVersionType === PostVersionTypes.RETRIEVEDCONTENT) {
                    if (callbackContent.content) {
                        this.post = {
                            ...cachedValue
                        };
                        this.post.htmlContent = callbackContent.content.html;
                        hasBeenUpdated = true;
                    }
                }

                if (this.post) {
                    const topicFromHash = getTopicFromHash(this.post.topic.hash, dataState.topics);

                    if (topicFromHash) {
                        this.topicNames = this.getTopicListWhereFinalChildIs(topicFromHash);
                    }
                }

                if (hasBeenUpdated && this.post) {
                    this.$forceUpdate();
                    localForage.setItem<IPost>(CacheTypes.POSTS + this.postHash, this.post).then(() => {
                        logStringConsole("Changed post in cache", "getContentRequest");
                    });
                }

                this.scrollToHash();
            },
            (err: AxiosError) => {
                clearTimeout(timeOut);
                this.loadingIcon = false;

                if (cachedValue !== null && this.post) {
                    this.post.htmlContent = cachedValue.htmlContent;
                }
                this.$forceUpdate();

                this.scrollToHash();
            }
        );
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

    private navigateToPost(): void {
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

.theme--light.v-list .v-list__tile__sub-title {
    color: black;
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
