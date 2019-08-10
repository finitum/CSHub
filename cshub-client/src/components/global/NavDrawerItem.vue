<template>
    <v-list-item @click.prevent>
        <v-list-item-action>
            <v-icon>{{ icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
            <v-list-item-title class="grey--text">
                {{ text }}
            </v-list-item-title>
        </v-list-item-content>
    </v-list-item>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component({
    name: "NavDrawerItem"
})
export default class NavDrawerItem extends Vue {
    /**
     * Data
     */
    @Prop({ required: true }) private icon!: string;
    @Prop({ required: true }) private text!: string;
}
</script>

<style scoped></style>
