<template>
    <v-container fluid fill-height>
        <v-layout justify-center align-center>
            <v-flex>
                <v-progress-circular
                    v-if="showLoadingIcon"
                    :size="50"
                    color="primary"
                    indeterminate
                ></v-progress-circular>
                <v-card :class="{ opaqueLoading: showLoadingIcon }">
                    <v-card-title class="title font-weight-regular justify-space-between">
                        <v-layout row justify-space-between>
                            <v-flex>
                                <h3 class="headline">Create post</h3>
                            </v-flex>
                            <v-flex class="text-xs-right">
                                <v-btn depressed large color="primary" @click="submitPost">
                                    <span>Submit</span>
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-card-title>
                    <v-card-text>
                        <v-layout row>
                            <v-flex xs10>
                                <v-text-field
                                    v-model="postTitle"
                                    v-validate="'required|min:4|max:50'"
                                    style="font-weight:bold; font-size: 22px"
                                    label="Title"
                                    filled
                                    :error-messages="errors.collect('postTitle') + postTitleError"
                                    name="postTitle"
                                    required
                                    @change="postTitleError = ''"
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs2>
                                <v-checkbox v-model="isIndex" class="ml-3" label="Is index"></v-checkbox>
                            </v-flex>
                            <v-flex xs1 class="text-xs-right">
                                <v-menu
                                    v-model="topicViewOpen"
                                    :close-on-content-click="false"
                                    :nudge-width="100"
                                    :nudge-left="200"
                                    offset-x
                                >
                                    <v-btn id="tableButton" slot="activator" dark text>
                                        <v-icon
                                            v-if="!showTopicWrongIcon && !showTopicFilledIcon"
                                            color="black"
                                            style="font-size: 25px !important"
                                            >fas fa-folder</v-icon
                                        >
                                        <v-icon
                                            v-if="showTopicFilledIcon"
                                            color="primary"
                                            style="font-size: 25px !important"
                                            >fas fa-folder-plus</v-icon
                                        >
                                        <v-icon
                                            v-if="showTopicWrongIcon && !showTopicFilledIcon"
                                            color="red"
                                            style="font-size: 25px !important"
                                            >fas fa-folder-minus</v-icon
                                        >
                                    </v-btn>

                                    <v-card>
                                        <v-card-title primary-title style="padding-bottom: 0">
                                            <h3>
                                                Topic
                                            </h3>
                                        </v-card-title>
                                        <v-card-text style="padding-top: 0">
                                            <v-treeview
                                                v-if="topics !== null"
                                                :active.sync="activeTopicHash"
                                                :items="topics"
                                                item-key="hash"
                                                activatable
                                                active-class="primary--text"
                                                transition
                                            >
                                            </v-treeview>
                                        </v-card-text>
                                    </v-card>
                                </v-menu>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";

import Quill from "../../components/quill/Quill.vue";

import { dataState } from "../../store";

import { ApiWrapper } from "../../utilities";

import { SubmitPost, CreatePostCallback, SubmitPostResponse } from "../../../../cshub-shared/src/api-calls";
import { ITopic } from "../../../../cshub-shared/src/entities/topic";

@Component({
    name: "PostCreate",
    components: { Quill },
    inject: ["$validator"]
})
export default class PostCreate extends Vue {
    /**
     * Data
     */
    private activeTopicHash: number[] = [];
    private topicViewOpen = false;
    private postTitle = "";
    private postTitleError = "";
    private isIndex = false;
    private showTopicWrongIcon = false;
    private showTopicFilledIcon = false;
    private showLoadingIcon = false;

    /**
     * Computed properties
     */
    get topics(): ITopic[] {
        return dataState.topics;
    }

    /**
     * Watchers
     */
    @Watch("activeTopicHash")
    private activeTopicHashChanged() {
        this.showTopicFilledIcon = this.activeTopicHash[0] !== undefined;
    }

    /**
     * Lifecycle hooks
     */
    public metaInfo(): any {
        return {
            title: "Create post - CSHub"
        };
    }

    /**
     * Methods
     */
    private submitPost() {
        if (typeof this.activeTopicHash[0] !== "undefined") {
            this.$validator.validateAll().then((allValid: boolean) => {
                if (allValid) {
                    ApiWrapper.sendPostRequest(
                        new SubmitPost(this.postTitle, this.activeTopicHash[0], this.isIndex),
                        (response: CreatePostCallback) => {
                            this.showLoadingIcon = false;
                            if (response.response === SubmitPostResponse.SUCCESS) {
                                this.$router.push(`/post/${response.postHash}/edit`);
                            } else if (response.response === SubmitPostResponse.TITLEALREADYINUSE) {
                                this.postTitleError = "Title is already in use!";
                            } else if (response.response === SubmitPostResponse.ALREADYHASINDEX) {
                                this.postTitleError = "This topic already has an index!";
                            } else {
                                this.postTitleError = "There has been some error with this input";
                            }
                        }
                    );
                }
            });
        } else {
            this.showTopicWrongIcon = true;
            setTimeout(() => {
                this.showTopicWrongIcon = false;
            }, 1000);
        }
    }
}
</script>

<style scoped>
.opaqueLoading {
    pointer-events: none;
    filter: blur(8px);
}
</style>
