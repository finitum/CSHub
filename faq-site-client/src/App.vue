<template>
    <v-app id="app">
        <NavDrawer></NavDrawer>
        <Toolbar></Toolbar>
        <v-content>
            <v-container fluid fill-height class="grey lighten-4">
                <v-layout justify-center align-center>
                    <transition
                            name="componentChange"
                            :enter-active-class="activeclass"
                    >
                        <router-view></router-view>
                    </transition>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>

<script lang="ts">
    import {Route} from "vue-router";

    import NavDrawer from "./components/global/NavDrawer.vue";
    import Toolbar from "./components/global/Toolbar.vue";

    import Vue from "vue";
    import uiState from "./store/ui";
    import {Routes} from "./views/router";

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
                activeclass: "animated fadeInLeft" as string
            };
        },
        watch: {
            '$route' (to: Route, from: Route) {
                if (from.fullPath === Routes.INDEX && to.name === "post") {
                    this.activeclass = ""
                } else {
                    this.activeclass = "animated fadeInLeft"
                }
            }
        }
    });
</script>
<style scoped>
    #app {
        background: white;
    }

    .componentChange-leave-active {
        opacity: 0;
    }
</style>
