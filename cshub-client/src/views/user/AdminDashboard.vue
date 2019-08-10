<template>
    <div>
        <v-subheader>
            Users
        </v-subheader>
        <v-container fluid fill-height>
            <v-layout justify-center align-center>
                <v-flex>
                    <UserTable></UserTable>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import UserTable from "../../components/admin/UserTable.vue";

@Component({
    name: "AdminDashboard",
    components: { UserTable }
})
export default class AdminDashboard extends Vue {
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
