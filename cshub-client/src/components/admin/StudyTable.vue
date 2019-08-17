<template>
    <div>
        <v-dialog v-model="confirm_dialog" max-width="500px">
            <v-card>
                <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
                <v-card-text>This will be permanent</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="confirm_dialog = false">Yes</v-btn>
                    <v-btn color="green darken-1" text @click="confirm_dialog = false">No</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-data-table
            :headers="headers"
            :items="items"
            :loading="loading"
            :server-items-length="amountItems"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-toolbar flat color="white">

                    <v-spacer></v-spacer>
                    <v-dialog v-model="edit_dialog" max-width="500px">
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
<!--                                        <v-col cols="12" sm="6" md="4">-->
<!--                                            <v-text-field v-model="editedItem.name" label="Dessert name"></v-text-field>-->
<!--                                        </v-col>-->
<!--                                        <v-col cols="12" sm="6" md="4">-->
<!--                                            <v-text-field v-model="editedItem.calories" label="Calories"></v-text-field>-->
<!--                                        </v-col>-->
<!--                                        <v-col cols="12" sm="6" md="4">-->
<!--                                            <v-text-field v-model="editedItem.fat" label="Fat (g)"></v-text-field>-->
<!--                                        </v-col>-->
<!--                                        <v-col cols="12" sm="6" md="4">-->
<!--                                            <v-text-field v-model="editedItem.carbs" label="Carbs (g)"></v-text-field>-->
<!--                                        </v-col>-->
<!--                                        <v-col cols="12" sm="6" md="4">-->
<!--                                            <v-text-field v-model="editedItem.protein" label="Protein (g)"></v-text-field>-->
<!--                                        </v-col>-->
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
                <v-icon small class="mr-2" @click="editItem(item)">
                    fas fa-edit
                </v-icon>
                <v-icon small @click="deleteItem(item)">
                    fas fa-trash-alt
                </v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { ApiWrapper } from "../../utilities";

import { Studies, GetStudiesCallback } from "../../../../cshub-shared/src/api-calls/endpoints/study/Studies";
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
        { text: "Actions", value: "action", sortable: false}
    ];
    private loading = true;
    private edit_dialog = false;
    private confirm_dialog = false;
    private amountItems: number = 0;
    private editedItem: IStudy | null = null;
    private editedIndex: number = -1;

    /*
     * Lifecycle hooks
     */
    private mounted() {
        this.loading = true;
        ApiWrapper.sendGetRequest(new Studies(), (callback: GetStudiesCallback) => {
            this.items = callback.studies;
            this.amountItems = callback.studies.length;
            this.loading = false;
        });
    }

    private editItem(item: IStudy) {
        // this.editedIndex = this.items.indexOf(item);
        // this.editedItem = Object.assign({}, item);
        this.edit_dialog = true;
    }

    private deleteItem(item: IStudy) {
        this.confirm_dialog = true;
    }

    private close() {
        this.edit_dialog = false;
    }

    private get formTitle() {
        return this.editedIndex === -1 ? "New Item" : "Edit Item";
    }

    private save() {

        this.close();
    }

    // @Watch("dialog")
    // private open
}
</script>

<style scoped></style>
