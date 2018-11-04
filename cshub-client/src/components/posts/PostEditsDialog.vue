<template>
    <v-dialog v-model="dialogActive" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
            <v-toolbar dark color="primary">
                <v-btn icon dark @click.native="dialogActive = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Edits</v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-card-text>
                <v-timeline dense clipped>

                    <div v-for="(edit, index) in edits">
                        <transition name="editList" @before-leave="initQuill = false" @before-enter="initQuill = false" @after-leave="initQuill = true">
                            <v-timeline-item
                                    v-show="showIndex === -1 || showIndex === index"
                                    class="mb-3"
                                    color="grey"
                                    icon-color="grey lighten-2"
                                    small
                            >
                                <v-layout justify-space-between>
                                        <v-flex xs7>
                                            <span v-if="index !== 0">Edited by </span>
                                            <span v-if="index === 0">Created by </span>
                                            <span>{{edit.editedBy.firstname}} {{edit.editedBy.lastname}} on {{edit.datetime | formatDate}}</span>
                                            <v-btn depressed small color="primary" @click="showIndex = index" v-if="showIndex === -1">View edit</v-btn>
                                            <v-btn depressed small color="primary" @click="showIndex = -1" v-if="showIndex !== -1">Close edit</v-btn>
                                        </v-flex>
                                </v-layout>
                            </v-timeline-item>
                        </transition>
                    </div>
                </v-timeline>
                <Quill key="currEditQuill" ref="currEditQuill" v-if="showIndex !== -1 && (initQuill || edits.length === 1)"
                       :editorSetup="{allowEdit: false, showToolbar: false, postHash}"
                       :value="edits[showIndex].content"></Quill>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import Vue from "vue";
    import Delta from "quill-delta/dist/Delta";
    import {Component, Prop, Watch} from "vue-property-decorator";

    import Quill from "../quill/Quill.vue";

    import {GetEditContent, GetEditContentCallback} from "../../../../cshub-shared/api-calls/pages";
    import {IEdit} from "../../../../cshub-shared/models";

    import uiState from "../../store/ui";

    import {Routes} from "../../views/router/router";

    import {ApiWrapper} from "../../utilities";

    @Component({
        name: "PostEditsDialog",
        components: {Quill},
    })
    export default class PostEditsDialog extends Vue {

        /**
         * Data
         */
        @Prop(Number) private postHash: number;

        private edits: IEdit[] = [];
        private showIndex = -1;
        private initQuill = false;

        /**
         * Computed properties
         */
        get dialogActive(): boolean {
            return uiState.editDialogState;
        }

        set dialogActive(value: boolean) {
            this.$router.push(`${Routes.POST}/${this.postHash}`);
            uiState.setEditDialogState(value);
        }

        /**
         * Watchers
         */
        @Watch("dialogActive")
        private dialogActiveChanged(newVal: boolean) {
            if (newVal) {
                ApiWrapper.sendPostRequest(new GetEditContent(this.postHash), (callbackData: GetEditContentCallback) => {

                    let previousDelta = new Delta(JSON.parse(JSON.stringify(callbackData.edits[0].content)));

                    for (let i = 1; i < callbackData.edits.length; i++) {

                        const currContent = callbackData.edits[i].content;
                        const originalContent = JSON.parse(JSON.stringify(callbackData.edits[i].content));

                        for (const op of currContent.ops) {
                            if (op.hasOwnProperty("insert")) {
                                op.attributes = {
                                    ...op.attributes,
                                    background: "#65e832",
                                    color: "#003700"
                                };
                            }
                            if (op.hasOwnProperty("delete")) {
                                op.retain = op.delete;
                                delete op.delete;
                                op.attributes = {
                                    ...op.attributes,
                                    background: "#e8553e",
                                    color: "#370000",
                                    strike: true
                                };
                            }
                        }

                        callbackData.edits[i].content = previousDelta.compose(currContent);
                        previousDelta = previousDelta.compose(originalContent);
                    }

                    this.edits = callbackData.edits;
                });
            } else {
                this.showIndex = -1;
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