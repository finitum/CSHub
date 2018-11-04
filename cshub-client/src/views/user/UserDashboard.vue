<template>
    <div>
        <v-subheader>
            Your profile
        </v-subheader>
        <v-container fluid fill-height class="grey lighten-4">
            <v-layout justify-center align-center>
                <v-flex shrink>
                    <v-form>
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
                                autocomplete=""
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
                                autocomplete="current-password"
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
                                autocomplete="new-password"
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
                                autocomplete="new-password"
                                ref="new password confirmation"
                                @keyup.enter="changePassword"
                        ></v-text-field>
                        <v-btn color="primary" depressed dark @click="changePassword">Change password</v-btn>
                    </v-form>
                </v-flex>
            </v-layout>
        </v-container>

        <v-subheader>
            Your posts
        </v-subheader>

        <div v-for="postHash in postHashes" :key="postHash.index">
            <Post :postHash="postHash" :key="postHash"></Post>
        </div>
        <h2 v-if="postHashes.length === 0" style="text-align: center; width: 100%">No posts found!</h2>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    import Post from "../../components/posts/Post.vue";

    import {ApiWrapper, logObjectConsole, logStringConsole} from "../../utilities";
    import {
        GetUserPostsCallback,
        ChangeUserPasswordCallback,
        ChangeUserPassword,
        ChangeUserPasswordReponseTypes,
        GetUserPosts
    } from "../../../../cshub-shared/api-calls/pages/user";
    import userState from "../../store/user";
    import {IUser} from "../../../../cshub-shared/models";

    export default Vue.extend({
        name: "UserDashboard",
        data() {
            return {
                postHashes: [] as number[],
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
                ApiWrapper.sendPostRequest(new GetUserPosts(startIndex), (callbackData: GetUserPostsCallback) => {
                    this.postHashes = callbackData.postHashes;
                    logObjectConsole(callbackData.postHashes, "User dashboard posthashes");
                });
            },
            changePassword() {
                ApiWrapper.sendPostRequest(new ChangeUserPassword(this.userData.currentPassword, this.userData.newPassword), (callBack: ChangeUserPasswordCallback) => {
                    if (callBack.response === ChangeUserPasswordReponseTypes.SUCCESS) {
                        // TODO: If the dialog wrapper works, show a success dialog
                        logStringConsole("User changed password");
                    } else if (callBack.response === ChangeUserPasswordReponseTypes.WRONGPASSWORD) {
                        logStringConsole("Wrong password was entered so password not changed");
                        this.userData.currentPasswordError = "Wrong password!";
                    } else if (callBack.response === ChangeUserPasswordReponseTypes.INVALIDINPUT) {
                        logStringConsole("Invalid input at password change");
                        this.userData.currentPasswordError = "Wrong input!";
                    }
                });
            }
        }
    });
</script>

<style scoped>

</style>
