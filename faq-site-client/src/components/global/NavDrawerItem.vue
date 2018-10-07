<template>
    <v-list-tile
            @click=""
    >
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

    export default Vue.extend({
        name: "NavDrawerItem",
        props: {
            icon: String,
            text: String
        }
    });
</script>

<style scoped>

</style>