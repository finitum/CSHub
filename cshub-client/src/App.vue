<template>
    <v-app id="app">
        <v-dialog
                v-model="dialogOpen"
                max-width="400"
                persistent
        >
            <v-card>
                <v-card-title class="headline">Welcome!</v-card-title>

                <v-card-text>
                    This is a site which is work in progress. Right now it is an alpha version, so expect bugs, missing features and a lot more shortcomings.
                    <br><br>
                    The goal of this site is to create a platform where everyone can post summaries, code examples and much, much more.
                    <br><br>
                    For now, you can create posts which must be verified by admins. So create an account (your password will be secure, if you don't trust us, the code is open source, generate a new one), and help everybody by posting your own posts.
                    <br><br>
                    Contributing is possible on <a href="https://github.com/RobbinBaauw/CSHub">GitHub</a>, you can either open requests or actually help building this project.
                    <br><br>
                    <h3>More to come!</h3>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                        color="green darken-1"
                        flat="flat"
                        @click="closeDialog"
                    >
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <NavDrawer></NavDrawer>
        <Toolbar></Toolbar>
        <v-content class="grey lighten-4">
            <transition
                    name="componentChange"
                    :enter-active-class="activeclass"
            >
                <router-view></router-view>
            </transition>
        </v-content>
    </v-app>
</template>

<script lang="ts">
    import {Route} from "vue-router";

    import NavDrawer from "./components/global/NavDrawer.vue";
    import Toolbar from "./components/global/Toolbar.vue";

    import Vue from "vue";
    import uiState from "./store/ui";
    import {Routes} from "./views/router/router";
    import {LocalStorageData} from "./store/localStorageData";

    export default Vue.extend({
        name: "App",
        components: {NavDrawer, Toolbar},
        computed: {
            drawerComputed: {
                get(): boolean {
                    return uiState.drawerState;
                },
                set(newValue: boolean) {
                    uiState.setDrawerState(newValue);
                }
            }
        },
        data() {
            return {
                drawerActive: true as boolean,
                activeclass: "animated fadeInLeft" as string,
                dialogOpen: false
            };
        },
        mounted() {
            if (localStorage.getItem(LocalStorageData.DIALOGOPENED) !== "true") {
                this.dialogOpen = true;
            }
        },
        methods: {
            closeDialog() {
                this.dialogOpen = false;
                localStorage.setItem(LocalStorageData.DIALOGOPENED, "true");
            }
        },
        watch: {
            $route(to: Route, from: Route) {
                if (from.fullPath === Routes.INDEX && to.name === "post") {
                    this.activeclass = "";
                } else if (to.fullPath === Routes.INDEX && from.name === "post") {
                    this.activeclass = "";
                } else {
                    this.activeclass = "animated fadeInLeft";
                }
            }
        }
    });
</script>
<style>
    #app {
        background: white;
    }

    a {
        text-decoration: none !important;
    }

    .componentChange-leave-active {
        opacity: 0;
    }

    ::-webkit-scrollbar {
        width: 10px;
    }
    ::-webkit-scrollbar-track {
        background-color: #ebebeb;
        -webkit-border-radius: 10px;
        border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
        -webkit-border-radius: 10px;
        border-radius: 10px;
        background: #6d6d6d;
    }
</style>
