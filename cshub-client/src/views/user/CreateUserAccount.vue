<template>
    <v-container fluid fill-height class="grey lighten-4">
        <v-layout justify-center align-center>
            <v-flex shrink>
                <v-card>
                    <v-card-title class="title font-weight-regular justify-space-between">
                        <span>Create account</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form>
                            <v-text-field
                                    label="Email"
                                    v-model="userData.email"
                                    :error-messages="errors.collect('email') + userData.emailerror"
                                    name="email"
                                    v-validate="'required|checkTUEmail'"
                                    suffix="@student.tudelft.nl"
                                    required
                                    box
                                    @change="userData.emailerror = ''"
                                    @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <v-text-field
                                    label="Password"
                                    v-model="userData.password"
                                    :error-messages="errors.collect('password')"
                                    name="password"
                                    :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                    @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                    :type="userData.passwordvisible ? 'text' : 'password'"
                                    v-validate="'required|min:8|confirmed:password confirmation'"
                                    box
                                    required
                                    @change="userData.passworderror = ''"
                                    @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <v-text-field
                                    label="Confirm password"
                                    v-model="userData.confirmPassword"
                                    :error-messages="errors.collect('password confirmation')"
                                    name="password confirmation"
                                    :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                    @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                    :type="userData.passwordvisible ? 'text' : 'password'"
                                    v-validate="'required|min:8'"
                                    box
                                    ref="password confirmation"
                                    required
                                    @change="userData.passworderror = ''"
                                    @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <v-text-field
                                    label="First name"
                                    v-model="userData.firstname"
                                    :error-messages="errors.collect('firstname')"
                                    name="firstname"
                                    v-validate="'required'"
                                    required
                                    box
                                    @keyup.enter="doCreateAccount"
                            ></v-text-field>
                            <v-text-field
                                    label="Last name"
                                    v-model="userData.lastname"
                                    :error-messages="errors.collect('lastname')"
                                    name="lastname"
                                    v-validate="'required'"
                                    required
                                    box
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
    import {Component} from "vue-property-decorator";

    import {emailValidator, ApiWrapper, logStringConsole} from "../../utilities";

    import {
        CreateAccount,
        CreateAccountCallBack,
        CreateAccountResponseTypes
    } from "../../../../cshub-shared/src/api-calls";
    import {Routes} from "../../../../cshub-shared/src/Routes";

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

        /**
         * Methods
         */
        private doCreateAccount() {
            this.$validator.validateAll()
                .then((allValid: boolean) => {
                    if (allValid) {
                        ApiWrapper.sendPostRequest(new CreateAccount(this.userData.email, this.userData.password, this.userData.firstname, this.userData.lastname), (callbackData: CreateAccountCallBack) => {
                            if (callbackData.response === CreateAccountResponseTypes.SUCCESS) {
                                router.push(Routes.LOGIN);
                            } else if (callbackData.response === CreateAccountResponseTypes.ALREADYEXISTS) {
                                logStringConsole("Account already exists");
                                this.userData.emailerror = "Account already exists.";
                            } else if (callbackData.response === CreateAccountResponseTypes.INVALIDINPUT) {
                                logStringConsole("Invalid input");
                                this.userData.emailerror = "Invalid input.";
                            }
                        });
                    }
                });
        }
    }
</script>

<style scoped>

</style>