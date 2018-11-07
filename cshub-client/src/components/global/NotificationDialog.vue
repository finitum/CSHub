<template>
    <v-dialog v-model="notificationDialogComputed.on" persistent max-width="290">
        <v-card>
            <v-card-title class="headline">{{notificationDialogComputed.header}}</v-card-title>
            <v-card-text>{{notificationDialogComputed.text}}</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
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
    }
</script>

<style scoped>

</style>