<template>
    <div>
        <v-subheader>
            Your profile
        </v-subheader>
        <v-container fluid fill-height class="grey lighten-4">
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

    import UserTable from "../../components/admin/UserTable.vue";

    export default Vue.extend({
        name: "AdminDashboard",
        components: {UserTable}
    });
</script>

<style scoped>

</style>