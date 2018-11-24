<template>
    <v-app id="app">
        <NavDrawer></NavDrawer>
        <NotificationDialog></NotificationDialog>
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
    import {Component, Watch} from "vue-property-decorator";
    import Vue from "vue";

    import {Routes} from "../../cshub-shared/src/Routes";

    import NavDrawer from "./components/global/NavDrawer.vue";
    import Toolbar from "./components/global/Toolbar.vue";
    import NotificationDialog from "./components/global/NotificationDialog.vue";

    import uiState from "./store/ui";

    @Component({
        name: "App",
        components: {NavDrawer, Toolbar, NotificationDialog},
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
            return uiState.drawerState;
        }
        set drawerComputed(newValue: boolean) {
            uiState.setDrawerState(newValue);
        }

        /**
         * Watchers
         */
        @Watch("$route")
        private routeChanged(to: Route, from: Route) {
            const excludeTransition = (from.fullPath === Routes.INDEX && to.name === "post") ||
                (to.fullPath === Routes.INDEX && from.name === "post") ||
                (from.name === "user" && to.name === "post") ||
                (from.name === "admin" && to.name === "post") ||
                (to.fullPath === Routes.SEARCH) ||
                (from.fullPath === Routes.SEARCH);

            if (excludeTransition) {
                this.activeclass = "";
            } else {
                this.activeclass = "animated fadeInLeft";
            }
        }
    }
</script>
<style>
    *:focus {
        outline: none;
    }

    #app {
        background: white;
    }

    .postTile .v-list__tile {
        height: auto !important;
    }

    .v-icon {
        font-size: 17px !important;
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
        font-family: 'SailecLight';
        src: url("../public/assets/Sailec-Light.otf");
    }

    .ql-editor {
        border: none;
        font-family: 'SailecLight', sans-serif;
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

    code {
        color: inherit;
        font-weight: inherit;
        box-shadow: none;
    }

    .markdown-body li {
        list-style-type: decimal !important;
    }
</style>
