<template>
    <v-navigation-drawer
            v-model="drawerComputed"
            fixed
            clipped
            id="cshub-nav"
            app>
        <v-list
                dense>
            <v-layout
                    row
                    align-center>
                <v-flex xs6>
                    <v-subheader>
                        User
                    </v-subheader>
                </v-flex>
            </v-layout>
            <router-link :to="navigationLocations.USERDASHBOARD" v-if="userLoggedInComputed"><NavDrawerItem icon="fas fa-user" text="User dashboard"></NavDrawerItem></router-link>
            <router-link :to="navigationLocations.FAVORITES" v-if="userLoggedInComputed"><NavDrawerItem icon="fas fa-star" text="My favorites"></NavDrawerItem></router-link>
            <router-link :to="navigationLocations.WIPPOSTS"><NavDrawerItem icon="fas fa-pen" text="WIP posts"></NavDrawerItem></router-link>
            <router-link :to="navigationLocations.UNSAVEDPOSTS" v-if="userLoggedInComputed"><NavDrawerItem icon="fas fa-save" text="Unsaved posts"></NavDrawerItem></router-link>
            <router-link :to="navigationLocations.ADMINDASHBOARD" v-if="userLoggedInComputed && userAdminComputed"><NavDrawerItem icon="fas fa-users" text="Admin dashboard"></NavDrawerItem></router-link>
            <router-link :to="navigationLocations.LOGIN" v-if="!userLoggedInComputed"><NavDrawerItem icon="fas fa-sign-in-alt" text="Login"></NavDrawerItem></router-link>
            <a @click="logout"><NavDrawerItem v-if="userLoggedInComputed" icon="fas fa-sign-out-alt" text="Logout"></NavDrawerItem></a>
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
                class="tree"
                activatable
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
                <router-link :to="navigationLocations.POSTCREATE"><NavDrawerItem icon="fas fa-pen" text="Create new post"></NavDrawerItem></router-link>
                <router-link v-if="userAdminComputed" :to="`${navigationLocations.ADMINDASHBOARD}/${adminRoutes.TOPICCREATE}`"><NavDrawerItem icon="fas fa-folder-plus" text="Add a topic"></NavDrawerItem></router-link>
            </div>
        </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts">
    import Vue from "vue";
    import localForage from "localforage";
    import {AxiosError} from "axios";
    import {Route} from "vue-router";

    import {ApiWrapper, logObjectConsole, logStringConsole} from "../../utilities";
    import {CacheTypes} from "../../utilities/cache-types";

    import {ITopic} from "../../../../cshub-shared/src/models";
    import {
        GetTopicsCallBack,
        GetTopics
    } from "../../../../cshub-shared/src/api-calls";
    import {Routes} from "../../../../cshub-shared/src/Routes";

    import NavDrawerItem from "./NavDrawerItem.vue";

    import uiState from "../../store/ui";
    import dataState from "../../store/data";
    import userState from "../../store/user";

    import {AdminRoutes} from "../../views/router/adminRoutes";
    import {Component, Watch} from "vue-property-decorator";

    @Component({
        name: "NavDrawer",
        components: {NavDrawerItem}
    })
    export default class NavDrawer extends Vue {

        /**
         * Data
         */
        private activeTopicHash: number[] = [];
        private topics: ITopic[] = [];
        private navigationLocations = Routes;
        private adminRoutes = AdminRoutes;

        /**
         * Computed properties
         */
        get drawerComputed(): boolean {
            return uiState.drawerState;
        }

        set drawerComputed(newValue: boolean) {
            uiState.setDrawerState(newValue);
        }

        get userLoggedInComputed(): boolean {
            return userState.isLoggedIn;
        }

        get userAdminComputed(): boolean {
            return userState.isAdmin;
        }

        /**
         * Watchers
         */
        @Watch("$route")
        private routeChanged(to: Route, from: Route) {
            if (to.fullPath.includes(Routes.TOPIC)) {
                this.activeTopicHash = [+to.params.hash]; // Perhaps do not use this later on, but doing this through the store
            } else if (to.fullPath === Routes.INDEX) {
                this.activeTopicHash = [0];
            } else {
                this.activeTopicHash = [-1];
            }
        }

        @Watch("activeTopicHash")
        private activeTopicHashChanged(hash: number[]) {
            if (hash.length !== 0 && hash[0] > 0) {
                if (!this.$router.currentRoute.fullPath.includes(Routes.TOPIC) || hash[0] !== +this.$router.currentRoute.params.hash) {
                    this.$router.push(`${Routes.TOPIC}/${hash[0]}`);
                }
            }
        }

        /**
         * Lifecycle hooks
         */
        private mounted() {
            logStringConsole("Git SHA: " + process.env.VUE_APP_VERSION, "NavDrawer.vue");
            logStringConsole("Build Date: " + process.env.VUE_APP_BUILDDATE, "NavDrawer.vue");

            type topicCache = {
                version: number,
                topics: ITopic[]
            };

            localForage.getItem<topicCache>(CacheTypes.TOPICS)
                .then((value: topicCache) => {

                    let currentVersion = -1;

                    if (value !== null) {
                        currentVersion = value.version;
                    }

                    // Sends a get request to the server, and sets the correct store value after receiving the topics in the GetTopicsCallBack
                    ApiWrapper.sendGetRequest(new GetTopics(currentVersion), (callbackData: GetTopicsCallBack) => {

                        if (typeof callbackData.topics !== "undefined") {
                            this.topics = callbackData.topics;
                            dataState.setTopics(callbackData.topics);

                            const topicData: topicCache = {
                                version: callbackData.version,
                                topics: callbackData.topics
                            };

                            localForage.setItem(CacheTypes.TOPICS, topicData)
                                .then(() => {
                                    logStringConsole("Added topics to cache", "NavDrawer");
                                });
                        } else {
                            this.topics = value.topics;
                            dataState.setTopics(value.topics);
                        }

                        if (this.$router.currentRoute.fullPath.includes(Routes.TOPIC)) {
                            this.activeTopicHash = [+this.$router.currentRoute.params.hash];
                        }

                        logObjectConsole(this.topics, "NavDrawer mounted");

                    }, (err: AxiosError) => {

                        logStringConsole("Set topics from cache", "NavDrawer mounted error axios, error:" + err);
                        this.topics = value.topics;
                        dataState.setTopics(value.topics);
                    });
                });
        }

        /**
         * Methods
         */
        private logout() {
            logStringConsole("Logging user out");
            document.cookie = "token=xxx";
            userState.clearUserModel();
            uiState.setDrawerState(false);
            this.$router.push(Routes.INDEX);
        }
    }
</script>

<style scoped>
/* Fixes the treeview leaf alignment (it was too much at 50px) */
.tree >>> .v-treeview-node--leaf {
    margin-left: 20px;
}

.tree >>> .v-treeview-node__toggle {
    display: inline-block;
    position: relative;
    z-index: 1;
    padding: 0.5em 0.5em 0.5em 0.5em;
    margin: -0.5em -0.5em -0.5em -0.5em;
}


.tree >>> .v-treeview-node__root, .v-treeview-node__children {
    padding-left: 16px;
}

@media print {
    #cshub-nav {
        display: none;
    }
}

.theme--light.v-navigation-drawer {
    background-color: #f5f5f5;
}
</style>
