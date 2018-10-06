<template>
    <v-card>
        <v-card-title class="title font-weight-regular justify-space-between">
            <span>Login</span>
        </v-card-title>
        <v-card-text>
            <v-text-field
                    label="Email"
                    v-model="userData.username"
                    :error-messages="errors.collect('email')"
                    name="email"
                    v-validate="'required'"
                    required
                    @keyup.enter="doLogin"
            ></v-text-field>
            <v-text-field
                    label="Password"
                    v-model="userData.password"
                    :error-messages="errors.collect('password')"
                    name="password"
                    :append-icon="userData.passwordvisible ? 'visibility' : 'visibility_off'"
                    @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                    :type="userData.passwordvisible ? 'password' : 'text'"
                    v-validate="'required'"
                    counter
                    required
                    @keyup.enter="doLogin"
            ></v-text-field>
            <v-switch
                    label="Remember login?"
                    v-model="userData.rememberuser"
            ></v-switch>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import {ApiWrapper} from "../plugins/api/api-wrapper";
    import {LoginRequest, LoginRequestCallBack} from "../../../faq-site-shared/socket-calls/auth/LoginRequest";
    import {AuthResponses} from "../../../faq-site-shared/socket-calls/auth/AuthResponses";
    import userState from "../store/user";

    export default {
        name: "LoginScreen",
        data: () => {
            return {
                userData: {
                    username: "",
                    password: "",
                    passwordvisible: false,
                    rememberuser: false
                }
            }
        },
        methods: {
            doLogin: () => {
                ApiWrapper.sendPostRequest(new LoginRequest("df", "hoidfdfdfddfdfdfd"), (callbackData: LoginRequestCallBack) => {
                    if (callbackData.response === AuthResponses.SUCCESS && callbackData.userModel) {
                        userState.changeUserModel(callbackData.userModel);
                    }
                    console.log(callbackData.response === AuthResponses.SUCCESS);
                    console.log(callbackData);
                });
            }
        }
    }
</script>

<style scoped>

</style>