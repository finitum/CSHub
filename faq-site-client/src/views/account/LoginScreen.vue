<template>
    <v-flex shrink>
        <v-card>
            <v-card-title class="title font-weight-regular justify-space-between">
                <span>Login</span>
            </v-card-title>
            <v-card-text>
                <v-text-field
                        label="Email"
                        v-model="userData.email"
                        :error-messages="emailErrors"
                        name="email"
                        v-validate="'required'"
                        required
                        suffix="@student.tudelft.nl"
                        box
                        @change="userData.emailerror = ''"
                        @keyup.enter="doLogin"
                ></v-text-field>
                <v-text-field
                        label="Password"
                        v-model="userData.password"
                        :error-messages="passwordErrors"
                        name="password"
                        :append-icon="userData.passwordvisible ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                        :type="userData.passwordvisible ? 'password' : 'text'"
                        v-validate="'required|min:8'"
                        box
                        required
                        @change="userData.passworderror = ''"
                        @keyup.enter="doLogin"
                ></v-text-field>
                <p v-if=""></p>
                <v-switch
                        label="Remember login?"
                        v-model="userData.rememberuser"
                ></v-switch>
                <div>
                    <v-btn depressed color="primary" @click="doLogin">Login</v-btn>
                    <v-btn depressed color="secondary" to="createaccount">Create account</v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script lang="ts">
    import Vue from "vue";

    import {ApiWrapper} from "../../utilities/api-wrapper";
    import {LogStringConsole} from "../../utilities/debugConsole";

    import {LocalStorageData} from "../../store/localStorageData";

    import {LoginRequest, LoginRequestCallBack, LoginResponses} from "../../../../faq-site-shared/api-calls/index";

    import userState from "../../store/user/index";
    import router, {Routes} from "../router";

    export default Vue.extend({
        name: "LoginScreen",
        data() {
            return {
                userData: {
                    email: "" as string,
                    emailerror: "" as string,
                    password: "" as string,
                    passwordvisible: false as boolean,
                    passworderror: "" as string,
                    globalerror: "" as string,
                    rememberuser: false as boolean
                }
            };
        },
        mounted() {
            this.userData.email = localStorage.getItem(LocalStorageData.EMAIL);
        },
        inject: ["$validator"],
        computed: {
            passwordErrors(): string {
                let validationErrors = "";
                if (this.errors) { validationErrors = this.errors.collect("password"); }

                const customErrors = this.userData.passworderror;
                return `${validationErrors.toString()}${customErrors}`;
            },
            emailErrors(): string {
                let validationErrors = "";
                if (this.errors) { validationErrors = this.errors.collect("email"); }

                const customErrors = this.userData.emailerror;
                return `${validationErrors.toString()}${customErrors}`;
            }
        },
        methods: {
            doLogin()  {
                this.$validator.validateAll()
                    .then((allValid: boolean) => {
                        if (allValid) {
                            ApiWrapper.sendPostRequest(new LoginRequest(this.userData.email, this.userData.password), (callbackData: LoginRequestCallBack) => {
                                if (callbackData.response === LoginResponses.SUCCESS && callbackData.userModel) {
                                    if (this.userData.rememberuser) {
                                        localStorage.setItem(LocalStorageData.EMAIL, this.userData.email);
                                    }
                                    userState.changeUserModel(callbackData.userModel);
                                    router.push(Routes.INDEX);
                                } else if (callbackData.response === LoginResponses.NOEXISTINGACCOUNT) {
                                    LogStringConsole("Account does not exist");
                                    this.userData.emailerror = "Account does not exist.";
                                } else if (callbackData.response === LoginResponses.ACCOUNTNOTVERIFIED) {
                                    LogStringConsole("Account is not verified");
                                    this.userData.emailerror = "Account has not been verified.";
                                } else if (callbackData.response === LoginResponses.ACCOUNTBLOCKED) {
                                    LogStringConsole("Account is blocked");
                                    this.userData.emailerror = "Account has been blocked.";
                                } else if (callbackData.response === LoginResponses.INCORRECTPASS) {
                                    LogStringConsole("Incorrect password was entered");
                                    this.userData.passworderror = "Incorrect password.";
                                } else if (callbackData.response === LoginResponses.INVALIDINPUT) {
                                    LogStringConsole("Invalid input");
                                    this.userData.passworderror = "Invalid input.";
                                    this.userData.emailerror = "Invalid input.";
                                }
                            });
                        }
                    });
            }
        }
    });
</script>

<style scoped>

</style>