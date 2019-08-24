<template>
    <v-row>
        <v-col cols="6">
            <v-form @submit="submit">
                <v-btn color="primary" @click="submit">Submit</v-btn>
                <v-checkbox
                    v-model="multipleCorrect"
                    label="Multiple correct answers"
                    class="mb-4"
                    hide-details
                ></v-checkbox>
                <v-textarea
                    v-model="question"
                    v-validate="'required|min:2'"
                    :error-messages="errors.collect('question')"
                    name="question"
                    filled
                    required
                    auto-grow
                    rows="2"
                    label="Question"
                    value="Bla"
                    class="mb-4"
                    hide-details
                ></v-textarea>
                <v-textarea
                    v-model="explanation"
                    v-validate="'required|min:2'"
                    :error-messages="errors.collect('explanation')"
                    required
                    name="explanation"
                    filled
                    auto-grow
                    rows="3"
                    label="Explanation"
                    value="Bla"
                    class="mb-4"
                    hide-details
                ></v-textarea>

                <v-radio-group v-model="radioAnswer">
                    <v-row v-for="(answer, i) of answers" :key="i" align="center" class="mb-4 ml-0 mr-0">
                        <v-checkbox
                            v-if="multipleCorrect"
                            v-model="answer.correct"
                            hide-details
                            class="shrink mr-2 mt-0"
                        ></v-checkbox>
                        <v-radio v-else hide-details class="shrink mr-2 mt-0" :value="i"></v-radio>

                        <v-textarea
                            v-model="answer.answerText"
                            v-validate="'required|min:2'"
                            :label="`Answer ${i + 1}`"
                            outlined
                            auto-grow
                            :name="`answer${i}`"
                            :error-messages="errors.collect(`answer${i}`)"
                            rows="1"
                            class="mr-0 multiple-choice-textarea"
                            hide-details
                            append-icon="fas fa-plus"
                        >
                            <template v-slot:append>
                                <v-icon v-if="answers.length > 2" @click="removeAnswerAtIndex(i)">fas fa-times</v-icon>
                                <v-icon v-if="i === answers.length - 1" class="ml-3" @click="addNewAnswer"
                                    >fas fa-plus</v-icon
                                >
                            </template>
                        </v-textarea>
                    </v-row>
                </v-radio-group>
            </v-form>
        </v-col>
        <v-col cols="6">
            <b>Question:</b>
            <p v-html="renderMarkdown(question)"></p>
            <b>Explanation:</b>
            <p v-html="renderMarkdown(explanation)"></p>

            <v-radio-group v-model="radioAnswer">
                <div v-for="(answer, i) of answers" :key="answer.id">
                    <v-checkbox
                        v-if="multipleCorrect"
                        v-model="answer.correct"
                        readonly
                        hide-details
                        class="shrink mr-2 mt-0"
                    >
                        <template v-slot:label>
                            <p class="ma-0 questionContent" v-html="renderMarkdown(answer.answerText)"></p>
                        </template>
                    </v-checkbox>
                    <v-radio v-else :value="i" readonly hide-details>
                        <template v-slot:label>
                            <p class="ma-0 questionContent" v-html="renderMarkdown(answer.answerText)"></p>
                        </template>
                    </v-radio>
                </div>
            </v-radio-group>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";

import { ApiWrapper } from "../../../utilities";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import {
    AddQuestion,
    ClosedAnswerType,
    FullQuestion
} from "../../../../../cshub-shared/src/api-calls/endpoints/question/AddQuestion";
import { mixins } from "vue-class-component";
import EditorMixin from "./EditorMixin";

const emptyAnswer = (): ClosedAnswerType => {
    return {
        correct: false,
        answerText: ""
    };
};

@Component({
    name: "MultipleChoiceEditor",
    inject: ["$validator"]
})
export default class MultipleChoiceEditor extends mixins(EditorMixin) {
    private multipleCorrect = false;
    private question = "";
    private explanation = "";

    private answers: ClosedAnswerType[] = [emptyAnswer(), emptyAnswer()];
    private radioAnswer: number = 0;

    private async submit() {
        let valid = await this.$validator.validateAll();

        if (valid) {
            if (!this.multipleCorrect) {
                this.answers[this.radioAnswer].correct = true;
            }

            const question: FullQuestion = {
                question: this.question,
                explanation: this.explanation,
                type: this.multipleCorrect ? QuestionType.MULTICLOSED : QuestionType.SINGLECLOSED,
                answers: this.answers
            };

            await ApiWrapper.post(new AddQuestion(question, +this.$route.params.hash));
        }
    }

    private removeAnswerAtIndex(index: number) {
        this.answers.splice(index, 1);
    }

    private addNewAnswer() {
        this.answers.push(emptyAnswer());
    }
}
</script>

<style>
.dynamic-question-textarea .v-text-field__slot {
    margin-right: 0 !important;
}

.questionContent p {
    margin-bottom: 0 !important;
}
</style>
