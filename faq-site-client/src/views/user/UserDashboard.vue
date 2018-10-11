<template>
    <div>
        <div v-show="currentPostHash === -1">
            <v-subheader>
                Your profile
            </v-subheader>
            <v-container fluid fill-height class="grey lighten-4">
                <v-layout justify-center align-center>
                    <v-flex shrink>
                        <v-text-field
                                label="Email"
                                v-model="userDataComputed.email"
                                suffix="@student.tudelft.nl"
                                box
                                disabled
                        ></v-text-field>
                        <v-text-field
                                label="First name"
                                v-model="userDataComputed.firstname"
                                box
                                disabled
                        ></v-text-field>
                        <v-text-field
                                label="Last name"
                                v-model="userDataComputed.lastname"
                                box
                                disabled
                        ></v-text-field>
                        <v-text-field
                                label="Current password"
                                v-model="userData.currentPassword"
                                :error-messages="errors.collect('current password') + userData.currentPasswordError"
                                name="current password"
                                :append-icon="userData.passwordvisible ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                :type="userData.passwordvisible ? 'text' : 'password'"
                                v-validate="'required|min:8'"
                                box
                                required
                                @change="userData.currentPasswordError = ''"
                                @keyup.enter="changePassword"
                        ></v-text-field>
                        <v-text-field
                                label="New password"
                                v-model="userData.newPassword"
                                :error-messages="errors.collect('new password')"
                                name="new password"
                                :append-icon="userData.passwordvisible ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                :type="userData.passwordvisible ? 'text' : 'password'"
                                v-validate="'required|min:8|confirmed:new password confirmation'"
                                box
                                required
                                @keyup.enter="changePassword"
                        ></v-text-field>
                        <v-text-field
                                label="Confirm new password"
                                v-model="userData.confirmNewPassword"
                                :error-messages="errors.collect('new password confirmation')"
                                name="new password confirmation"
                                :append-icon="userData.passwordvisible ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                :type="userData.passwordvisible ? 'text' : 'password'"
                                v-validate="'required|min:8'"
                                box
                                required
                                ref="new password confirmation"
                                @keyup.enter="changePassword"
                        ></v-text-field>
                        <v-btn color="primary" depressed dark @click="changePassword">Change password</v-btn>
                    </v-flex>
                </v-layout>
            </v-container>

            <v-subheader>
                Your posts
            </v-subheader>
        </div>

        <div v-for="postHash in postHashes" :key="postHash.index">
            <Post :postHash="postHash" @toggleFullPost="toggleFullPost" :isFullPost="currentPostHash !== -1" v-if="currentPostHash !== -1 && postHash === currentPostHash || currentPostHash === -1"></Post>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    import Post from "../../components/posts/Post.vue";

    import {ApiWrapper, LogObjectConsole, LogStringConsole} from "../../utilities";
    import {
        UserDashboardCallBack,
        UserDashboardChangePasswordCallBack,
        UserDashboardChangePasswordRequest,
        UserDashboardChangePasswordResponses,
        UserDashboardRequest
    } from "../../../../faq-site-shared/api-calls/pages/user";
    import userState from "../../store/user";
    import {IUser} from "../../../../faq-site-shared/models";

    export default Vue.extend({
        name: "UserDashboard",
        data() {
            return {
                postHashes: [] as number[],
                currentPostHash: -1 as number,
                userData: {
                    currentPassword: "" as string,
                    currentPasswordError: "" as string,
                    newPassword: "" as string,
                    confirmNewPassword: "" as string,
                    passwordvisible: false as boolean
                }
            };
        },
        components: {Post},
        mounted() {
            this.getHashes(0);
        },
        inject: ["$validator"],
        computed: {
            userDataComputed(): IUser {
                return userState.userModel;
            }
        },
        methods: {
            getHashes(startIndex: number) {
                ApiWrapper.sendPostRequest(new UserDashboardRequest(startIndex), (callbackData: UserDashboardCallBack) => {
                    this.postHashes = callbackData.postHashes;
                    LogObjectConsole(callbackData.postHashes, "User dashboard posthashes");
                });
            },
            toggleFullPost(postHash: number) {
                if (postHash !== null) {
                    this.currentPostHash = postHash;
                } else {
                    this.currentPostHash = -1;
                }
            },
            changePassword() {
                ApiWrapper.sendPostRequest(new UserDashboardChangePasswordRequest(this.userData.currentPassword, this.userData.newPassword), (callBack: UserDashboardChangePasswordCallBack) => {
                    if (callBack.response === UserDashboardChangePasswordResponses.SUCCESS) {
                        // TODO: If the dialog wrapper works, show a success dialog
                        LogStringConsole("User changed password");
                    } else if (callBack.response === UserDashboardChangePasswordResponses.WRONGPASSWORD) {
                        LogStringConsole("Wrong password was entered so password not changed");
                        this.userData.currentPasswordError = "Wrong password!";
                    } else if (callBack.response === UserDashboardChangePasswordResponses.INVALIDINPUT) {
                        LogStringConsole("Invalid input at password change");
                        this.userData.currentPasswordError = "Wrong input!";
                    }
                });
            }
        }
    });
</script>

<style scoped>

</style>
