<template>
    <v-toolbar color="primary" app absolute clipped-left>
        <v-toolbar-side-icon @click.native="drawerComputed = !drawerComputed"></v-toolbar-side-icon>
        <span class="title ml-3 mr-5">CSE&nbsp;<span class="font-weight-light">Delft</span></span>
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
    import uiState from "../store/ui";

    export default Vue.extend({
        name: "Toolbar",
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
    })
</script>

<style scoped>

</style>