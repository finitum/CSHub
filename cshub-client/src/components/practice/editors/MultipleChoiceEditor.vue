<template>
    <v-container fluid>
        <v-col cols="6">
            <v-checkbox
                v-model="multipleCorrect"
                label="Multiple correct answers"
                class="mb-4"
                hide-details
            ></v-checkbox>
            <v-textarea v-model="question" filled label="Question" value="Bla" class="mb-4" hide-details></v-textarea>

            <v-row v-for="answer in amountOfAnswers" :key="answer" align="center" class="mb-4 ml-0 mr-0">
                <v-checkbox v-model="answers[answer].isCorrect" hide-details class="shrink mr-2 mt-0"></v-checkbox>
                <v-textarea
                    v-model="answers[answer].text"
                    :label="`Answer ${answer}`"
                    outlined
                    auto-grow
                    rows="1"
                    hide-details
                    append-icon="fas fa-plus"
                >
                    <template v-slot:append>
                        <v-icon>fas fa-times</v-icon>
                        <v-icon class="ml-3">fas fa-plus</v-icon>
                    </template>
                </v-textarea>
            </v-row>
        </v-col>
        <v-col cols="6" v-html="html">
            <p>hoi</p>
        </v-col>
    </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

// @ts-ignore
import mk from "markdown-it-katex";
import MarkdownIt from "markdown-it";

type AnswerType = {
    isCorrect: boolean;
    text: string;
};

@Component({
    name: "MultipleChoiceEditor"
})
export default class MultipleChoiceEditor extends Vue {
    private multipleCorrect = false;
    private question = "";

    private amountOfAnswers = 1;
    private answers: { [key: number]: AnswerType } = {};

    private markdownParser = new MarkdownIt({
        highlight: (str: string, lang: string) => {
            if (lang.length === 0) {
                lang = "null";
            }
            return `<pre data-lang=${lang}><code>${str}</code></pre>`;
        }
    }).use(mk);

    get html(): string {
        return this.markdownParser.render(this.question);
    }
}
</script>

<style scoped></style>
