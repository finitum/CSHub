<template>
    <v-navigation-drawer
            v-model="drawerComputed"
            fixed
            clipped
            class="grey lighten-4"
            app>
        <v-list
                dense
                class="grey lighten-4">

            <v-layout
                    row
                    align-center>
                <v-flex xs6>
                    <v-subheader>
                        User
                    </v-subheader>
                </v-flex>
            </v-layout>
            <router-link :to="navigationLocations.USERDASHBOARD" v-if="userLoggedInComputed"><NavDrawerItem icon="mdi-account" text="User dashboard"></NavDrawerItem></router-link>
            <router-link :to="navigationLocations.ADMINDASHBOARD" v-if="userLoggedInComputed && userAdminComputed"><NavDrawerItem icon="mdi-account-supervisor" text="Admin dashboard"></NavDrawerItem></router-link>
            <router-link :to="navigationLocations.LOGIN" v-if="!userLoggedInComputed"><NavDrawerItem icon="mdi-login" text="Login"></NavDrawerItem></router-link>
            <v-divider dark class="my-3"></v-divider>
            <v-layout
                    row
                    align-center>
                <v-flex xs6>
                    <v-subheader>
                        Topics
                    </v-subheader>
                </v-flex>
            </v-layout>
            <v-treeview
                :active.sync="activeTopicHash"
                :items="topics"
                item-key="hash"
                activatable
                active-class="primary--text"
                transition>
            </v-treeview>
            <div v-if="userLoggedInComputed">
                <v-divider dark class="my-3"></v-divider>
                <v-layout
                        row
                        align-center>
                    <v-flex xs6>
                        <v-subheader>
                            Create
                        </v-subheader>
                    </v-flex>
                </v-layout>
                <router-link :to="navigationLocations.POSTCREATE"><NavDrawerItem icon="mdi-pencil" text="Create new post"></NavDrawerItem></router-link>
                <router-link v-if="userAdminComputed" :to="`${navigationLocations.ADMINDASHBOARD}/${adminRoutes.TOPICCREATE}`"><NavDrawerItem icon="mdi-folder-plus" text="Add a topic"></NavDrawerItem></router-link>
            </div>
        </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts">
    import Vue from "vue";
    import localForage from "localforage";

    import {ITopic, IUser} from "../../../../cshub-shared/models";
    import {ApiWrapper, LogObjectConsole, LogStringConsole} from "../../utilities";
    import {
        TopicsCallBack,
        TopicsRequest} from "../../../../cshub-shared/api-calls";

    import NavDrawerItem from "./NavDrawerItem.vue";

    import uiState from "../../store/ui";
    import dataState from "../../store/data";
    import userState from "../../store/user";

    import {Routes} from "../../views/router/router";
    import {Route} from "vue-router";
    import {AdminRoutes} from "../../views/router/adminRoutes";
    import {CacheTypes} from "../../utilities/cache-types";

    export default Vue.extend({
        name: "NavDrawer",
        components: {NavDrawerItem},
        data() {
            return {
                activeTopicHash: [],
                topics: [] as ITopic[],
                items: [],
                navigationLocations: Routes,
                adminRoutes: AdminRoutes
            };
        },
        computed: {
            drawerComputed: {
                get(): boolean {
                    return uiState.drawerState;
                },
                set(newValue: boolean) {
                    uiState.setDrawerState(newValue);
                }
            },
            userLoggedInComputed: {
                get(): boolean {
                    return userState.isLoggedIn;
                }
            },
            userAdminComputed: {
                get(): boolean {
                    return userState.isAdmin;
                }
            }
        },
        watch: {
            $route(to: Route, from: Route) {
                if (to.fullPath.includes(Routes.TOPIC)) {
                    this.activeTopicHash = [+to.params.hash]; // Perhaps do not use this later on, but doing this through the store
                } else if (to.fullPath === Routes.INDEX) {
                    this.activeTopicHash = [0];
                } else {
                    this.activeTopicHash = [-1];
                }
            },
            activeTopicHash(hash: number[]) {
                if (hash.length !== 0 && hash[0] > 0) {
                    if (!this.$router.currentRoute.fullPath.includes(Routes.TOPIC) || hash[0] !== +this.$router.currentRoute.params.hash) {
                        this.$router.push(`${Routes.TOPIC}/${hash[0]}`);
                    }
                }
            }
        },
        mounted() {
            type topicCache = {
                version: number,
                topics: ITopic[]
            };

            localForage.getItem(CacheTypes.TOPICS)
                // The compiler is unaware of localForage it seems, so:
                // @ts-ignore
                .then((value: topicCache) => {

                    let currentVersion = -1;

                    if (value !== null) {
                        currentVersion = value.version;
                    }

                    // Sends a get request to the server, and sets the correct store value after receiving the topics in the TopicsCallBack
                    ApiWrapper.sendPostRequest(new TopicsRequest(currentVersion), (callbackData: TopicsCallBack) => {

                        if (callbackData.topics !== undefined) {
                            this.topics = callbackData.topics;
                            dataState.setTopics(callbackData.topics);

                            const topicData: topicCache = {
                                version: callbackData.version,
                                topics: callbackData.topics
                            };

                            localForage.setItem(CacheTypes.TOPICS, topicData)
                                .then(() => {
                                    LogStringConsole("Added topics to cache", "NavDrawer");
                                });
                        }

                        if (this.$router.currentRoute.fullPath.includes(Routes.TOPIC)) {
                            this.activeTopicHash = [this.$router.currentRoute.params.hash];
                        }

                        LogObjectConsole(callbackData.topics, "NavDrawer mounted");

                    });
                });
        }
    });
</script>

<style scoped>
</style>