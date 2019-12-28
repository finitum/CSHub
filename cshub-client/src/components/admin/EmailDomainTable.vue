<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="items"
            :loading="loading"
            :server-items-length="items.length"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="newDomainDialog" max-width="500px">
                        <template v-slot:activator="{ on }">
                            <v-btn color="primary" dark class="mb-2" v-on="on">Create Domain</v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="headline">Create Domain</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col>
                                            <v-text-field
                                                v-model="newDomainName"
                                                label="Domain name"
                                                hint="e.g. student.tudelft.nl"
                                                persistent-hint
                                                required
                                                :counter="maxDomainNameLength"
                                                :rules="[domainNameRule(newDomainName)]"
                                            ></v-text-field>
                                        </v-col>
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

            <template v-slot:item.domain="props">
                <div v-if="isEditingName !== props.item.id" class="pa-0" @click="editingStart(props.item)">
                    {{ props.item.domain }}
                </div>
                <v-text-field
                    v-else
                    v-model="props.item.domain"
                    class="pt-0"
                    single-line
                    autofocus
                    append-icon="fas fa-check"
                    :counter="maxDomainNameLength"
                    :rules="[domainNameRule(props.item.domain)]"
                    @keyup.enter="editingDone(props.item)"
                    @click:append="editingDone(props.item)"
                >
                </v-text-field>
            </template>

            <template v-slot:item.delete="{ item }">
                <v-icon small @click="deleteDomain(item)">
                    fas fa-trash
                </v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { ApiWrapper } from "../../utilities";

import {
    GetEmailDomains,
    GetEmailDomainsCallback,
    PutEmailDomains,
    PostEmailDomains,
    PostEmailDomainsCallback,
    DeleteEmailDomains
} from "../../../../cshub-shared/src/api-calls/endpoints/emaildomains";
import { IEmailDomain } from "../../../../cshub-shared/src/entities/emaildomains";

@Component({
    name: "domainTable"
})
export default class EmailDomainTable extends Vue {
    /**
     * Data
     */
    private items: IEmailDomain[] = [];

    private readonly headers = [
        { text: "Id", value: "id" },
        { text: "Domain", value: "domain" },
        { text: "Delete", value: "delete", sortable: false }
    ];

    private loading = true;
    private newDomainDialog = false;
    private isEditingName: false | number = false; // not editing or id

    private newDomainName: string = "";
    private oldDomainName: string = "";

    private readonly maxDomainNameLength: number = 64;
    private readonly minDomainNameLength: number = 3;

    /*
     * Lifecycle hooks
     */
    private mounted() {
        this.loading = true;
        this.getData();
    }

    private async getData() {
        const response = await ApiWrapper.get(new GetEmailDomains());

        if (response !== null) {
            this.items = response.domains;
            this.loading = false;
        }
    }

    private async rename(item: IEmailDomain) {
        await ApiWrapper.put(new PutEmailDomains(item));
    }

    private domainNameRule(name: string) {
        if (name.length < this.minDomainNameLength) {
            return `Length must be more than ${this.minDomainNameLength}`;
        } else if (this.items.filter(i => i.domain == name).length > 1) {
            return `Name must be unique`;
        } else {
            return true;
        }
    }

    private close() {
        this.newDomainDialog = false;
    }

    private async deleteDomain(domain: IEmailDomain) {
        await ApiWrapper.sendDeleteRequest(new DeleteEmailDomains(domain.id));
        this.items.splice(this.items.indexOf(domain), 1);
    }

    private editingDone(item: IEmailDomain) {
        if (this.domainNameRule(item.domain) !== true) {
            item.domain = this.oldDomainName;
        }

        this.isEditingName = false;
        this.rename(item);
    }

    private editingStart(item: IEmailDomain) {
        this.oldDomainName = item.domain;
        this.isEditingName = item.id;
    }

    private async save() {
        if (this.domainNameRule(this.newDomainName) !== true) {
            return;
        }

        const response = (await ApiWrapper.post(new PostEmailDomains(this.newDomainName))) as PostEmailDomainsCallback;
        if (response) {
            this.items.push(response.domain);
        }

        this.close();
        this.newDomainName = "";
    }
}
</script>

<style scoped></style>
