<template>
    <v-container fluid fill-height>
        <v-layout justify-center align-center>
            <v-flex shrink>
                <v-card>
                    <v-card-title class="title font-weight-regular justify-space-between">
                        <span>Create account</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form>
                            <v-text-field
                                v-model="userData.email"
                                v-validate="'required|checkTUEmail'"
                                label="Email"
                                :error-messages="errors.collect('email') + userData.emailerror"
                                name="email"
                                suffix="@student.tudelft.nl"
                                required
                                filled
                                @change="userData.emailerror = ''"
                                @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <v-text-field
                                v-model="userData.password"
                                v-validate="'required|min:8|confirmed:password confirmation'"
                                label="Password"
                                :error-messages="errors.collect('password')"
                                name="password"
                                :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                :type="userData.passwordvisible ? 'text' : 'password'"
                                filled
                                required
                                @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                @change="userData.passworderror = ''"
                                @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <v-text-field
                                ref="password confirmation"
                                v-model="userData.confirmPassword"
                                v-validate="'required|min:8'"
                                label="Confirm password"
                                :error-messages="errors.collect('password confirmation')"
                                name="password confirmation"
                                :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                :type="userData.passwordvisible ? 'text' : 'password'"
                                filled
                                required
                                @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                @change="userData.passworderror = ''"
                                @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <v-text-field
                                v-model="userData.firstname"
                                v-validate="'required|min:2'"
                                label="First name"
                                :error-messages="errors.collect('firstname')"
                                name="firstname"
                                required
                                filled
                                @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <v-text-field
                                v-model="userData.lastname"
                                v-validate="'required|min:2'"
                                label="Last name"
                                :error-messages="errors.collect('lastname')"
                                name="lastname"
                                required
                                filled
                                @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <div>
                                <v-btn depressed color="primary" @click="doCreateAccount">Create account</v-btn>
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

import { emailValidator, ApiWrapper, logStringConsole } from "../../utilities";

import {
    CreateAccount,
    CreateAccountCallBack,
    CreateAccountResponseTypes
} from "../../../../cshub-shared/src/api-calls";
import { Routes } from "../../../../cshub-shared/src/Routes";

import router from "../router/router";

@Component({
    name: "CreateUserAccount",
    inject: ["$validator"]
})
export default class CreateUserAccount extends Vue {
    /**
     * Data
     */
    private userData = {
        email: "",
        emailerror: "",
        password: "",
        confirmPassword: "",
        passwordvisible: false,
        firstname: "",
        lastname: ""
    };

    /**
     * Lifecycle hooks
     */
    private mounted() {
        this.$validator.extend("checkTUEmail", emailValidator);
    }

    public metaInfo(): any {
        return {
            title: "Create account - CSHub"
        };
    }

    /**
     * Methods
     */
    private doCreateAccount() {
        this.$validator.validateAll().then((allValid: boolean) => {
            if (allValid) {
                ApiWrapper.sendPostRequest(
                    new CreateAccount(
                        this.userData.email,
                        this.userData.password,
                        this.userData.firstname,
                        this.userData.lastname
                    ),
                    (callbackData: CreateAccountCallBack) => {
                        if (callbackData.response === CreateAccountResponseTypes.SUCCESS) {
                            router.push(Routes.LOGIN);
                        } else if (callbackData.response === CreateAccountResponseTypes.ALREADYEXISTS) {
                            logStringConsole("Account already exists");
                            this.userData.emailerror = "Account already exists.";
                        } else if (callbackData.response === CreateAccountResponseTypes.INVALIDINPUT) {
                            logStringConsole("Invalid input");
                            this.userData.emailerror = "Invalid input.";
                        }
                    }
                );
            }
        });
    }
}
</script>

<style scoped></style>
