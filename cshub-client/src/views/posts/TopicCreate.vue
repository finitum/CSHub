<template>
    <v-container fluid fill-height class="grey lighten-4">
        <v-layout justify-center align-center>
            <v-flex>
                <v-card>
                    <v-card-title class="title font-weight-regular justify-space-between">
                        <v-layout row justify-space-between>
                            <v-flex>
                                <h3 class="headline">Add topic</h3>
                            </v-flex>
                            <v-flex class="text-xs-right">
                                <v-btn depressed large color="primary" @click="submitTopic">
                                    <span>Submit</span>
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-card-title>
                    <v-card-text>
                        <v-layout row>
                            <v-flex xs8>
                                <v-text-field
                                        style="font-weight:bold; font-size: 22px"
                                        label="Topic title"
                                        box
                                        v-model="topicTitle"
                                        v-validate="'required|min:4|max:127'"
                                        :error-messages="errors.collect('topicTitle') + topicTitleError"
                                        @change="topicTitleError = ''"
                                        name="topicTitle"
                                        required
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs4>
                                <v-treeview
                                        v-if="topics !== null"
                                        :active.sync="activeTopicHash"
                                        :items="topics"
                                        item-key="hash"
                                        activatable
                                        open-all
                                        active-class="primary--text"
                                        transition>
                                </v-treeview>
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
    import dataState from "../../store/data";
    import {ApiWrapper} from "../../utilities";
    import {
        SubmitTopicCallback,
        SubmitTopicRequest,
        SubmitTopicResponse
    } from "../../../../cshub-shared/api-calls/pages";
    import {Routes} from "../router/router";

    export default Vue.extend({
        name: "TopicCreate",
        inject: ["$validator"],
        data() {
            return {
                activeTopicHash: [],
                topicTitle: "",
                topicTitleError: ""
            };
        },
        computed: {
            topics() {
                return dataState.topics;
            }
        },
        methods: {
            submitTopic() {
                if (this.activeTopicHash[0] !== undefined) {
                    this.$validator.validateAll()
                        .then((allValid: boolean) => {
                            if (allValid) {
                                ApiWrapper.sendPostRequest(new SubmitTopicRequest(this.topicTitle, this.activeTopicHash[0]), (response: SubmitTopicCallback) => {
                                    if (response.response === SubmitTopicResponse.SUCCESS) {
                                        this.$router.push(Routes.ADMINDASHBOARD);
                                    } else if (response.response === SubmitTopicResponse.TITLEALREADYINUSE) {
                                        this.topicTitleError = "Title is already in use!";
                                    }
                                });
                            }
                        });
                }
            }
        }
    });
</script>

<style scoped>

</style>