<template>
    <v-flex shrink>
        <v-card>
            <v-card-title class="title font-weight-regular justify-space-between">
                <span>Create account</span>
            </v-card-title>
            <v-card-text>
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
                        @keyup.enter="doLogin"
                ></v-text-field>
                <v-text-field
                        label="Password"
                        v-model="userData.password"
                        :error-messages="errors.collect('password')"
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
                <v-text-field
                        label="First name"
                        v-model="userData.fistname"
                        :error-messages="errors.collect('firstname')"
                        name="firstname"
                        v-validate="'required'"
                        required
                        box
                ></v-text-field>
                <v-text-field
                        label="Last name"
                        v-model="userData.lastname"
                        :error-messages="errors.collect('lastname')"
                        name="lastname"
                        v-validate="'required'"
                        required
                        box
                ></v-text-field>
                <div>
                    <v-btn depressed color="primary" @click="doCreateAccount">Create account</v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script lang="ts">
    import Vue from "vue";

    import {emailValidator, ApiWrapper, LogStringConsole} from "../../plugins/index";

    import {
        CreateAccountRequest,
        CreateAccountRequestCallBack,
        CreateAccountResponses
    } from "../../../../faq-site-shared/api-calls/index";

    import router, {Routes} from "../router";

    export default Vue.extend({
        name: "CreateAccount",
        data() {
            return {
                userData: {
                    email: "" as string,
                    emailerror: "" as string,
                    password: "" as string,
                    passwordvisible: false as boolean,
                    fistname: "" as string,
                    lastname: "" as string
                }
            };
        },
        mounted() {
            this.$validator.extend("checkTUEmail", emailValidator);
        },
        inject: ["$validator"],
        methods: {
            doCreateAccount() {
                this.$validator.validateAll()
                    .then((allValid: boolean) => {
                        if (allValid) {
                            ApiWrapper.sendPostRequest(new CreateAccountRequest(this.userData.email, this.userData.password, this.userData.fistname, this.userData.lastname), (callbackData: CreateAccountRequestCallBack) => {
                                if (callbackData.response === CreateAccountResponses.SUCCESS) {
                                    router.push(Routes.LOGIN);
                                } else if (callbackData.response === CreateAccountResponses.ALREADYEXISTS) {
                                    LogStringConsole("Account already exists");
                                    this.userData.emailerror = "Account already exists.";
                                } else if (callbackData.response === CreateAccountResponses.INVALIDINPUT) {
                                    LogStringConsole("Invalid input");
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