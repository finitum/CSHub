<template>
    <div>
        <v-subheader>
            Studies
        </v-subheader>
        <v-container fluid fill-height>
            <v-layout justify-center align-center>
                <v-flex>
                    <StudyTable></StudyTable>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import StudyTable from "../../components/admin/StudyTable.vue";

@Component({
    name: "StudyEditor",
    components: { StudyTable }
})
export default class StudyEditor extends Vue {
    /**
     * Lifecycle hooks
     */

    public metaInfo(): any {
        return {
            title: "StudyEditor - CSHub"
        };
    }
}
</script>

<style scoped></style>
