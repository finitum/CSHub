<template>
    <v-toolbar color="primary" app absolute clipped-left>
        <v-toolbar-side-icon @click.native="drawerComputed = !drawerComputed"></v-toolbar-side-icon>
        <div class="title ml-3 mr-5" @click="routeHome()">CS&nbsp;<span class="font-weight-light">Hub</span></div>
        <v-text-field
                solo-inverted
                flat
                hide-details
                label="Search"
                prepend-inner-icon="mdi-magnify"
        ></v-text-field>
        <v-spacer></v-spacer>
    </v-toolbar>
</template>

<script lang="ts">
    import Vue from "vue";
    import uiState from "../../store/ui/index";
    import router, {Routes} from "../../views/router";

    export default Vue.extend({
        name: "Toolbar",
        methods: {
            routeHome() {
                router.push(Routes.INDEX);
            }
        },
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
    });
</script>

<style scoped>

</style>