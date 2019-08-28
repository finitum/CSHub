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
                    <v-btn icon dark @click.native="dialogActive = { on: false, hash: -1 }">
                        <v-icon>fas fa-times</v-icon>
                    </v-btn>
                    <v-toolbar-title>Current edit</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn v-if="hasBeenEdited" depressed small color="red" v-on="on" @click="deleteEdit"
                                    >Delete</v-btn
                                >
                            </template>
                            <span>Delete the current edit</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn v-if="hasBeenEdited" depressed small color="red" v-on="on" @click="save"
                                    >Save</v-btn
                                >
                            </template>
                            <span>Save the current edit</span>
                        </v-tooltip>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card-text>
                    <div v-if="hasBeenEdited">
                        <v-toolbar-title>Title</v-toolbar-title>
                        <v-text-field v-model="post.title" style="width: 100%" />

                        <v-divider></v-divider>

                        <v-toolbar-title class="mt-2" style="margin-left: 0px">Topic</v-toolbar-title>
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

                        <v-divider></v-divider>

                        <Quill
                            v-if="content !== null"
                            key="currEditQuill"
                            ref="currEditQuill"
                            class="save-quill"
                            :editor-setup="{ allowEdit: false, showToolbar: false, postHash: post.hash }"
                            :initial-value-prop="content"
                        >
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
import { Component, Prop, Watch } from "vue-property-decorator";

import Quill from "../quill/Quill.vue";

import { Routes } from "../../../../cshub-shared/src/Routes";

import { uiState } from "../../store";
import { editDialogType } from "../../store/state/uiState";

import { userState } from "../../store";
import { ApiWrapper, logStringConsole } from "../../utilities";
import { EditPost, EditContent, GetEditContentCallback } from "../../../../cshub-shared/src/api-calls";
import { dataState } from "../../store";
import Delta from "quill-delta/dist/Delta";
import { IPost } from "../../../../cshub-shared/src/entities/post";
import { ITopic } from "../../../../cshub-shared/src/entities/topic";

@Component({
    name: "PostSaveEditDialog",
    components: { Quill }
})
export default class PostSaveEditDialog extends Vue {
    /**
     * Data
     */
    @Prop({ required: true }) private post!: IPost;

    private showLoadingIcon = false;

    private content: Delta | null = null;
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

    set thisDialogActive(boolean) {
        //pass
    }

    get topics(): ITopic[] {
        return dataState.topTopic ? dataState.topTopic.children : [];
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
        ApiWrapper.sendGetRequest(new EditContent(this.post.hash, true), (callbackData: GetEditContentCallback) => {
            if (callbackData.edits[callbackData.edits.length - 1].approved) {
                this.hasBeenEdited = false;
            } else {
                let content = new Delta();

                for (let i = 0; i < callbackData.edits.length; i++) {
                    const currEdit = callbackData.edits[i];

                    if (i >= callbackData.edits.length - 1) {
                        if (!currEdit.approved) {
                            this.editedByText = "";

                            const editusers = currEdit.editusers;

                            if (editusers) {
                                for (const editor of editusers) {
                                    if (this.editedByText !== "") {
                                        this.editedByText += ", ";
                                    }
                                    this.editedByText += editor.firstname + " " + editor.lastname;
                                }
                            }

                            const currContent = currEdit.content;

                            const theme = this.$vuetify.theme;
                            const currentTheme = theme.dark ? theme.themes.dark : theme.themes.light;

                            for (const op of currContent.ops) {
                                if (op.hasOwnProperty("insert")) {
                                    op.attributes = {
                                        ...op.attributes,
                                        background: currentTheme.success,
                                        color: currentTheme.secondary
                                    };
                                }
                                if (op.hasOwnProperty("delete")) {
                                    op.retain = op.delete;
                                    delete op.delete;
                                    op.attributes = {
                                        ...op.attributes,
                                        background: currentTheme.warning,
                                        color: currentTheme.secondary,
                                        strike: true
                                    };
                                }
                            }

                            content = content.compose(currContent);
                        } else {
                            content = content.compose(currEdit.content);
                        }
                    } else {
                        content = content.compose(currEdit.content);
                    }
                }

                this.hasBeenEdited = true;
                this.content = content;
            }
        });

        this.activeTopicHash = [this.post.topic.hash];
    }

    public save() {
        this.showLoadingIcon = true;
        logStringConsole("Editing post");
        ApiWrapper.sendPutRequest(
            new EditPost(this.post.hash, this.post.title, this.activeTopicHash[0], false),
            (responseData: null, status) => {
                this.showLoadingIcon = false;
                if (status === 200) {
                    uiState.setNotificationDialog({
                        on: true,
                        header: "Edited post",
                        text: "Post was edited successfully"
                    });
                } else if (status === 204) {
                    uiState.setNotificationDialog({
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
            }
        );
    }

    public deleteEdit() {
        ApiWrapper.sendPutRequest(
            new EditPost(this.post.hash, this.post.title, this.activeTopicHash[0], true),
            (responseData: null, status) => {
                this.showLoadingIcon = false;

                uiState.setNotificationDialog({
                    on: true,
                    header: "Deleted edit",
                    text: "Edit was successfully deleted"
                });

                this.dialogActive = {
                    on: false,
                    hash: -1,
                    hasJustSaved: false
                };
            }
        );
    }
}
</script>

<style lang="scss">
.save-quill {
    .ql-editor {
        overflow: hidden;
    }

    .ql-container {
        height: 100%;
    }
}
</style>
