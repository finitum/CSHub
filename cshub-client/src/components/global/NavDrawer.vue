<template>
    <v-navigation-drawer id="cshub-nav" v-model="drawerComputed" fixed clipped app>
        <v-list class="pt-0" dense>
            <v-select v-model="studyNr" :items="studies" hide-details filled label="Study"></v-select>
            <v-subheader>
                User
            </v-subheader>
            <NavDrawerItem
                v-if="userLoggedInComputed"
                :to="navigationLocations.USERDASHBOARD"
                icon="fas fa-user"
                text="User dashboard"
            ></NavDrawerItem>

            <NavDrawerItem :to="navigationLocations.WIPPOSTS" icon="fas fa-pen" text="WIP posts"></NavDrawerItem>

            <NavDrawerItem
                v-if="userLoggedInComputed"
                :to="navigationLocations.UNSAVEDPOSTS"
                icon="fas fa-save"
                text="Unsaved posts"
            ></NavDrawerItem>

            <NavDrawerItem
                v-if="userStudyAdminComputed"
                :to="navigationLocations.UNSAVEDQUESTIONS"
                icon="fas fa-question"
                text="Unsaved questions"
            ></NavDrawerItem>

            <NavDrawerItem
                v-if="userLoggedInComputed && userStudyAdminComputed"
                :to="navigationLocations.ADMINDASHBOARD"
                icon="fas fa-users"
                text="Admin dashboard"
            ></NavDrawerItem>

            <NavDrawerItem
                v-if="!userLoggedInComputed"
                icon="fas fa-sign-in-alt"
                text="Login"
                :to="navigationLocations.LOGIN"
            ></NavDrawerItem>

            <a @click="logout"
                ><NavDrawerItem v-if="userLoggedInComputed" icon="fas fa-sign-out-alt" text="Logout"></NavDrawerItem
            ></a>
            <v-divider dark class="my-3"></v-divider>
            <v-subheader>
                Topics
            </v-subheader>
            <v-treeview
                dense
                :active.sync="activeTopicHash"
                :items="topTopicChildren"
                item-key="hash"
                class="tree"
                activatable
                transition
            >
            </v-treeview>
            <div v-if="userLoggedInComputed">
                <v-divider dark class="my-3"></v-divider>
                <v-subheader>
                    Create
                </v-subheader>

                <NavDrawerItem
                    :to="navigationLocations.POSTCREATE"
                    icon="fas fa-pen"
                    text="Create new post"
                ></NavDrawerItem>
            </div>
        </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from "vue";
import { Route } from "vue-router";

import { ApiWrapper, logStringConsole } from "../../utilities";
import { Routes } from "../../../../cshub-shared/src/Routes";

import NavDrawerItem from "./NavDrawerItem.vue";

import { practiceState, uiState } from "../../store";
import { dataState } from "../../store";
import { userState } from "../../store";

import { Component, Watch } from "vue-property-decorator";
import { LocalStorageData } from "../../store/localStorageData";
import { ITopic } from "../../../../cshub-shared/src/entities/topic";
import { getTopTopic, parseTopTopic } from "../../views/router/guards/setupRequiredDataGuard";
import { EventBus, STUDY_CHANGED } from "../../utilities/EventBus";
import { Logout } from "../../../../cshub-shared/src/api-calls/endpoints/user";

@Component({
    name: "NavDrawer",
    components: { NavDrawerItem }
})
export default class NavDrawer extends Vue {
    /**
     * Data
     */
    private activeTopicHash: number[] = [];

    private navigationLocations = Routes;

    /**
     * Computed properties
     */
    get drawerComputed(): boolean {
        return uiState.navbar.open;
    }

    set drawerComputed(newValue: boolean) {
        uiState.setNavbar({ open: newValue });
    }

    get userLoggedInComputed(): boolean {
        return userState.isLoggedIn;
    }

    get userAdminComputed(): boolean {
        return userState.isAdmin;
    }

    get userStudyAdminComputed(): boolean {
        return userState.isStudyAdmin;
    }

    get studies(): Array<{ text: string; value: number }> {
        if (dataState.studies) {
            return dataState.studies.map(value => {
                return {
                    text: value.name,
                    value: value.id
                };
            });
        } else {
            return [];
        }
    }

    get topTopicChildren(): ITopic[] {
        return dataState.topTopic ? dataState.topTopic.children : [];
    }

    get studyNr(): number | undefined {
        return uiState.studyNr;
    }

    set studyNr(study: number | undefined) {
        if (study) {
            localStorage.setItem(LocalStorageData.STUDY, study.toString(10));
            uiState.setStudyNr(study);

            getTopTopic(study, true).then(topTopic => {
                parseTopTopic(topTopic);
                dataState.setTopics(topTopic);
                EventBus.$emit(STUDY_CHANGED);
            });
        }
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
            if (
                !this.$router.currentRoute.fullPath.includes(Routes.TOPIC) ||
                hash[0] !== +this.$router.currentRoute.params.hash
            ) {
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
    }

    /**
     * Methods
     */
    private logout() {
        logStringConsole("Logging user out");
        ApiWrapper.post(new Logout());
        userState.clearUserModel();
        uiState.setNavbar({ open: false });
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

.tree >>> .v-treeview-node__toggle {
    margin-left: 16px;
    margin-right: 0;
}

.tree >>> .v-treeview-node__label {
    margin-left: 0;
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
