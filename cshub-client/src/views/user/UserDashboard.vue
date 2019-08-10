<template>
    <div>
        <v-subheader>
            Your posts
        </v-subheader>

        <PostList v-if="postHashes.length > 0" :post-hashes-prop="postHashes"></PostList>
        <h2 v-else style="text-align: center; width: 100%">No posts found!</h2>

        <v-subheader>
            Your profile
        </v-subheader>
        <v-container fluid fill-height>
            <v-layout justify-center align-center>
                <v-flex shrink>
                    <v-form>
                        <v-card class="ma-2">
                            <v-card-text>
                                <v-text-field
                                    v-model="userDataComputed.email"
                                    label="Email"
                                    suffix="@student.tudelft.nl"
                                    filled
                                    autocomplete=""
                                    disabled
                                ></v-text-field>
                                <v-text-field
                                    v-model="userDataComputed.firstname"
                                    label="First name"
                                    filled
                                    autocomplete=""
                                    disabled
                                ></v-text-field>
                                <v-text-field
                                    v-model="userDataComputed.lastname"
                                    label="Last name"
                                    filled
                                    autocomplete=""
                                    disabled
                                ></v-text-field>
                            </v-card-text>
                        </v-card>
                        <v-card class="ma-2">
                            <v-card-text>
                                <v-text-field
                                    v-model="userData.currentPassword"
                                    v-validate="'required|min:8'"
                                    label="Current password"
                                    :error-messages="errors.collect('current password') + userData.currentPasswordError"
                                    name="current password"
                                    :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                    :type="userData.passwordvisible ? 'text' : 'password'"
                                    filled
                                    required
                                    autocomplete="current-password"
                                    @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                    @change="userData.currentPasswordError = ''"
                                    @keyup.enter="changePassword"
                                ></v-text-field>
                                <v-text-field
                                    v-model="userData.newPassword"
                                    v-validate="'required|min:8|confirmed:new password confirmation'"
                                    label="New password"
                                    :error-messages="errors.collect('new password')"
                                    name="new password"
                                    :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                    :type="userData.passwordvisible ? 'text' : 'password'"
                                    filled
                                    autocomplete="new-password"
                                    required
                                    @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                    @keyup.enter="changePassword"
                                ></v-text-field>
                                <v-text-field
                                    ref="new password confirmation"
                                    v-model="userData.confirmNewPassword"
                                    v-validate="'required|min:8'"
                                    label="Confirm new password"
                                    :error-messages="errors.collect('new password confirmation')"
                                    name="new password confirmation"
                                    :append-icon="userData.passwordvisible ? 'fa-eye-slash' : 'fas fa-eye'"
                                    :type="userData.passwordvisible ? 'text' : 'password'"
                                    filled
                                    required
                                    autocomplete="new-password"
                                    @click:append="() => (userData.passwordvisible = !userData.passwordvisible)"
                                    @keyup.enter="changePassword"
                                ></v-text-field>
                                <v-btn color="primary" depressed dark @click="changePassword">Change password</v-btn>
                            </v-card-text>
                        </v-card>
                        <v-card class="ma-2">
                            <v-card-text>
                                <img v-if="imageBase64" :src="imageBase64" height="150" />
                                <v-text-field
                                    v-model="imageName"
                                    label="Select Image"
                                    prepend-icon="fas fa-paperclip"
                                    hint="It might be that others don't see your avatar being updated, that's because it's cached and avatars aren't really that important..."
                                    persistent-hint
                                    @click="pickFile"
                                ></v-text-field>
                                <input
                                    ref="image"
                                    type="file"
                                    style="display: none"
                                    accept="image/*"
                                    @change="onFilePicked"
                                />
                                <v-btn color="primary" class="mt-3" depressed dark @click="changeAvatar"
                                    >Change avatar</v-btn
                                >
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
import { Component } from "vue-property-decorator";
import localForage from "localforage";

import PostList from "../../components/posts/PostList.vue";

import { userState } from "../../store";

import { ApiWrapper, logObjectConsole, logStringConsole } from "../../utilities";
import {
    ChangePassword,
    ChangePasswordCallback,
    ChangePasswordResponseTypes,
    Dashboard,
    DashboardCallback
} from "../../../../cshub-shared/src/api-calls";
import { ChangeAvatar, ChangeAvatarCallback } from "../../../../cshub-shared/src/api-calls";
import { uiState } from "../../store";
import { IPost } from "../../../../cshub-shared/src/entities/post";
import { IUser } from "../../../../cshub-shared/src/entities/user";

@Component({
    name: "UserDashboard",
    inject: ["$validator"],
    components: { PostList }
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
        passwordvisible: false
    };
    private imageBase64 = "";
    private imageName = "";

    /**
     * Computed properties
     */
    get userDataComputed(): IUser | null {
        return userState.userModel;
    }

    /**
     * Lifecycle hooks
     */
    private mounted() {
        this.getHashes();
    }

    public metaInfo(): any {
        return {
            title: "User - CSHub"
        };
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
                const result = fr.result;
                if (result) {
                    this.imageBase64 = result.toString();
                }
            });
        } else {
            this.imageName = "";
            this.imageBase64 = "";
        }
    }

    private getHashes() {
        ApiWrapper.sendGetRequest(new Dashboard(), (callbackData: DashboardCallback) => {
            this.postHashes = callbackData.postHashes;
            logObjectConsole(callbackData.postHashes, "User dashboard posthashes");
        });
    }

    private changeAvatar() {
        ApiWrapper.sendPostRequest(new ChangeAvatar(this.imageBase64), (callback: ChangeAvatarCallback) => {
            if (callback.response) {
                logStringConsole("User changed avatar");
                localForage
                    .keys()
                    .then((keys: string[]) => {
                        for (const key of keys) {
                            if (key.slice(0, 5) === "POST_") {
                                localForage.getItem<IPost>(key).then((post: IPost) => {
                                    if (
                                        userState.userModel &&
                                        post.author.id === userState.userModel.id &&
                                        callback.response
                                    ) {
                                        post.author.avatar = callback.response;
                                        localForage.setItem<IPost>(key, post);
                                    }
                                });
                            }
                        }
                    })
                    .then(() => {
                        uiState.setNotificationDialog({
                            on: true,
                            header: "Avatar changed",
                            text: "Your avatar has been changed, refresh the page to see your avatar update"
                        });
                    });
            }
        });
    }

    private changePassword() {
        ApiWrapper.sendPostRequest(
            new ChangePassword(this.userData.currentPassword, this.userData.newPassword),
            (callBack: ChangePasswordCallback) => {
                if (callBack.response === ChangePasswordResponseTypes.SUCCESS) {
                    uiState.setNotificationDialog({
                        on: true,
                        header: "Changed password",
                        text: "Your password has been changed successfully"
                    });
                    logStringConsole("User changed password");
                } else if (callBack.response === ChangePasswordResponseTypes.WRONGPASSWORD) {
                    logStringConsole("Wrong password was entered so password not changed");
                    this.userData.currentPasswordError = "Wrong password!";
                } else if (callBack.response === ChangePasswordResponseTypes.INVALIDINPUT) {
                    logStringConsole("Invalid input at password change");
                    this.userData.currentPasswordError = "Wrong input!";
                }
            }
        );
    }
}
</script>

<style scoped></style>
