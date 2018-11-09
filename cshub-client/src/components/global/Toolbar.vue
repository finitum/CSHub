<template>
    <v-toolbar color="primary" app fixed clipped-left>
        <v-toolbar-side-icon @click.native="drawerComputed = !drawerComputed"></v-toolbar-side-icon>
        <div class="title ml-3 mr-5" style="cursor: pointer" @click="routeHome()">CS&nbsp;<span class="font-weight-light">Hub</span></div>
        <v-text-field
                v-model="searchQuery"
                solo-inverted
                flat
                hide-details
                label="Search"
                prepend-inner-icon="fas fa-search"
        ></v-text-field>
        <v-spacer></v-spacer>
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

</style>