<template>
    <v-container fluid fill-height>
        <v-layout justify-center align-center>
            <v-flex shrink>
                <v-card>
                    <v-card-title class="title font-weight-regular justify-space-between">
                        <span>Login</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form>
                            <v-text-field
                                v-model="userData.email"
                                v-validate="'required'"
                                label="Email"
                                :error-messages="emailErrors"
                                name="email"
                                required
                                autocomplete="email"
                                filled
                                @change="userData.emailerror = ''"
                                @keyup.enter="doLogin"
                            >
                                <template slot="append">
                                    <span class="mt-3">@</span>
                                    <v-select
                                        v-model="emailDomain"
                                        v-validate="'required'"
                                        item-text="domain"
                                        item-value="id"
                                        class="ma-0 pa-0 loginMailSelect"
                                        hide-details
                                        placeholder="Select email"
                                        :items="emailDomains"
                                    ></v-select>
                                </template>
                            </v-text-field>
                            <v-text-field
                                v-if="!forgotPassword"
                                v-model="userData.password"
                                v-validate="'required'"
                                label="Password"
                                :error-messages="passwordErrors"
                                name="password"
                                :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                :type="userData.passwordvisible ? 'text' : 'password'"
                                filled
                                required
                                autocomplete="current-password"
                                @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                @change="userData.passworderror = ''"
                                @keyup.enter="doLogin"
                            ></v-text-field>
                            <div v-if="!forgotPassword">
                                <v-switch v-model="userData.rememberuser" label="Remember email"></v-switch>
                                <v-btn depressed color="primary" class="mr-2" @click="doLogin">Login</v-btn>
                                <v-btn depressed color="secondary" to="createaccount" class="mr-2"
                                    >Create account</v-btn
                                >
                                <v-btn depressed color="accent" class="mr-2" @click="forgotPassword = true"
                                    >Forgot password</v-btn
                                >
                            </div>
                            <div v-else>
                                <v-btn depressed color="primary" class="mr-2" @click="forgotPasswordSend">Send</v-btn>
                                <v-btn depressed color="secondary" class="mr-2" @click="forgotPassword = false"
                                    >Back</v-btn
                                >
                            </div>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { ApiWrapper } from "../../utilities";
import { logStringConsole } from "../../utilities";

import { LocalStorageData } from "../../store/localStorageData";
import { uiState, userState } from "../../store";

import {
    ForgotPasswordMail,
    ForgotPasswordMailCallback,
    ForgotPasswordMailResponseTypes,
    Login,
    LoginCallBack,
    LoginResponseTypes
} from "../../../../cshub-shared/src/api-calls/index";
import { Routes } from "../../../../cshub-shared/src/Routes";
import { IEmailDomain } from "../../../../cshub-shared/src/entities/emaildomains";
import {
    GetEmailDomains,
    GetEmailDomainsCallback
} from "../../../../cshub-shared/src/api-calls/endpoints/emaildomains";

import router from "../router/router";
import { SocketWrapper } from "../../utilities/socket-wrapper";
import { Route } from "vue-router";

@Component({
    name: "LoginScreen",
    inject: ["$validator"]
})
export default class LoginScreen extends Vue {
    /**
     * Data
     */
    public previousRoute = "";
    private emailDomain: number | null = null;
    private emailDomains: IEmailDomain[] = [];

    private userData = {
        email: "",
        emailerror: "",
        password: "",
        passwordvisible: false,
        passworderror: "",
        globalerror: "",
        rememberuser: false
    };
    private forgotPassword = false;

    /**
     * Computed properties
     */
    get passwordErrors(): string {
        let validationErrors = "";
        if (this.errors) {
            const collect = this.errors.collect("password");
            if (collect.length > 0) {
                // @ts-ignore
                validationErrors = collect[0];
            }
        }

        const customErrors = this.userData.passworderror;
        return `${validationErrors.toString()}${customErrors}`;
    }

