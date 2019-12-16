<template>
    <v-app-bar id="cshub-toolbar" :color="toolbarColor" app fixed clipped-left>
        <v-app-bar-nav-icon @click.native="drawerComputed = !drawerComputed"></v-app-bar-nav-icon>
        <v-toolbar-title>
            <router-link to="/" style="color: inherit">
                <div v-if="darkMode" class="title ml-0" :class="{ 'mr-5': $vuetify.breakpoint.mdAndUp }">
                    <v-img style="width: 80px" src="/assets/logo.jpg"></v-img>
                </div>
                <div v-else class="title ml-0" :class="{ 'mr-5': $vuetify.breakpoint.mdAndUp }">
                    CS&nbsp;<span class="font-weight-light">Hub</span>
                </div>
            </router-link>
        </v-toolbar-title>

        <v-text-field
            v-if="$vuetify.breakpoint.mdAndUp"
            v-model="searchQuery"
            solo-inverted
            text
            hide-details
            label="Search"
            prepend-inner-icon="fas fa-search"
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-toolbar-items>
            <template v-if="!onExamQuestion && showExamWarning">
                <v-btn tile depressed small color="primary" @click="backToQuestions">
                    You're practicing questions! Go back to the questions <v-icon right>fas fa-backward</v-icon>
                </v-btn>
                <v-btn tile depressed small color="secondary" @click="quitPractice" class="mr-2">
                    Or quit practicing <v-icon right>fas fa-times</v-icon>
                </v-btn>
            </template>
            <v-btn v-if="!$vuetify.breakpoint.mdAndUp" icon depressed small color="primary" @click="goToSearch">
                <v-icon color="white">fas fa-search</v-icon>
            </v-btn>
            <v-btn icon depressed small color="primary" @click="showVersionDialog">
                <v-icon color="white">fas fa-code-branch</v-icon>
            </v-btn>
            <v-btn icon depressed small color="primary" @click="darkMode = !darkMode">
                <v-icon color="white">{{ darkMode ? "fas fa-sun" : "fas fa-moon" }}</v-icon>
            </v-btn>
            <v-btn icon depressed small color="primary" href="https://discord.gg/kHy5wXA" target="_blank">
                <v-icon color="white">fab fa-discord</v-icon>
            </v-btn>
        </v-toolbar-items>
    </v-app-bar>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";

import { Routes } from "../../../../cshub-shared/src/Routes";

import { dataState, practiceState, uiState } from "../../store";

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
    private githubLink = "https://github.com/finitum/CSHub/commit/" + this.fullGitSHA;
    private buildDate = "Build Date: " + process.env.VUE_APP_BUILDDATE;

    /**
     * Computed properties
     */
    get showExamWarning(): boolean {
        return practiceState.currentQuestions !== false;
    }

    get onExamQuestion(): boolean {
        return practiceState.currentQuestions && this.$route.name === "currentQuestion";
    }

    get toolbarColor(): string {
        return this.showExamWarning ? "error" : "primary";
    }

    get drawerComputed(): boolean {
        return uiState.navbar.open;
    }

    set drawerComputed(newValue: boolean) {
        uiState.setNavbar({ open: newValue });
    }

    get searchQuery(): string {
        return dataState.searchQuery;
    }

    set searchQuery(newValue: string) {
        dataState.setSearchQuery(newValue);
    }

    get darkMode(): boolean {
        return uiState.darkMode;
    }

    set darkMode(newValue: boolean) {
        uiState.setDarkMode(newValue);
        this.$vuetify.theme.dark = newValue;
    }

    /**
     * Methods
     */
    private backToQuestions() {
        const questions = practiceState.currentQuestions;
        if (questions) {
            for (let i = 0; i < questions.length; i++) {
                if (questions[i].answer === null) {
                    const location = `${Routes.QUESTION}/${i.toString()}`;
                    this.$router.push(location);
                    return;
                }
            }

            this.$router.push(`${Routes.QUESTION}/0`);
        }
    }

    private quitPractice() {
        practiceState.clear();
    }

    private routeHome() {
        router.push(Routes.INDEX);
    }

    private showVersionDialog() {
        uiState.setNotificationDialog({
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

    private goToSearch() {
        router.push(Routes.SEARCH);
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
.darkModeSwitch i {
    color: white !important;
}

.theme--dark .primary {
    background-color: #0072a1 !important;
    border-color: #0072a1 !important;
}

@media print {
    #cshub-toolbar {
        display: none;
    }
}
</style>
