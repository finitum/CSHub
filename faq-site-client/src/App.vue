<template>
    <v-app id="app">
        <NavDrawer></NavDrawer>
        <Toolbar></Toolbar>
        <v-content>
            <v-container fluid fill-height class="grey lighten-4">
                <v-layout justify-center align-center>
                    <v-flex shrink>
                        <router-view></router-view>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>

<script lang="ts">
    import NavDrawer from "./components/NavDrawer.vue";
    import Toolbar from "./components/Toolbar.vue";

    import Vue from "vue";
    import uiState from "./store/ui";

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
                drawerActive: true as boolean
            };
        }
    });
</script>
<style scoped>
    #app {
        background: white;
    }
</style>
