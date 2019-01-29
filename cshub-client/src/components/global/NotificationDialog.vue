<template>
    <v-dialog v-model="notificationDialogComputed.on" persistent max-width="500" style="z-index:99999">
        <v-card>
            <v-card-title class="headline">{{notificationDialogComputed.header}}</v-card-title>
            <v-card-text class="cardText" v-for="text in notificationDialogText" :key="text.index">{{text}}</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" flat v-if="notificationButtonEnabled" @click.native="doButtonClick">{{notificationDialogComputed.button.text}}</v-btn>
                <v-btn color="green darken-1" flat @click.native="notificationDialogComputed = {on: false, text: '', header: ''}">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import {Component} from "vue-property-decorator";
    import Vue from "vue";

    import {notificationDialogType} from "../../store/ui/state";
    import uiState from "../../store/ui";

    @Component({
        name: "NotificationDialog"
    })
    export default class NotificationDialog extends Vue {

        /**
         * Computed properties
         */
        get notificationDialogComputed(): notificationDialogType {
            return uiState.notificationDialogState;
        }

        set notificationDialogComputed(value: notificationDialogType) {
            uiState.setNotificationDialogState(value);
        }

        get notificationDialogText(): string[] {
            return this.notificationDialogComputed.text.split("\n");
        }

        get notificationButtonEnabled(): boolean {
            return this.notificationDialogComputed.button !== null && typeof this.notificationDialogComputed.button !== "undefined";
        }

        /*
         * Methods
         */
        private doButtonClick() {
            if (this.notificationButtonEnabled) {
                this.notificationDialogComputed.button.jsAction();
            }
        }
    }
</script>

<style scoped>

    .cardText {
        padding-top: 5px;
        padding-bottom: 5px;
    }
</style>