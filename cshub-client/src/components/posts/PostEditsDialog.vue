<template>
    <v-dialog v-model="dialogActive" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
            <v-toolbar dark color="primary">
                <v-btn icon dark @click.native="dialogActive = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Settings</v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-card-text>
                <v-timeline dense clipped>

                    <div v-for="(edit, index) in edits">
                        <transition name="editList">
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
                <Quill key="currEditQuill" ref="currEditQuill" v-if="showIndex !== -1"
                       :editorSetup="{allowEdit: false, showToolbar: false, postHash}"
                       :value="edits[showIndex].content"></Quill>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import Vue from "vue";
    import uiState from "../../store/ui";
    import {ApiWrapper} from "../../utilities";
    import {GetEditContent, GetEditContentCallback} from "../../../../cshub-shared/api-calls/pages";
    import {IEdit} from "../../../../cshub-shared/models";
    // @ts-ignore
    import Delta from "quill-delta/dist/Delta";
    import {Routes} from "../../views/router/router";
    import Quill from "../quill/Quill.vue";

    export default Vue.extend({
        name: "PostEditsDialog",
        components: {Quill},
        props: {
            postHash: {
                type: Number,
                required: true
            },
        },
        data() {
            return {
                edits: [] as IEdit[],
                showIndex: -1
            }
        },
        computed: {
            dialogActive: {
                get(): boolean {
                    return uiState.editDialogState;
                },
                set() {
                    this.$router.push(`${Routes.POST}/${this.postHash}`);
                    uiState.setEditDialogState(false);
                }
            }
        },
        watch: {
            dialogActive(newVal: boolean) {
                ApiWrapper.sendPostRequest(new GetEditContent(this.postHash), (callbackData: GetEditContentCallback) => {

                    let previousDelta = new Delta(JSON.parse(JSON.stringify(callbackData.edits[0].content)));

                    for (let i = 1; i < callbackData.edits.length; i++) {

                        let currContent = callbackData.edits[i].content;
                        let originalContent = JSON.parse(JSON.stringify(callbackData.edits[i].content));

                        for (const op of currContent.ops) {
                            // if the change was an insertion
                            if (op.hasOwnProperty('insert')) {
                                // color it green
                                op.attributes = {
                                    background: "#cce8cc",
                                    color: "#003700"
                                };
                            }
                            // if the change was a deletion
                            if (op.hasOwnProperty('delete')) {
                                // keep the text
                                op.retain = op.delete;
                                delete op.delete;
                                // but color it red and struckthrough
                                op.attributes = {
                                    background: "#e8cccc",
                                    color: "#370000",
                                    strike: true
                                };
                            }
                        }

                        currContent = previousDelta.compose(currContent);
                        previousDelta = previousDelta.compose(originalContent);
                    }


                    console.log(callbackData.edits)

                    this.edits = callbackData.edits;
                });
            }
        }
    });
</script>

<style scoped>
    .editList-enter-active, .editList-leave-active {
        transition: opacity .2s;
    }
    .editList-enter, .editList-leave-to {
        opacity: 0;
    }
</style>