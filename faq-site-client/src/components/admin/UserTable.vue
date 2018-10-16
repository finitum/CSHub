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
                <td class="text-xs-right">{{ props.item.avatar }}</td>
                <td class="text-xs-right">{{ props.item.blocked }}</td>
                <td class="text-xs-right">{{ props.item.verified }}</td>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {ApiWrapper} from "../../utilities";
    import {GetAllUsersCallBack, GetAllUsersRequest} from "../../../../faq-site-shared/api-calls/admin";
    import {IUser} from "../../../../faq-site-shared/models";

    export default Vue.extend({
        name: "userTable",
        data() {
            return {
                items: [] as IUser[],
                pagination: {} as any,
                headers: [
                    {text: "Id", value: "id"},
                    {text: "First name", value: "firstname"},
                    {text: "Last name", value: "lastname"},
                    {text: "Email", value: "email"},
                    {text: "Admin", value: "admin"},
                    {text: "Avatar", value: "avatar"},
                    {text: "Blocked", value: "blocked"},
                    {text: "Verified", value: "verified"}
                ],
                loading: true,
                amountItems: 0 as number
            };
        },
        watch: {
            pagination: {
                handler() {
                    this.getData(this.pagination.rowsPerPage, this.pagination.page);
                },
                deep: true
            }
        },
        methods: {
            getData(rowsPerPage: number, page: number) {
                this.loading = true;
                ApiWrapper.sendPostRequest(new GetAllUsersRequest(rowsPerPage, page), (callback: GetAllUsersCallBack) => {
                    this.items = callback.users;
                    this.amountItems = callback.totalItems;
                    this.loading = false;
                });
            }
        },
        mounted() {
            this.getData(this.pagination.rowsPerPage, this.pagination.page);
        }
    });
</script>

<style scoped>

</style>