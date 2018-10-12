<template>
    <v-container fluid fill-height class="grey lighten-4">
        <v-layout justify-center align-center>
            <v-flex>
                <v-card>
                    <v-card-title class="title font-weight-regular justify-space-between">
                        <v-layout row justify-space-between>
                            <v-flex>
                                <h3 class="headline">Create post</h3>
                            </v-flex>
                            <v-flex class="text-xs-right">
                                <v-btn depressed large color="primary" @click="submitPost">Submit</v-btn>
                            </v-flex>
                        </v-layout>
                    </v-card-title>
                    <v-card-text>
                        <v-layout row>
                            <v-flex xs12>
                                <v-text-field
                                        style="font-weight:bold; font-size: 22px"
                                        label="Title"
                                        box
                                ></v-text-field>
                            </v-flex>
                            <v-flex class="text-xs-right">
                                <v-menu
                                        v-model="topicViewOpen"
                                        :close-on-content-click="false"
                                        :nudge-width="100"
                                        :nudge-left="200"
                                        offset-x
                                >
                                    <v-btn
                                            slot="activator"
                                            dark
                                            flat
                                            id="tableButton"
                                    >
                                        <v-icon color="black" id="tableIcon">mdi-folder-multiple</v-icon>
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
                                                    transition>
                                            </v-treeview>
                                        </v-card-text>
                                    </v-card>
                                </v-menu>
                            </v-flex>
                        </v-layout>
                        <Quill ref="quillEdit" :editorSetup="{allowEdit: true, showToolbar: true}"></Quill>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
    import Vue from "vue";
    import Quill from "../../components/quill/Quill.vue";
    import dataState from "../../store/data";

    export default Vue.extend({
        name: "PostCreate",
        components: {Quill},
        data() {
            return {
                activeTopicHash: [],
                topicViewOpen: false
            };
        },
        computed: {
            topics() {
                return dataState.topics;
            }
        },
        methods: {
            submitPost() {
                console.log((this.$refs as any).quillEdit.getDelta());
            }
        }
    });
</script>

<style scoped>
</style>