<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="items"
            :loading="loading"
            :server-items-length="items.length"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="newStudyDialog" max-width="500px">
                        <template v-slot:activator="{ on }">
                            <v-btn color="primary" dark class="mb-2" v-on="on">Create Study</v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="headline">Create Study</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col>
                                            <v-text-field
                                                v-model="newStudyName"
                                                label="Study name"
                                                hint="e.g. Computer Science"
                                                persistent-hint
                                                required
                                                :counter="maxStudyNameLength"
                                                :rules="[studyNameRule(newStudyName)]"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-switch v-model="newStudyHideSwitch" label="Hidden"></v-switch>
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

            <template v-slot:item.name="props">
                <div v-if="isEditingName !== props.item.id" class="pa-0" @click="editingStart(props.item)">
                    {{ props.item.name }}
                </div>
                <v-text-field
                    v-else
                    v-model="props.item.name"
                    class="pt-0"
                    single-line
                    hide-details
                    autofocus
                    append-icon="fas fa-check"
                    :counter="maxStudyNameLength"
                    :rules="[studyNameRule(props.item.name)]"
                    @keyup.enter="editingDone(props.item)"
                    @click:append="editingDone(props.item)"
                >
                </v-text-field>
            </template>

            <template v-slot:item.hidden="{ item }">
                <div class="pa-0">
                    <v-icon v-if="item.hidden" small @click="hideItem(item)">
                        fas fa-eye
                    </v-icon>
                    <v-icon v-else small @click="hideItem(item)">
                        fas fa-eye-slash
                    </v-icon>
                    {{ item.hidden.toString() }}
                </div>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { ApiWrapper } from "../../utilities";

import { AllStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/Studies";
import { HideStudies, UnhideStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/HideStudies";
import { RenameStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/RenameStudies";
import { CreateStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/CreateStudies";
import { IStudy } from "../../../../cshub-shared/src/entities/study";
import { dataState } from "../../store";
import { getAndSetStudyNr, getStudies } from "../../views/router/guards/setupRequiredDataGuard";

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
        { text: "Hidden", value: "hidden" }
    ];

    private loading = true;
    private newStudyDialog = false;
    private isEditingName: false | number = false; // not editing or id

    private newStudyHideSwitch: boolean = false;

    private newStudyName: string = "";
    private oldStudyName: string = "";

    private readonly maxStudyNameLength: number = 20;
    private readonly minStudyNameLength: number = 3;

    /*
     * Lifecycle hooks
     */
    private mounted() {
        this.loading = true;
        this.getData();
    }

    private async getData() {
        const response = await ApiWrapper.get(new AllStudies());

        if (response !== null) {
            this.items = response.studies;
            this.loading = false;
        }
    }

    private async rename(item: IStudy) {
        await ApiWrapper.put(new RenameStudies(item.id, item.name));

        const studies = await getStudies(true);
        if (studies.length > 0) {
            dataState.setStudies(studies);
        }
    }

    private async hideItem(item: IStudy) {
        if (item.hidden) {
            await ApiWrapper.put(new UnhideStudies(item.id));
            item.hidden = false;
        } else {
            try {
                await ApiWrapper.put(new HideStudies(item.id));
                item.hidden = true;
            } catch (err) {
                // Noop
            }
        }

        const studies = await getStudies(true);
        dataState.setStudies(studies);
        await getAndSetStudyNr(studies);
    }

    private studyNameRule(name: string) {
        return name.length >= this.minStudyNameLength ? true : `Length must be more than ${this.minStudyNameLength}`;
    }

    private close() {
        this.newStudyDialog = false;
    }

    private editingDone(item: IStudy) {
        if (this.studyNameRule(item.name) !== true) {
            item.name = this.oldStudyName;
        }

        this.isEditingName = false;
        this.rename(item);
    }

    private editingStart(item: IStudy) {
        this.oldStudyName = item.name;
        this.isEditingName = item.id;
    }

    private async save() {
        if (this.studyNameRule(this.newStudyName) !== true) {
            return;
        }

        const response = await ApiWrapper.post(new CreateStudies(this.newStudyName, this.newStudyHideSwitch));
        if (response) {
            this.items.push(response.study);
        }

        this.close();
        this.newStudyName = "";
        this.newStudyHideSwitch = false;
    }
}
</script>

<style scoped></style>
