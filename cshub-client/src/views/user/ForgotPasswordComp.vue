<template>
    <v-container fluid fill-height>
        <v-layout justify-center align-center>
            <v-flex shrink>
                <v-card>
                    <v-card-title class="title font-weight-regular justify-space-between">
                        <span>Reset password</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form>
                            <v-text-field
                                v-model="password"
                                v-validate="'required|min:8|confirmed:password confirmation'"
                                label="Password"
                                autocomplete="new-password"
                                :error-messages="errors.collect('password')"
                                name="password"
                                :append-icon="passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                :type="passwordvisible ? 'text' : 'password'"
                                filled
                                required
                                @click:append="() => (passwordvisible = !passwordvisible)"
                                @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <v-text-field
                                ref="password confirmation"
                                v-model="confirmPassword"
                                v-validate="'required|min:8'"
                                label="Confirm password"
                                autocomplete="new-password"
                                :error-messages="errors.collect('password confirmation')"
                                name="password confirmation"
                                :append-icon="passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                :type="passwordvisible ? 'text' : 'password'"
                                filled
                                required
                                @click:append="() => (passwordvisible = !passwordvisible)"
                                @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <div>
                                <v-btn depressed color="primary" @click="doChangePassword">Change password</v-btn>
                            </div>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import Vue from "vue";

import { ApiWrapper, logStringConsole } from "../../utilities";

import {
    ForgotPassword,
    ForgotPasswordCallback,
    ForgotPasswordResponseTypes,
} from "../../../../cshub-shared/src/api-calls";
import { Routes } from "../../../../cshub-shared/src/Routes";

import { uiState } from "../../store";

@Component({
    name: "ForgotPasswordComp",
    inject: ["$validator"],
})
export default class ForgotPasswordComp extends Vue {
    private accountId: number | null = null;
    private requestHash: number | null = null;

    private password: string = "";
    private confirmPassword: string = "";
    private passwordvisible = false;

    /**
     * Lifecycle hooks
     */
    private mounted() {
        this.accountId = +this.$route.query.accId;
        this.requestHash = +this.$route.query.hash;
    }

    public metaInfo(): any {
        return {
            title: "Forgot password - CSHub",
        };
    }

    /**
     * Methods
     */
    private doChangePassword() {
        this.$validator.validateAll().then((approved: boolean) => {
            if (approved && this.accountId && this.requestHash) {
                logStringConsole("Changing password");
                ApiWrapper.sendPostRequest(
                    new ForgotPassword(this.password, this.requestHash, this.accountId),
                    (callback: ForgotPasswordCallback) => {
                        if (callback.response === ForgotPasswordResponseTypes.CHANGED) {
                            uiState.setNotificationDialog({
                                on: true,
                                header: "Password changed",
                                text: "Your password has been changed, you can now log in",
                            });
                            this.$router.push(Routes.INDEX);
                        } else {
                            uiState.setNotificationDialog({
                                on: true,
                                header: "Password not changed",
                                text:
                                    "Your password has not been changed, something went wrong. Check whether this is the last request you did.",
                            });
                        }
                    },
                );
            }
        });
    }
}
</script>

<style scoped></style>
