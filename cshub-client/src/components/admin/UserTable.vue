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
            <template v-slot:item.admin="{ item }">
                <v-checkbox v-model="item.admin" :disabled="isSelf(item)" @change="admin(item)"></v-checkbox>
            </template>

            <template v-slot:item.blocked="{ item }">
                <v-checkbox v-model="item.blocked" :disabled="isSelf(item)" @change="block(item)"></v-checkbox>
            </template>

            <template v-slot:item.verified="{ item }">
                <v-checkbox v-model="item.verified" :disabled="isSelf(item)" @change="verify(item)"></v-checkbox>
            </template>

            <template v-slot:item.studies="{ item }">
                <v-select
                    v-model="item.studies"
                    :items="studies"
                    label="Select"
                    multiple
                    item-value="id"
                    persistent-hint
                    :disabled="isSelf(item)"
                    @change="studyAdmin(item)"
                ></v-select>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { ApiWrapper } from "../../utilities";

import { AllUsers, AllUsersCallBack, Studies } from "../../../../cshub-shared/src/api-calls";
import { IUser } from "../../../../cshub-shared/src/entities/user";
import { IStudy } from "../../../../cshub-shared/src/entities/study";
import {
    VerifyUser,
    BlockUser,
    SetAdminUser,
    SetStudyAdminUser,
} from "../../../../cshub-shared/src/api-calls/endpoints/user/UserAdminPage";
import { dataState, uiState, userState } from "../../store";

@Component({
    name: "userTable",
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
        { text: "Verified", value: "verified" },
        { text: "Study admin", value: "studies" },
    ];
    private loading = true;
    private amountItems: number = 0;

    get studies(): Array<{ text: string; id: number }> {
        if (dataState.studies) {
            return dataState.studies.map((value) => {
                return {
                    text: value.name,
                    id: value.id,
                };
            });
        } else {
            return [];
        }
    }

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

    private getStudyAdmins(user: IUser) {
        return user.studies.map((study) => study.id);
    }

    private getData(itemsPerPage: number, page: number) {
        this.loading = true;
        ApiWrapper.sendGetRequest(new AllUsers(itemsPerPage, page), (callback: AllUsersCallBack) => {
            this.items = callback.users;
            this.amountItems = callback.totalItems;
            this.loading = false;
        });
    }

    private async admin(item: IUser) {
        await ApiWrapper.put(new SetAdminUser(item, item.admin));
    }

    private async block(item: IUser) {
        await ApiWrapper.put(new BlockUser(item, item.blocked));
    }

    private async studyAdmin(item: IUser) {
        await ApiWrapper.put(new SetStudyAdminUser(item, item.studies));
    }

    private async verify(item: IUser) {
        await ApiWrapper.put(new VerifyUser(item, item.verified));
    }

    private isSelf(item: IUser) {
        const Self = userState.userModel;
        if (Self === null) {
            return true;
        }

        if (item.id === Self.id) {
            return true;
        }

        return false;
    }
}
</script>

<style scoped></style>
