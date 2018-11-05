<template>
    <v-container fluid fill-height class="grey lighten-4">
        <v-layout justify-center align-center>
            <v-flex shrink>
                <v-card>
                    <v-card-title class="title font-weight-regular justify-space-between">
                        <span>Login</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form>
                            <v-text-field
                                    label="Email"
                                    v-model="userData.email"
                                    :error-messages="emailErrors"
                                    name="email"
                                    v-validate="'required'"
                                    required
                                    suffix="@student.tudelft.nl"
                                    autocomplete="email"
                                    box
                                    @change="userData.emailerror = ''"
                                    @keyup.enter="doLogin"
                            ></v-text-field>
                            <v-text-field
                                    label="Password"
                                    v-model="userData.password"
                                    :error-messages="passwordErrors"
                                    name="password"
                                    :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                    @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                    :type="userData.passwordvisible ? 'text' : 'password'"
                                    v-validate="'required|min:8'"
                                    box
                                    required
                                    autocomplete="current-password"
                                    @change="userData.passworderror = ''"
                                    @keyup.enter="doLogin"
                            ></v-text-field>
                            <v-switch
                                    label="Remember login?"
                                    v-model="userData.rememberuser"
                            ></v-switch>
                            <div>
                                <v-btn depressed color="primary" @click="doLogin">Login</v-btn>
                                <v-btn depressed color="secondary" to="createaccount">Create account</v-btn>
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

    import {ApiWrapper} from "../../utilities/api-wrapper";
    import {logStringConsole} from "../../utilities/debugConsole";

    import {LocalStorageData} from "../../store/localStorageData";
    import userState from "../../store/user/index";

    import {Login, LoginCallBack, LoginResponseTypes} from "../../../../cshub-shared/api-calls/index";

    import router, {Routes} from "../router/router";

    @Component({
        name: "LoginScreen",
        inject: ["$validator"]
    })
    export default class LoginScreen extends Vue {

        /**
         * Data
         */
        private userData = {
            email: "",
            emailerror: "",
            password: "",
            passwordvisible: false,
            passworderror: "",
            globalerror: "",
            rememberuser: false
        };

        /**
         * Computed properties
         */
        get passwordErrors(): string {
            let validationErrors = "";
            if (this.errors) { validationErrors = this.errors.collect("password"); }

            const customErrors = this.userData.passworderror;
            return `${validationErrors.toString()}${customErrors}`;
        }

        get emailErrors(): string {
            let validationErrors = "";
            if (this.errors) { validationErrors = this.errors.collect("email"); }

            const customErrors = this.userData.emailerror;
            return `${validationErrors.toString()}${customErrors}`;
        }

        /**
         * Lifecycle hooks
         */
        private mounted() {
            this.userData.email = localStorage.getItem(LocalStorageData.EMAIL);
        }

        /**
         * Methods
         */
        private doLogin()  {
            this.$validator.validateAll()
                .then((allValid: boolean) => {
                    if (allValid) {
                        ApiWrapper.sendPostRequest(new Login(this.userData.email, this.userData.password), (callbackData: LoginCallBack) => {
                            if (callbackData.response === LoginResponseTypes.SUCCESS && callbackData.userModel) {
                                if (this.userData.rememberuser) {
                                    localStorage.setItem(LocalStorageData.EMAIL, this.userData.email);
                                }
                                userState.changeUserModel(callbackData.userModel);
                                router.push(Routes.INDEX);
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
                        });
                    }
                });
        }
    }
</script>

<style scoped>

</style>