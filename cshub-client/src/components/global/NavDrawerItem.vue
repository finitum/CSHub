<template>
    <v-list-tile @click="">
        <v-list-tile-action>
            <v-icon>{{ icon }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
            <v-list-tile-title class="grey--text">
                {{ text }}
            </v-list-tile-title>
        </v-list-tile-content>
    </v-list-tile>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    @Component({
        name: "NavDrawerItem"

    })
    export default class NavDrawerItem extends Vue {

        /**
         * Data
         */
        @Prop(String) private icon: string;
        @Prop(String) private text: string;
    }
</script>

<style scoped>

</style>