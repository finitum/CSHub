<template>
    <div>
        <v-tabs v-model="tabs" icons-and-text>
            <v-tab>
                Users
                <v-icon>fas fa-users</v-icon>
            </v-tab>

            <v-tab>
                Studies
                <v-icon>fas fa-graduation-cap</v-icon>
            </v-tab>

            <v-tab>
                Topics
                <v-icon>fas fa-book-open</v-icon>
            </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tabs">
            <v-tab-item>

                <v-container fluid fill-height class="pa-5 pt-10">
                    <v-layout justify-center align-center>
                        <v-flex>
                            <UserTable></UserTable>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-tab-item>
            <v-tab-item>
                <v-container fluid fill-height class="pa-5 pt-10">
                    <v-layout justify-center align-center>
                        <v-flex>
                            <StudyTable></StudyTable>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-tab-item>
            <v-tab-item>
                <v-container fluid fill-height class="pa-5 pt-10">
                    <v-layout justify-center align-center>
                        <v-flex>
                            <StudyTable></StudyTable>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-tab-item>
        </v-tabs-items>

<!--        <v-subheader>-->
<!--            Users-->
<!--        </v-subheader>-->
<!--        <v-container fluid fill-height>-->
<!--            <v-layout justify-center align-center>-->
<!--                <v-flex>-->
<!--                    <UserTable></UserTable>-->
<!--                </v-flex>-->
<!--            </v-layout>-->
<!--        </v-container>-->
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import UserTable from "../../components/admin/UserTable.vue";
import StudyTable from "../../components/admin/StudyTable.vue";

@Component({
    name: "AdminDashboard",
    components: { UserTable, StudyTable }
})
export default class AdminDashboard extends Vue {
    private tabs = null;

    /**
     * Lifecycle hooks
     */

    public metaInfo(): any {
        return {
            title: "Admin - CSHub"
        };
    }
}
</script>

<style scoped></style>
