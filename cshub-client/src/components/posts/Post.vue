<template>
    <div>
        <div v-if="post !== null">
            <!-- The following transition is just a trick so I get an event on the change from preview to full post (performance of the animation when the viewer is on is terrible) -->
            <transition :duration="300" @before-leave="showContent = false" @before-enter="showContent = false" @after-enter="afterAnimation">
                <div v-if="fullPostComputed"></div>
            </transition>
            <v-card :class="{previewCard: !fullPostComputed, fullCard: fullPostComputed}" :id="'post_' + domId">
                    <v-card-title primary-title :id="'postTitle_' + domId" class="pb-0 xl-0 pt-1"  @click.capture="navigateToPost">
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
                                    <v-btn color="green" depressed small @click="verifyPost"
                                           v-if="!post.approved && userAdminComputed">
                                        <v-icon>fas fa-check</v-icon>
                                    </v-btn>
                                    <v-btn color="orange" depressed small @click="enableEdit"
                                           v-if="(userOwnsThisPostComputed || userAdminComputed) && !editModeComputed">
                                        <v-icon>fas fa-edit</v-icon>
                                    </v-btn>
                                    <v-btn v-if="editModeComputed" depressed small color="orange" @click="editPost">
                                        <v-icon>fas fa-save</v-icon>
                                    </v-btn>
                                    <v-btn depressed small color="primary" @click="viewEditDialog">
                                        <v-icon>fas fa-list-ol</v-icon>
                                    </v-btn>
                                    <v-btn depressed small color="secondary" @click="showTopMenu = false">
                                        <v-icon>fas fa-angle-up</v-icon>
                                    </v-btn>
                                </v-breadcrumbs>
                            </transition>
                            <v-list two-line>
                              <v-list-tile avatar class="mb-1 postTile">
                                <v-list-tile-avatar >
                                  <img :src="getAvatarURL(post.author.avatar)" :class="{adminBorder: post.author.admin}"/>
                                </v-list-tile-avatar>
                                <v-list-tile-content class="pt-2 d-inline">
                                  <v-list-tile-sub-title class="whitespaceInit black--text post-title">{{post.title}}</v-list-tile-sub-title>
                                  <v-list-tile-sub-title class="whitespaceInit">{{post.author.firstname}} {{post.author.lastname}} - {{post.datetime | formatDate}}</v-list-tile-sub-title>
                                </v-list-tile-content>
                              </v-list-tile>
                            </v-list>
                        </span>
                    </v-card-title>
                    <v-container
                            v-show="fullPostComputed"
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
                                <Quill key="editQuill" ref="editQuill" v-if="editModeComputed"
                                       :editorSetup="{allowEdit: true, showToolbar: true, postHash}"
                                       :initialValue="editContent"></Quill>
                                <div class="ql-editor">
                                  <div v-if="!editModeComputed" v-show="showContent" v-html="post.htmlContent"></div>
                                </div>
                            </v-card-text>
                        </v-layout>
                    </v-container>
                    <div v-if="loadingIcon">
                        <v-progress-circular
                                :size="150"
                                :width="5"
                                color="primary"
                                indeterminate
                                style="width: 100%; margin: 10% auto;" />
                    </div>
                </v-card>
        </div>
        <div v-else-if="loadingIcon">
            <v-progress-circular
                    :size="150"
                    :width="5"
                    color="primary"
                    indeterminate
                    style="width: 100%; margin: 10% auto;" />
        </div>
        <PostEditsDialog :key="postHash":postHash="postHash"></PostEditsDialog>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import localForage from "localforage";
import Delta from "quill-delta/dist/Delta";
import {Watch, Component, Prop} from "vue-property-decorator";
import {Route} from "vue-router";
import {AxiosError} from "axios";

import Quill from "../quill/Quill.vue";
import PostEditsDialog from "./PostEditsDialog.vue";

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
import {getTopicFromHash} from "../../../../cshub-shared/utilities/Topics";

