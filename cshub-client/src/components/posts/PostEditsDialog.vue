<template>
    <v-dialog v-model="thisDialogActive" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
            <v-toolbar dark color="primary">
                <v-btn icon dark @click.native="dialogActive = {on: false, hash: -1}">
                    <v-icon>fas fa-times</v-icon>
                </v-btn>
                <v-toolbar-title>Edits</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn depressed small color="red" @click="squashEdits" v-if="userAdminComputed">Execute squash</v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-card-text>
                <v-timeline dense clipped>
                    <div v-for="(edit, index) in edits" :key="index">
                        <transition name="editList" @before-leave="initQuill = false" @before-enter="initQuill = false" @after-leave="initQuill = true">
                            <v-timeline-item
                                    v-show="showIndex === -1 || showIndex === index"
                                    class="mb-3"
                                    color="grey"
                                    small
                            >
                                <v-layout justify-space-between>
                                        <v-flex xs7>
                                            <span v-if="index !== 0">Edited by </span>
                                            <span v-if="index === 0">Created by </span>
                                            <span v-if="edit.editedBy[0].id === null">unknown</span>
                                            <span v-else v-for="(user, userindex) in edit.editedBy">{{user.firstname}} {{user.lastname}}{{userindex === edit.editedBy.length - 1 ? "" : ", "}}</span>
                                            <span> on {{edit.datetime | formatDate}}</span>
                                            <v-btn depressed small color="primary" @click="showIndex = index" v-if="showIndex === -1">View edit</v-btn>
                                            <v-btn depressed small color="primary" @click="showIndex = -1" v-if="showIndex !== -1">Close edit</v-btn>
                                            <v-checkbox
                                                style="margin-top: 0"
                                                v-if="userAdminComputed"
                                                v-model="edit.squash"
                                                :disabled="edit.squashDisabled"
                                                @change="editsChanged"
                                                label="Squash"
                                            ></v-checkbox>
                                        </v-flex>
                                </v-layout>
                            </v-timeline-item>
                        </transition>
                    </div>
                </v-timeline>
                <Quill key="currEditQuill" ref="currEditQuill" v-if="showIndex !== -1 && (initQuill || edits.length === 1)"
                       :editorSetup="{allowEdit: false, showToolbar: false, postHash}"
                       :initialValueProp="edits[showIndex].content"></Quill>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import Vue from "vue";
    import Delta from "quill-delta/dist/Delta";
    import {Component, Prop, Watch} from "vue-property-decorator";

    import Quill from "../quill/Quill.vue";

    import {
        GetEditContent,
        GetEditContentCallback,
        SquashEdits,
        SquashEditsCallback
    } from "../../../../cshub-shared/src/api-calls/pages";
    import {IEdit} from "../../../../cshub-shared/src/models";
    import {Routes} from "../../../../cshub-shared/src/Routes";

    import uiState from "../../store/ui";
    import {editDialogType} from "../../store/ui/state";

    import {ApiWrapper} from "../../utilities";
    import userState from "../../store/user";

    interface EditCheckbox extends IEdit {
        squash: boolean;
        squashDisabled: boolean;
    }

    @Component({
        name: "PostEditsDialog",
        components: {Quill},
    })
    export default class PostEditsDialog extends Vue {

        /**
         * Data
         */
        @Prop(Number) private postHash: number;

        private edits: EditCheckbox[] = [];

        // In the template you loop through edits, with an index attached to all of them. This is the index of that list that is to be shown
        // -1 = all of them
        private showIndex = -1;
        private initQuill = false;

        /**
         * Computed properties
         */
        get dialogActive(): editDialogType {
            return uiState.editDialogState;
        }

        set dialogActive(value: editDialogType) {
            if (!value.on) {
                this.$router.push(`${Routes.POST}/${this.postHash}`);
                uiState.setEditDialogState(value);
            }
        }

        get userAdminComputed(): boolean {
            return userState.isAdmin;
        }

        get thisDialogActive(): boolean {
            return this.dialogActive.on && this.dialogActive.hash === this.postHash;
        }

        /**
         * Watchers
         */
        @Watch("dialogActive")
        private dialogActiveChanged(newVal: editDialogType) {
            if (this.thisDialogActive) {
                ApiWrapper.sendPostRequest(new GetEditContent(this.postHash, false), (callbackData: GetEditContentCallback) => {

                    const checkboxEdits: EditCheckbox[] = [];

                    let previousDelta = new Delta(JSON.parse(JSON.stringify(callbackData.edits[0].content)));

                    for (let i = 0; i < callbackData.edits.length; i++) {

                        const currEdit = callbackData.edits[i];

                        if (i > 0) {
                            const currContent = currEdit.content;
                            const originalContent = new Delta(currEdit.content).slice();

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

                            callbackData.edits[i].content = previousDelta.compose(currContent);
                            previousDelta = previousDelta.compose(originalContent);
                        }

                        checkboxEdits.push({
                            ...currEdit,
                            squash: false,
                            squashDisabled: false
                        });
                    }

                    this.edits = checkboxEdits;
                });
            } else {
                this.showIndex = -1;
            }
        }

        private editsChanged() {

            const edits = this.edits;

            let currSquashIndexes = [];

            for (let i = 0; i < edits.length; i++) {
                if (edits[i].squash) {
                    currSquashIndexes.push(i);
                }
            }

            currSquashIndexes = currSquashIndexes.sort((a, b) => a - b);

            if (currSquashIndexes.length > 0) {
                const firstIndex = currSquashIndexes[0];
                const minIndex = firstIndex !== 0 ? firstIndex - 1 : 0;

                const lastIndex = currSquashIndexes[currSquashIndexes.length - 1];
                const maxIndex = lastIndex !== edits.length - 1 ? lastIndex + 1 : edits.length - 1;

                for (let i = 0; i < edits.length; i++) {
                    edits[i].squashDisabled = !(i >= minIndex && i <= maxIndex);
                    if (!(i >= minIndex && i <= maxIndex)) {
                        edits[i].squash = false;
                    }
                }
            } else {
                edits.forEach((x) => x.squashDisabled = false);
            }

        }

        private squashEdits() {

            const squashIds = [];

            for (const edit of this.edits) {
                if (edit.squash) {
                    squashIds.push(edit.id);
                }
            }

            if (squashIds.length < 2) {
                uiState.setNotificationDialogState({
                    header: "Nope!",
                    text: "You should squash at least 2 edits!",
                    on: true
                });
            } else {
                ApiWrapper.sendPostRequest(new SquashEdits(this.postHash, squashIds), (callback: SquashEditsCallback) => {
                    this.dialogActive = {on: false, hash: -1};
                });
            }

        }
    }
</script>

<style scoped>
    .editList-enter-active, .editList-leave-active {
        transition: opacity .2s;
    }
    .editList-enter, .editList-leave-to {
        opacity: 0;
    }
</style>
