<template>
    <div>
        <v-expansion-panels>
            <EditorAccordion
                title="Multiple choice"
                subtitle="Create a multiple choice question (single or multi answers)."
            >
                <MultipleChoiceEditor :is-editing="false"></MultipleChoiceEditor
            ></EditorAccordion>
            <EditorAccordion
                title="Open question - number"
                subtitle="Create a open numbered question, with a certain precision."
            >
                <OpenNumberEditor :is-editing="false"></OpenNumberEditor
            ></EditorAccordion>
            <EditorAccordion
                title="Open question - text"
                subtitle="Create a open text question. Can't be checked by the server"
            >
                <OpenTextEditor :is-editing="false"></OpenTextEditor
            ></EditorAccordion>
            <EditorAccordion title="Dynamic question" subtitle="Create a dynamically generated and checked question">
                <DynamicEditor></DynamicEditor
            ></EditorAccordion>
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
import DynamicEditor from "./DynamicEditor.vue";

@Component({
    name: Editors.name,
    components: { DynamicEditor, OpenTextEditor, OpenNumberEditor, EditorAccordion, MultipleChoiceEditor },
})
export default class Editors extends Vue {}
</script>

<style></style>