import {ApiWrapper, logObjectConsole, logStringConsole} from "../../utilities";
import {CacheTypes} from "../../utilities/cache-types";
import {ImgurUpload} from "../../utilities/imgur";
import {idGenerator} from "../../utilities/id-generator";

import {Routes} from "../../views/router/router";

import dataState from "../../store/data";
import userState from "../../store/user";
import uiState from "../../store/ui";

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

    private domId: string = idGenerator();
    private post: IPost = null;
    private topicNames: IBreadCrumbType[] = [];
    private canResize = true;
    private editContent: Delta = new Delta();
    private showContent = true;
    private loadingIcon = false;
    private previousTopicURL = "";
    private showTopMenu = true;

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

    /**
     * Watchers
     */
    @Watch("$route")
    private routeChanged(to: Route, from: Route) {
        if (this.fullPostComputed && (from.name === "topic" || from.fullPath === Routes.INDEX)) {
            this.getContentRequest(this.post);
            this.previousTopicURL = from.fullPath;
        } else if (this.editsListComputed) {
            this.previousTopicURL = Routes.INDEX;
            this.viewEditDialog();
        } else {
            this.previousTopicURL = Routes.INDEX;
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

        this.previousTopicURL = Routes.INDEX;

        if (this.editModeComputed) {
            this.enableEdit();
        } else if (this.editsListComputed) {
            uiState.setEditDialogState({
                on: true,
                hash: this.postHash
            });
        }
    }

    private updated() {
        setTimeout(() => {
            this.windowHeightChanged();
        }, 500);
    }

    /**
     * Methods
     */
        private getAvatarURL(dbImage: string) {
            if (dbImage !== null) {
                return `data:image/jpg;base64,${dbImage}`;
            } else {
                return "/assets/defaultAvatar.png";
            }
        }
    private windowHeightChanged() {
        if (this.canResize) {
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

                (document.getElementsByClassName(`postScrollWindow_${this.domId}`).item(0) as HTMLElement).style.maxHeight = `${newHeight}px`;

                setTimeout(() => {
                    this.canResize = true;
                }, 1000);
            } else {
                this.canResize = true;
            }
        }
    }

    private verifyPost() {
        ApiWrapper.sendPostRequest(new VerifyPost(this.postHash), (callback: VerifyPostCallBack) => {
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
        ApiWrapper.sendPostRequest(new GetEditContent(this.postHash), (callbackData: GetEditContentCallback) => {
            let baseDelta = new Delta(callbackData.edits[0].content);
            for (let i = 1; i < callbackData.edits.length; i++) {
                baseDelta = baseDelta.compose(callbackData.edits[i].content);
            }

            this.editContent = baseDelta;

            this.$router.push(`${this.currentPostURLComputed}/edit`);
        });
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

    private editPost() {
        logStringConsole("Edited post");
        const delta: Delta = (this.$refs as any).editQuill.getDelta();

        ImgurUpload.findAndReplaceImagesWithImgurLinks(delta)
            .then((newValue: Delta) => {
                const diff = this.editContent.diff(newValue);

                const html: string = (this.$refs as any).editQuill.getHTML();

                ApiWrapper.sendPostRequest(new EditPost(this.postHash, diff, html), (callbackData: EditPostCallback) => {
                    this.$router.push(this.currentPostURLComputed);
                    this.getPostRequest();
                });
            });
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
                localForage.setItem<IPost>(CacheTypes.POSTS + this.postHash, this.post)
                    .then(() => {
                        logStringConsole("Changed post in cache", "getContentRequest");
                    });
            }
        }, (err: AxiosError) => {

            clearTimeout(timeOut);
            this.loadingIcon = false;

            this.post.htmlContent = cachedValue.htmlContent;
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
        logStringConsole(`Going to post ${this.post.title}`, "PostPreview navigateToPost");

        this.$router.push(this.currentPostURLComputed);
    }
}
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