<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="items"
            :loading="loading"
            :server-items-length="amountItems"
            class="elevation-1"
            @update:options="getDataOptions"
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
import { Component } from "vue-property-decorator";

import { ApiWrapper } from "../../utilities";

import { AllUsers, AllUsersCallBack } from "../../../../cshub-shared/src/api-calls";
import { IUser } from "../../../../cshub-shared/src/entities/user";

@Component({
    name: "userTable"
})
export default class UserTable extends Vue {
    /**
     * Data
     */
    private items: IUser[] = [];

    private readonly headers = [
        { text: "Id", value: "id" },
        { text: "First name", value: "firstname" },
        { text: "Last name", value: "lastname" },
        { text: "Email", value: "email" },
        { text: "Admin", value: "admin" },
        { text: "Blocked", value: "blocked" },
        { text: "Verified", value: "verified" }
    ];
    private loading = true;
    private amountItems: number = 0;

    /*
     * Lifecycle hooks
     */
    private mounted() {
        this.getData(10, 1);
    }

    /**
     * Methods
     */
    private getDataOptions(options: { page: number; itemsPerPage: number }) {
        this.getData(options.itemsPerPage, options.page);
    }

    private getData(itemsPerPage: number, page: number) {
        this.loading = true;
        ApiWrapper.sendGetRequest(new AllUsers(itemsPerPage, page), (callback: AllUsersCallBack) => {
            this.items = callback.users;
            this.amountItems = callback.totalItems;
            this.loading = false;
        });
    }
}
</script>

<style scoped></style>
