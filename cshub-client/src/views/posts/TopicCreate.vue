<template>
    <v-container fluid fill-height>
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
                                    v-model="topicTitle"
                                    v-validate="'required|min:2|max:35'"
                                    style="font-weight:bold; font-size: 22px"
                                    label="Topic title"
                                    filled
                                    :error-messages="errors.collect('topicTitle') + topicTitleError"
                                    name="topicTitle"
                                    required
                                    @change="topicTitleError = ''"
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
                                    transition
                                >
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
import { Component } from "vue-property-decorator";

import { dataState } from "../../store";

import { ApiWrapper, logStringConsole } from "../../utilities";

import { SubmitTopic } from "../../../../cshub-shared/src/api-calls";
import { Routes } from "../../../../cshub-shared/src/Routes";
import { ITopic } from "../../../../cshub-shared/src/entities/topic";

@Component({
    name: "TopicCreate",
    inject: ["$validator"]
})
export default class TopicCreate extends Vue {
    /**
     * Data
     */
    private activeTopicHash: number[] = [];
    private topicTitle = "";
    private topicTitleError = "";

    /**
     * Computed properties
     */
    get topics(): ITopic[] {
        return dataState.topics;
    }

    /**
     * Lifecycle hooks
     */
    public metaInfo(): any {
        return {
            title: "Create topic - CSHub"
        };
    }

    /**
     * Methods
     */
    private submitTopic() {
        if (this.activeTopicHash[0]) {
            this.$validator.validateAll().then((allValid: boolean) => {
                if (allValid) {
                    ApiWrapper.sendPostRequest(
                        new SubmitTopic(this.topicTitle, this.activeTopicHash[0]),
                        (response: null, status) => {
                            if (status === 201) {
                                this.$router.push(Routes.ADMINDASHBOARD);
                            } else if (status === 409) {
                                this.topicTitleError = "Title is already in use!";
                            } else {
                                logStringConsole("Unexpected status code: " + status, "TopicCreate.vue");
                            }
                        }
                    );
                }
            });
        }
    }
}
</script>

<style scoped></style>
