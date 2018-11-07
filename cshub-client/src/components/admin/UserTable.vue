<template>
    <div>
        <v-data-table
                :headers="headers"
                :items="items"
                :pagination.sync="pagination"
                :total-items="amountItems"
                :loading="loading"
                class="elevation-1"
        >
            <template slot="items" slot-scope="props">
                <td>{{ props.item.id }}</td>
                <td class="text-xs-right">{{ props.item.firstname }}</td>
                <td class="text-xs-right">{{ props.item.lastname }}</td>
                <td class="text-xs-right">{{ props.item.email }}</td>
                <td class="text-xs-right">{{ props.item.admin }}</td>
                <td class="text-xs-right">{{ props.item.blocked }}</td>
                <td class="text-xs-right">{{ props.item.verified }}</td>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Watch} from "vue-property-decorator";

    import {ApiWrapper} from "../../utilities";

    import {GetAllUsersCallBack, GetAllUsers} from "../../../../cshub-shared/src/api-calls/admin";
    import {IUser} from "../../../../cshub-shared/src/models";

    @Component({
        name: "userTable"
    })
    export default class UserTable extends Vue {

        /**
         * Data
         */
        private items: IUser[] = [];
        private pagination: any = {};
        private readonly headers = [
            {text: "Id", value: "id"},
            {text: "First name", value: "firstname"},
            {text: "Last name", value: "lastname"},
            {text: "Email", value: "email"},
            {text: "Admin", value: "admin"},
            {text: "Blocked", value: "blocked"},
            {text: "Verified", value: "verified"}
        ];
        private loading = true;
        private amountItems: number = 0;

        /**
         * Watchers
         */
        @Watch("pagination", {deep: true})
        private paginationChanged(newValue: any) {
            this.getData(newValue.rowsPerPage, newValue.page);
        }

        /**
         * Lifecycle hooks
         */
        private mounted() {
            this.getData(this.pagination.rowsPerPage, this.pagination.page);
        }


        /**
         * Methods
         */
        private getData(rowsPerPage: number, page: number) {
            this.loading = true;
            ApiWrapper.sendPostRequest(new GetAllUsers(rowsPerPage, page), (callback: GetAllUsersCallBack) => {
                this.items = callback.users;
                this.amountItems = callback.totalItems;
                this.loading = false;
            });
        }
    }
</script>

<style scoped>
</style>