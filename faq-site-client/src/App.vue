<template>
    <v-app id="app">
        <NavDrawer></NavDrawer>
        <Toolbar></Toolbar>
        <v-content>
            <v-container fluid fill-height class="grey lighten-4">
                <v-layout justify-center align-center>
                    <transition
                            name="componentChange"
                            enter-active-class="animated fadeInLeft"
                    >
                        <router-view></router-view>
                    </transition>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>

<script lang="ts">
    import NavDrawer from "./components/global/NavDrawer.vue";
    import Toolbar from "./components/global/Toolbar.vue";

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

    .componentChange-leave-active {
        opacity: 0;
    }

    .fadeInLeft {
        -webkit-animation: fadeInLeft 0.5s;
        -moz-animation:    fadeInLeft 0.5s;
        -o-animation:      fadeInLeft 0.5s;
        animation:         fadeInLeft 0.5s;
    }

</style>
