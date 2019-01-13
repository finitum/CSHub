<template>
    <div>
        <v-subheader>
            Your posts
        </v-subheader>

        <PostList :postHashesProp="postHashes"></PostList>

        <v-subheader>
            Your profile
        </v-subheader>
        <v-container fluid fill-height class="grey lighten-4">
            <v-layout justify-center align-center>
                <v-flex shrink>
                    <v-form>
                        <v-card class="ma-2">
                            <v-card-text>
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
                            </v-card-text>
                        </v-card>
                        <v-card class="ma-2">
                            <v-card-text>
                                <v-text-field
                                        label="Current password"
                                        v-model="userData.currentPassword"
                                        :error-messages="errors.collect('current password') + userData.currentPasswordError"
                                        name="current password"
                                        :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
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
                                        :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
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
                                        :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
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
                            </v-card-text>
                        </v-card>
                        <v-card class="ma-2">
                            <v-card-text>
                                <img :src="imageBase64" height="150" v-if="imageBase64"/>
                                <v-text-field label="Select Image" v-model="imageName" @click='pickFile' prepend-icon='fas fa-paperclip' hint="It might be that others don't see your avatar being updated, that's because it's cached and avatars aren't really that important..." persistent-hint></v-text-field>
                                <input
                                        type="file"
                                        style="display: none"
                                        ref="image"
                                        accept="image/*"
                                        @change="onFilePicked"
                                >
                                <v-btn color="primary" class="mt-3" depressed dark @click="changeAvatar">Change avatar</v-btn>
                            </v-card-text>
                        </v-card>
                    </v-form>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component} from "vue-property-decorator";
    import localForage from "localforage";

    import PostList from "../../components/posts/PostList.vue";

    import userState from "../../store/user";

    import {ApiWrapper, logObjectConsole, logStringConsole} from "../../utilities";
    import {
        ChangeUserPassword,
        ChangeUserPasswordCallback,
        ChangeUserPasswordReponseTypes,
        GetUserPosts,
        GetUserPostsCallback
    } from "../../../../cshub-shared/src/api-calls/pages/user";
    import {IPost, IUser} from "../../../../cshub-shared/src/models";
    import {
        ChangeUserAvatar,
        ChangeUserAvatarCallback,
        ChangeUserAvatarReponseTypes
    } from "../../../../cshub-shared/src/api-calls/pages/user/ChangeUserAvatar";
    import {Routes} from "../../../../cshub-shared/src/Routes";
    import uiState from "../../store/ui";

    @Component({
        name: "UserDashboard",
        inject: ["$validator"],
        components: {PostList},
    })
    export default class UserDashboard extends Vue {

        /**
         * Data
         */
        private postHashes: number[] = [];
        private userData = {
            currentPassword: "",
            currentPasswordError: "",
            newPassword: "",
            confirmNewPassword: "",
            passwordvisible: false,
        };
        private imageBase64 = "";
        private imageName = "";

        /**
         * Computed properties
         */
        get userDataComputed(): IUser {
            return userState.userModel;
        }

        /**
         * Lifecycle hooks
         */
        private mounted() {
            this.getHashes();
        }

        /**
         * Methods
         */
        private pickFile() {
            (this.$refs.image as any).click();
        }

        private onFilePicked(e: Event) {
            const files: FileList = (e.target as any).files;

            if (files[0] !== undefined) {
                this.imageName = files[0].name;
                const fr = new FileReader();
                fr.readAsDataURL(files[0]);
                fr.addEventListener("load", () => {
                    this.imageBase64 = fr.result.toString();
                });
            } else {
                this.imageName = "";
                this.imageBase64 = null;
            }
        }

        private getHashes() {
            ApiWrapper.sendPostRequest(new GetUserPosts(), (callbackData: GetUserPostsCallback) => {
                this.postHashes = callbackData.postHashes;
                logObjectConsole(callbackData.postHashes, "User dashboard posthashes");
            });
        }

        private changeAvatar() {
            ApiWrapper.sendPostRequest(new ChangeUserAvatar(this.imageBase64), (callback: ChangeUserAvatarCallback) => {
                if (callback.response === ChangeUserAvatarReponseTypes.SUCCESS) {
                    logStringConsole("User changed avatar");
                    localForage.keys()
                        .then((keys: string[]) => {
                            for (const key of keys) {
                                if (key.slice(0, 5) === "POST_") {
                                    localForage.getItem<IPost>(key)
                                        .then((post: IPost) => {
                                            if (post.author.id === userState.userModel.id) {
                                                post.author.avatar = callback.newAvatar;
                                                localForage.setItem<IPost>(key, post);
                                            }
                                        });
                                }
                            }
                        })
                        .then(() => {
                            uiState.setNotificationDialogState({
                                on: true,
                                header: "Avatar changed",
                                text: "Your avatar has been changed, refresh the page to see your avatar update"
                            });
                        });
                } else if (callback.response === ChangeUserAvatarReponseTypes.INVALIDIMAGE) {
                    // Perhaps do something
                }
            });
        }

        private changePassword() {
            ApiWrapper.sendPostRequest(new ChangeUserPassword(this.userData.currentPassword, this.userData.newPassword), (callBack: ChangeUserPasswordCallback) => {
                if (callBack.response === ChangeUserPasswordReponseTypes.SUCCESS) {
                    uiState.setNotificationDialogState({
                        on: true,
                        header: "Changed password",
                        text: "Your password has been changed successfully"
                    });
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
</script>

<style scoped>

</style>
