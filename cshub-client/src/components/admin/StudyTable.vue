<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="items"
            :loading="loading"
            :server-items-length="amountItems"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="editDialog" max-width="500px">
                        <template v-slot:activator="{ on }">
                            <v-btn color="primary" dark class="mb-2" v-on="on">New Item</v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="headline">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col>
                                            <v-text-field
                                                label="Study name"
                                                hint="Computer Science"
                                                persistent-hint
                                                required
                                                v-model="editStudyName"
                                                :counter="maxStudyNameLength"
                                                :maxlength="maxStudyNameLength"
                                                :rules="[StudyNameRule(editStudyName)]"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-switch v-model="editHideSwitch" label="Hidden"></v-switch>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                                <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>

            <template v-slot:item.action="{ item }">

            </template>

            <template v-slot:item.name="props">
                <td v-if="!isEditingName" class="pa-0" @click="editingStart(props.item)">{{ props.item.name }}</td>
                <v-text-field
                    v-else
                    v-model="props.item.name"
                    class="pt-0"
                    single-line
                    hide-details
                    autofocus
                    append-icon="fas fa-check"
                    @keyup.enter="editingDone(props.item)"
                    @click:append="editingDone(props.item)"
                    :counter="maxStudyNameLength"
                    :maxlength="maxStudyNameLength"
                    :rules="[StudyNameRule(props.item.name)]"
                >
                </v-text-field>
            </template>

            <template v-slot:item.hidden="{ item }">
                <td class="pa-0">
                    <v-icon v-if="item.hidden" small @click="hideItem(item)">
                        fas fa-eye
                    </v-icon>
                    <v-icon v-else small @click="hideItem(item)">
                        fas fa-eye-slash
                    </v-icon>
                    {{ item.hidden.toString() }}
                </td>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { ApiWrapper, logStringConsole } from "../../utilities";

import { AllStudies, GetStudiesCallback } from "../../../../cshub-shared/src/api-calls/endpoints/study/Studies";
import { HideStudies, UnhideStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/HideStudies";
import { RenameStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/RenameStudies";
import {
    CreateStudies,
    CreateStudiesCallback
} from "../../../../cshub-shared/src/api-calls/endpoints/study/CreateStudies";
import { IStudy } from "../../../../cshub-shared/src/entities/study";

@Component({
    name: "studyTable"
})
export default class StudyTable extends Vue {
    /**
     * Data
     */
    private items: IStudy[] = [];

    private readonly headers = [
        { text: "Id", value: "id" },
        { text: "Study name", value: "name" },
        { text: "Top topic id", value: "topTopic.id" },
        { text: "Top topic name", value: "topTopic.name" },
        { text: "Hidden", value: "hidden" },
    ];
    private loading = true;
    private editDialog = false;
    private amountItems: number = 0;
    private selectedItem: IStudy | null = null;
    private isEditingName = false;
    private editHideSwitch: boolean = false;
    private editStudyName: string = "";
    private readonly maxStudyNameLength: number = 20;
    private readonly minStudyNameLength: number = 3;
    private oldname: string = "";

    /*
     * Lifecycle hooks
     */
    private mounted() {
        this.loading = true;
        this.getData();
    }

    private getData() {
        ApiWrapper.sendGetRequest(new AllStudies(), (callback: GetStudiesCallback) => {
            this.items = callback.studies;
            this.amountItems = callback.studies.length;
            this.loading = false;
        });
    }

    private async rename(item: IStudy) {
        await ApiWrapper.sendPostRequest(new RenameStudies(item), (response: null, status) => {
            if (status === 201) {
                return;
            } else if (status === 406) {
                return alert("name too long");
            } else {
                logStringConsole("Unexpected status code: " + status, "TopicCreate.vue");
            }
        });
    }

    private async hideItem(item: IStudy) {
        if (item.hidden) {
            await ApiWrapper.sendPostRequest(new UnhideStudies(item), (response: null, status) => {
                if (status === 201) {
                    item.hidden = false;
                    return;
                }else {
                    logStringConsole("Unexpected status code: " + status, "TopicCreate.vue");
                }
            });
        } else {
            await ApiWrapper.sendPostRequest(new HideStudies(item), (response: null, status) => {
                if (status === 201) {
                    item.hidden = true;
                    return;
                } else {
                    logStringConsole("Unexpected status code: " + status, "TopicCreate.vue");
                }
            });
        }
    }

    private StudyNameRule(name: string) {
        return name.length >= this.minStudyNameLength ? true : `Length must be more than ${this.minStudyNameLength}`;
    }

    private close() {
        this.selectedItem = null;
        this.editDialog = false;
    }

    private editingDone(item: IStudy) {
        if (this.StudyNameRule(item.name) !== true) {
            item.name = this.oldname;
        }

        this.isEditingName = false;
        this.rename(item);
    }

    private editingStart(item: IStudy) {
        this.oldname = item.name;
        this.isEditingName = true;
    }


    private get formTitle() {
        return this.selectedItem === null ? "New Item" : "Edit Item";
    }

    private async save() {
        if (this.StudyNameRule(this.editStudyName) !== true) {
            return;
        }

        await ApiWrapper.sendPostRequest(
            new CreateStudies(this.editStudyName, this.editHideSwitch),
            (response: CreateStudiesCallback, status) => {
                if (status === 201) {
                    this.items.push(response.study);
                } else {
                    logStringConsole("Unexpected status code: " + status, "TopicCreate.vue");
                }
        });

        this.close();
        this.editStudyName = "";
        this.editHideSwitch = false;
    }
}
</script>

<style scoped></style>
