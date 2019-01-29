<template>
    <v-toolbar color="primary" app fixed clipped-left id="cshub-toolbar">
        <v-toolbar-side-icon @click.native="drawerComputed = !drawerComputed"></v-toolbar-side-icon>
        <router-link to="/" style="color: inherit">
            <div class="title ml-3 mr-5">
                CS&nbsp;<span class="font-weight-light">Hub</span>
            </div>
        </router-link>

        <v-text-field
                v-model="searchQuery"
                solo-inverted
                flat
                hide-details
                label="Search"
                prepend-inner-icon="fas fa-search"
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-toolbar-items>
            <v-btn depressed small color="primary" @click="showVersionDialog"><v-icon color="white">fas fa-code-branch</v-icon></v-btn>
        </v-toolbar-items>
    </v-toolbar>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Watch} from "vue-property-decorator";

    import {Routes} from "../../../../cshub-shared/src/Routes";

    import uiState from "../../store/ui/index";
    import dataState from "../../store/data";

    import router from "../../views/router/router";

    @Component({
        name: "Toolbar"
    })
    export default class Toolbar extends Vue {

        /**
         * Data
         */

        // Build information
        private shortVersionString = "SHA: " + process.env.VUE_APP_VERSION.substr(0, 7);
        private fullGitSHA = process.env.VUE_APP_VERSION;
        private githubLink = "https://github.com/RobbinBaauw/CSHub/commit/" + this.fullGitSHA;
        private buildDate = "Build Date: " + process.env.VUE_APP_BUILDDATE;


        /**
         * Computed properties
         */
        get drawerComputed(): boolean {
            return uiState.drawerState;
        }

        set drawerComputed(newValue: boolean) {
            uiState.setDrawerState(newValue);
        }

        get searchQuery(): string {
            return dataState.searchQuery;
        }

        set searchQuery(newValue: string) {
            dataState.setSearchQuery(newValue);
        }

        /**
         * Methods
         */
        private routeHome() {
            router.push(Routes.INDEX);
        }

        private showVersionDialog() {
            uiState.setNotificationDialogState({
                text: `${this.shortVersionString}\n${this.buildDate}`,
                header: "Build version",
                on: true,
                button: {
                    text: "Go to github",
                    jsAction: () => {
                        window.open(this.githubLink, "_blank");
                    }
                }
            });
        }

        /**
         * Watchers
         */
        @Watch("searchQuery")
        private searchQueryChanged() {
            if (this.searchQuery.length >= 3) {
                if (this.$route.fullPath !== Routes.SEARCH) {
                    this.$router.push(Routes.SEARCH);
                }
            }
        }

    }
</script>

<style scoped>

    @media print {
        #cshub-toolbar {
            display: none;
        }
    }
</style>