    get emailErrors(): string {
        let validationErrors = "";
        if (this.errors) {
            const collect = this.errors.collect("email");
            if (collect.length > 0) {
                // @ts-ignore
                validationErrors = collect[0];
            }
        }

        const customErrors = this.userData.emailerror;
        return `${validationErrors.toString()}${customErrors}`;
    }

    /**
     * Lifecycle hooks
     */
    private async mounted() {
        this.userData.email = localStorage.getItem(LocalStorageData.EMAIL) || "";

        const domains = await ApiWrapper.get(new GetEmailDomains());

        if (domains) {
            this.emailDomains = domains.domains;
            this.emailDomain = domains.domains[0].id;
        }
    }

    private beforeRouteEnter(to: Route, from: Route, next: (to?: (vm: this) => any) => void) {
        next((vm: this) => {
            vm.previousRoute = from.path;
        });
    }

    public metaInfo(): any {
        return {
            title: "Login - CSHub"
        };
    }

    /**
     * Methods
     */
    private forgotPasswordSend() {
        this.$validator.validateAll().then((allValid: boolean) => {
            if (allValid) {
                const emailDomain = this.emailDomains.filter(i => i.id === this.emailDomain)[0];
                ApiWrapper.sendPostRequest(
                    new ForgotPasswordMail(this.userData.email, emailDomain),
                    (result: ForgotPasswordMailCallback) => {
                        if (result.response === ForgotPasswordMailResponseTypes.SENT) {
                            uiState.setNotificationDialog({
                                on: true,
                                header: "Mail sent",
                                text: "The password reset mail has been sent."
                            });
                            this.forgotPassword = false;
                        } else {
                            this.userData.emailerror = "Unknown email address";
                        }
                    }
                );
            } else {
                this.popup();
            }
        });
    }

    private popup() {
        uiState.setNotificationDialog({
            on: true,
            header: `You forgot to fill out some fields`,
            text: ""
        });
    }

    private doLogin() {
        this.$validator.validateAll().then((allValid: boolean) => {
            if (allValid && this.emailDomain != null) {
                ApiWrapper.sendPostRequest(
                    new Login(
                        this.userData.email,
                        this.userData.password,
                        this.emailDomains.filter(i => i.id === this.emailDomain)[0]
                    ),
                    (callbackData: LoginCallBack) => {
                        if (callbackData.response === LoginResponseTypes.SUCCESS && callbackData.userModel) {
                            if (this.userData.rememberuser) {
                                localStorage.setItem(LocalStorageData.EMAIL, this.userData.email);
                            }
                            SocketWrapper.reconnectSocket(this.$socket);
                            userState.setUserModel(callbackData.userModel);
                            if (this.previousRoute.length !== 0) {
                                router.go(-1);
                            } else {
                                router.push(Routes.INDEX);
                            }
                        } else if (callbackData.response === LoginResponseTypes.NOEXISTINGACCOUNT) {
                            logStringConsole("Account does not exist");
                            this.userData.emailerror = "Account does not exist.";
                        } else if (callbackData.response === LoginResponseTypes.ACCOUNTNOTVERIFIED) {
                            logStringConsole("Account is not verified");
                            this.userData.emailerror = "Account has not been verified.";
                        } else if (callbackData.response === LoginResponseTypes.ACCOUNTBLOCKED) {
                            logStringConsole("Account is blocked");
                            this.userData.emailerror = "Account has been blocked.";
                        } else if (callbackData.response === LoginResponseTypes.INCORRECTPASS) {
                            logStringConsole("Incorrect password was entered");
                            this.userData.passworderror = "Incorrect password.";
                        } else if (callbackData.response === LoginResponseTypes.INVALIDINPUT) {
                            logStringConsole("Invalid input");
                            this.userData.passworderror = "Invalid input.";
                            this.userData.emailerror = "Invalid input.";
                        }
                    }
                );
            } else {
                this.popup();
            }
        });
    }
}
</script>

<style scoped></style>
