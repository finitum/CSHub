<template>
    <div>
        <v-progress-circular
            v-if="showLoadingIcon"
            :size="100"
            color="primary"
            style="z-index: 99999"
            indeterminate
            class="loadingIcon"
        ></v-progress-circular>
        <v-dialog v-model="thisDialogActive" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card v-if="post !== null">
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click.native="dialogActive = {on: false, hash: -1}">
                        <v-icon>fas fa-times</v-icon>
                    </v-btn>
                    <v-toolbar-title>Current edit</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-tooltip bottom>
                            <template v-slot:activator="{on}">
                                <v-btn v-on="on" depressed small color="red" @click="deleteEdit" v-if="hasBeenEdited">Delete</v-btn>
                            </template>
                            <span>Delete the current edit</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{on}">
                                <v-btn v-on="on" depressed small color="red" @click="save" v-if="hasBeenEdited">Save</v-btn>
                            </template>
                            <span>Save the current edit</span>
                        </v-tooltip>

                    </v-toolbar-items>
                </v-toolbar>
                <v-card-text>
                    <div v-if="hasBeenEdited">
                        <v-toolbar-title>Title</v-toolbar-title>
                        <v-text-field style="width: 100%" v-model="post.title"/>

                        <v-divider></v-divider>

                        <v-toolbar-title class="mt-2" style="margin-left: 0px">Topic</v-toolbar-title>
                        <v-treeview
                                v-if="topics !== null"
                                :active.sync="activeTopicHash"
                                :items="topics"
                                item-key="hash"
                                activatable
                                active-class="primary--text"
                                transition>
                        </v-treeview>

                        <v-divider></v-divider>

                        <v-toolbar-title class="mt-2" style="margin-left: 0px">Edit by {{editedByText}}</v-toolbar-title>
                        <Quill key="currEditQuill"
                               ref="currEditQuill"
                               class="save-quill"
                               v-if="content !== null"
                               :editorSetup="{allowEdit: false, showToolbar: false, postHash: post.hash}"
                               :initialValueProp="content">
                        </Quill>
                    </div>
                    <v-toolbar-title v-else>No new edit!</v-toolbar-title>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop, Watch} from "vue-property-decorator";

    import Quill from "../quill/Quill.vue";

    import {IPost, ITopic} from "../../../../cshub-shared/src/models";
    import {Routes} from "../../../../cshub-shared/src/Routes";

    import uiState from "../../store/ui";
    import {editDialogType} from "../../store/ui/state";

    import userState from "../../store/user";
    import {ApiWrapper, logStringConsole} from "../../utilities";
    import {EditPost, GetEditContent, GetEditContentCallback} from "../../../../cshub-shared/src/api-calls/pages";
    import dataState from "../../store/data";
    import Delta from "quill-delta/dist/Delta";

    @Component({
        name: "PostSaveEditDialog",
        components: {Quill},
    })
    export default class PostSaveEditDialog extends Vue {

        /**
         * Data
         */
        @Prop(null) private post: IPost;

        private showLoadingIcon = false;

        private content: Delta = null;
        private editedByText: string = "";
        private hasBeenEdited = true;

        private activeTopicHash: number[] = [];

        /**
         * Computed properties
         */
        get dialogActive(): editDialogType {
            return uiState.currentEditDialogState;
        }

        set dialogActive(value: editDialogType) {
            if (!value.on) {
                uiState.setCurrentEditDialogState(value);
                this.$router.push(`${Routes.POST}/${this.post.hash}`);
            }
        }

        get userAdminComputed(): boolean {
            return userState.isAdmin;
        }

        get thisDialogActive(): boolean {
            return this.dialogActive.on && this.dialogActive.hash === this.post.hash;
        }

        get topics(): ITopic[] {
            return dataState.topics;
        }

        /**
         * Watchers
         */
        @Watch("dialogActive")
        private dialogActiveChanged(newVal: editDialogType) {
            if (this.thisDialogActive) {
                this.getEdit();
            }
        }

        /**
         * Lifecycle hooks
         */
        private mounted() {
            if (this.thisDialogActive) {
                this.getEdit();
            }
        }

        /**
         * Methods
         */
        private getEdit() {
            ApiWrapper.sendGetRequest(new GetEditContent(this.post.hash, true), (callbackData: GetEditContentCallback) => {

                if (callbackData.edits[callbackData.edits.length - 1].approved) {
                    this.hasBeenEdited = false;
                } else {
                    let content = new Delta();

                    for (let i = 0; i < callbackData.edits.length; i++) {

                        const currEdit = callbackData.edits[i];

                        if (i >= callbackData.edits.length - 1 && !currEdit.approved) {
                            this.editedByText = "";

                            for (const editor of currEdit.editedBy) {
                                if (this.editedByText !== "") {
                                    this.editedByText += ", ";
                                }
                                this.editedByText += editor.firstname + " " + editor.lastname;
                            }
                            const currContent = currEdit.content;

                            for (const op of currContent.ops) {
                                if (op.hasOwnProperty("insert")) {
                                    op.attributes = {
                                        ...op.attributes,
                                        background: this.$vuetify.theme.success,
                                        color: this.$vuetify.theme.secondary
                                    };
                                }
                                if (op.hasOwnProperty("delete")) {
                                    op.retain = op.delete;
                                    delete op.delete;
                                    op.attributes = {
                                        ...op.attributes,
                                        background: this.$vuetify.theme.warning,
                                        color: this.$vuetify.theme.secondary,
                                        strike: true
                                    };
                                }
                            }

                            content = content.compose(currContent);
                        } else {
                            content = content.compose(currEdit.content);
                        }

                    }

                    this.hasBeenEdited = true;
                    this.content = content;
                }

            });

            this.activeTopicHash = [this.post.topicHash];
        }

        public save() {
            this.showLoadingIcon = true;
            logStringConsole("Editing post");
            ApiWrapper.sendPutRequest(new EditPost(
                this.post.hash,
                this.post.title,
                this.activeTopicHash[0],
                false
            ), (responseData: null, status) => {
                this.showLoadingIcon = false;
                if (status === 200) {
                    uiState.setNotificationDialogState({
                        on: true,
                        header: "Edited post",
                        text: "Post was edited successfully"
                    });
                } else if (status === 204) {
                    uiState.setNotificationDialogState({
                        on: true,
                        header: "Didn't edit post",
                        text: "There was nothing to update!"
                    });
                } else {
                    logStringConsole("Editing post returned unexpected status code");
                }

                this.dialogActive = {
                    on: false,
                    hash: -1,
                    hasJustSaved: true
                };
            });
        }

        public deleteEdit() {
            ApiWrapper.sendPostRequest(new EditPost(
                this.post.hash,
                this.post.title,
                this.activeTopicHash[0],
                true
            ), (responseData: null, status) => {
                this.showLoadingIcon = false;

                uiState.setNotificationDialogState({
                    on: true,
                    header: "Deleted edit",
                    text: "Edit was successfully deleted"
                });

                this.dialogActive = {
                    on: false,
                    hash: -1,
                    hasJustSaved: false
                };
            });
        }
    }
</script>

<style lang="scss">
    .save-quill {
        .ql-editor {
            overflow: hidden;
        }
    }
</style>
