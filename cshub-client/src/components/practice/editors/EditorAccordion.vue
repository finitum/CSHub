<template>
    <v-card class="mx-4 mt-6" outlined style="width: 100%">
        <v-expansion-panel :value="true">
            <v-expansion-panel-header class="pb-0">
                <v-layout column>
                    <h4 class="display-1 mb-1" style="font-size: 1.4rem !important">{{ title }}</h4>
                    <p class="mb-2 subtitle-1">{{ subtitle }}</p>
                </v-layout>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pa-0">
                <v-layout column>
                    <slot></slot>
                </v-layout>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component({
    name: EditorAccordion.name
})
export default class EditorAccordion extends Vue {
    @Prop({ required: true })
    public readonly title!: string;

    @Prop({ required: true })
    public readonly subtitle!: string;
}
</script>

<style></style>
