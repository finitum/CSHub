<template>
    <v-app id="app" :dark="darkMode">
        <NavDrawer></NavDrawer>
        <NotificationDialog></NotificationDialog>
        <Toolbar></Toolbar>
        <v-content id="cshub-content">
            <transition name="componentChange" :enter-active-class="activeclass">
                <router-view></router-view>
            </transition>
        </v-content>
    </v-app>
</template>

<script lang="ts">
import { Route } from "vue-router";
import { Component, Watch } from "vue-property-decorator";
import Vue from "vue";

import { Routes } from "../../cshub-shared/src/Routes";

import NavDrawer from "./components/global/NavDrawer.vue";
import Toolbar from "./components/global/Toolbar.vue";
import NotificationDialog from "./components/global/NotificationDialog.vue";

import { uiState } from "./store";

@Component({
    name: "App",
    components: { NavDrawer, Toolbar, NotificationDialog }
})
export default class App extends Vue {
    /**
     * Data
     */
    private drawerActive = true;
    private activeclass = "animated fadeInLeft";

    /**
     * Computed properties
     */
    get drawerComputed(): boolean {
        return uiState.navbar.open;
    }
    set drawerComputed(newValue: boolean) {
        uiState.setNavbar({ open: newValue });
    }

    get darkMode(): boolean {
        return uiState.darkMode;
    }

    /**
     * Watchers
     */
    @Watch("$route")
    private routeChanged(to: Route, from: Route) {
        const excludeTransition =
            (from.fullPath === Routes.INDEX && to.name === "post") ||
            (to.fullPath === Routes.INDEX && from.name === "post") ||
            (from.name === "user" && to.name === "post") ||
            (from.name === "admin" && to.name === "post") ||
            (from.name === "unsavedposts" && to.name === "post") ||
            (from.name === "wipposts" && to.name === "post") ||
            to.fullPath === Routes.SEARCH ||
            from.fullPath === Routes.SEARCH;

        if (excludeTransition) {
            this.activeclass = "";
        } else {
            this.activeclass = "animated fadeInLeft";
        }
    }
}
</script>
<style lang="scss">
@import "./styling/vars";

.v-treeview {
    color: $grey !important;
    font-weight: 500;
    font-size: 14px !important;
}

*:focus {
    outline: none;
}

.postTile .v-list__tile {
    height: auto !important;
}

.v-icon {
    font-size: 17px !important;
}

.theme--light.v-application {
    background: #f5f5f5;
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

@font-face {
    font-family: "SailecLight";
    src: url("../public/assets/Sailec-Light.otf");
}

.ql-editor {
    border: none;
    font-family: "SailecLight", sans-serif;
}

.theme--dark .ql-editor pre {
    background-color: $lightergrey !important;
}

.mord.accent {
    background-color: inherit !important;
}

code:before {
    content: initial;
}

code:after {
    content: initial;
}

.theme--dark .cm-s-darcula {
    background-color: $lightergrey !important;
}

code {
    color: inherit;
    font-weight: inherit;
    box-shadow: none;
}

.markdown-body ol li {
    list-style-type: decimal !important;
}

.markdown-body ul li {
    list-style-type: disc !important;
}

html {
    font-size: 16px !important;
}

strong {
    font-weight: 800 !important;
}

@media print {
    #cshub-content {
        padding: 0 !important;
    }
}

.quillIcon .v-btn--active:before,
.v-btn:focus:before,
.v-btn:hover:before {
    background-color: inherit;
}

.quillIcon .v-icon:hover {
    color: #06c !important;
}

.v-subheader {
    font-weight: 500 !important;
}
</style>
