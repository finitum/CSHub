<template>
    <div>
        <v-expansion-panels>
            <EditorAccordion
                title="Multiple choice"
                subtitle="Create a multiple choice question (single or multi answers)."
            >
                <MultipleChoiceEditor></MultipleChoiceEditor
            ></EditorAccordion>
            <EditorAccordion
                title="Open question - number"
                subtitle="Create a open numbered question, with a certain precision."
            >
                <OpenNumberEditor></OpenNumberEditor
            ></EditorAccordion>
            <EditorAccordionxfce
                title="Open question - text"
                subtitle="Create a open text question. Can't be checked by the server"
            >
                <OpenTextEditor></OpenTextEditor
            ></EditorAccordionxfce>
        </v-expansion-panels>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import MultipleChoiceEditor from "./MultipleChoiceEditor.vue";
import EditorAccordion from "./EditorAccordion.vue";
import OpenNumberEditor from "./OpenNumberEditor.vue";
import OpenTextEditor from "./OpenTextEditor.vue";

@Component({
    name: Editors.name,
    components: { OpenTextEditor, OpenNumberEditor, EditorAccordion, MultipleChoiceEditor }
})
export default class Editors extends Vue {}
</script>

<style></style>
