<template>
    <v-container fluid>
        <v-row>
            <v-col cols="6">
                <v-checkbox
                    v-model="multipleCorrect"
                    label="Multiple correct answers"
                    class="mb-4"
                    hide-details
                ></v-checkbox>
                <v-textarea
                    v-model="question"
                    filled
                    auto-grow
                    rows="3"
                    label="Question"
                    value="Bla"
                    class="mb-4"
                    hide-details
                ></v-textarea>

                <v-radio-group v-model="radioAnswer">
                    <v-row v-for="(answer, i) of answers" :key="i" align="center" class="mb-4 ml-0 mr-0">
                        <v-checkbox
                            v-if="multipleCorrect"
                            v-model="answer.isCorrect"
                            hide-details
                            class="shrink mr-2 mt-0"
                        ></v-checkbox>
                        <v-radio v-else hide-details class="shrink mr-2 mt-0" :value="i"></v-radio>

                        <v-textarea
                            v-model="answer.text"
                            :label="`Answer ${i + 1}`"
                            outlined
                            auto-grow
                            rows="1"
                            class="mr-0 multiple-choice-textarea"
                            hide-details
                            append-icon="fas fa-plus"
                        >
                            <template v-slot:append>
                                <v-icon v-if="answers.length > 1" @click="removeAnswerAtIndex(i)">fas fa-times</v-icon>
                                <v-icon v-if="i === answers.length - 1" class="ml-3" @click="addNewAnswer"
                                    >fas fa-plus</v-icon
                                >
                            </template>
                        </v-textarea>
                    </v-row>
                </v-radio-group>
            </v-col>
            <v-col cols="6">
                <p v-html="renderMarkdown(question)"></p>

                <v-radio-group v-model="radioAnswer">
                    <div v-for="(answer, i) of answers" :key="answer.id">
                        <v-checkbox
                            v-if="multipleCorrect"
                            v-model="answer.isCorrect"
                            :label="renderMarkdown(answer.text)"
                            readonly
                            hide-details
                            class="shrink mr-2 mt-0"
                        >
                            <template v-slot:label>
                                <p class="ma-0 questionContent" v-html="renderMarkdown(answer.text)"></p>
                            </template>
                        </v-checkbox>
                        <v-radio v-else :value="i" readonly hide-details>
                            <template v-slot:label>
                                <p class="ma-0 questionContent" v-html="renderMarkdown(answer.text)"></p>
                            </template>
                        </v-radio>
                    </div>
                </v-radio-group>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import katex from "katex";
import "katex/dist/katex.min.css";

import { getMarkdownParser } from "../../../../../cshub-shared/src/utilities/MarkdownLatexQuill";
import { colorize } from "../../../utilities/codemirror-colorize";
import CodeMirror from "codemirror";

type AnswerType = {
    isCorrect: boolean;
    text: string;
};

const emptyAnswer = (): AnswerType => {
    return {
        isCorrect: false,
        text: ""
    };
};

@Component({
    name: "MultipleChoiceEditor"
})
export default class MultipleChoiceEditor extends Vue {
    private multipleCorrect = false;
    private question = "";

    private answers: AnswerType[] = [emptyAnswer()];
    private radioAnswer: number = 0;

    private markdownParser = getMarkdownParser();

    private mounted() {
        (window as any).katex = katex;
    }

    private removeAnswerAtIndex(index: number) {
        this.answers.splice(index, 1);
    }

    private addNewAnswer() {
        this.answers.push(emptyAnswer());
    }

    private highlightCode() {
        colorize(null, CodeMirror);
    }

    private renderMarkdown(text: string): string {
        this.highlightCode();
        return this.markdownParser.render(
            text
                .split("<")
                .join("&lt;")
                .split(">")
                .join("&gt;")
        );
    }
}
</script>

<style>
.multiple-choice-textarea .v-text-field__slot {
    margin-right: 0 !important;
}

.questionContent p {
    margin-bottom: 0 !important;
}
</style>
