<template>
    <div class="text-xs-center">
        <v-container>
            <v-layout justify-center>
                <v-flex xs12>
                    <v-card style="background-color: transparent; border: none; box-shadow: none !important">
                        <v-card-text>
                            <v-pagination
                                v-model="paginationPageState"
                                :length="Math.ceil(elements / range)"
                            ></v-pagination>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";

import { uiState } from "../../store";

@Component({
    name: "PostPagination"
})
export default class PostPagination extends Vue {
    /**
     * Data
     */
    @Prop({ required: true }) private range!: number;
    @Prop({ required: true }) private elements!: number;

    /**
     * Computed properties
     */
    get paginationPageState(): number {
        return uiState.paginationPageState;
    }

    set paginationPageState(page: number) {
        uiState.setPaginationPageState(page);
    }
}
</script>

<style scoped></style>
