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
                    class="mt-4"
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
                    class="mt-4"
                    hide-details
                ></v-textarea>

                <v-radio-group v-model="radioAnswer">
                    <v-row v-for="(answer, i) of answers" :key="i" align="center" class="mt-4 ml-0 mr-0">
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
            <MultipleChoiceViewer
                :multiple-correct="multipleCorrect"
                :question="question"
                :explanation="explanation"
                :answers="answers"
            ></MultipleChoiceViewer>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import {Component, Prop} from "vue-property-decorator";

import { ApiWrapper } from "../../../utilities";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import {AddQuestion, EditQuestion} from "../../../../../cshub-shared/src/api-calls/endpoints/question";
import {
    FullClosedAnswerType,
    FullQuestion
} from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import MultipleChoiceViewer from "../viewers/MultipleChoiceViewer.vue";
import { EventBus, QUESTIONS_CHANGED } from "../../../utilities/EventBus";

const emptyAnswer = (): FullClosedAnswerType => {
    return {
        correct: false,
        answerText: ""
    };
};

@Component({
    name: "MultipleChoiceEditor",
    components: { MultipleChoiceViewer },
    inject: ["$validator"]
})
export default class MultipleChoiceEditor extends Vue {
    @Prop({
        required: false
    })
    private propMultipleCorrect?: boolean;

    @Prop({
        required: false
    })
    private propQuestion?: string;

    @Prop({
        required: false
    })
    private propExplanation?: string;

    @Prop({
        required: false
    })
    private propAnswers?: FullClosedAnswerType[];

    @Prop({
        required: true
    })
    private isEditing!: false | number;

    private multipleCorrect = this.propMultipleCorrect || false;
    private question = this.propQuestion || "";
    private explanation = this.propExplanation || "";

    private privAnswers: FullClosedAnswerType[] = this.propAnswers || [emptyAnswer(), emptyAnswer()];
    private privRadioAnswer: number = this.propAnswers ? this.propAnswers.findIndex(answer => answer.correct) : 0;

    get answers(): FullClosedAnswerType[] {
        const answers = this.privAnswers;

        if (!this.multipleCorrect) {
            answers[this.radioAnswer].correct = true;
        }

        return answers;
    }

    set answers(answers: FullClosedAnswerType[]) {
        this.privAnswers = answers;
    }

    get radioAnswer(): number {
        return this.privRadioAnswer;
    }

    set radioAnswer(value: number) {
        this.privRadioAnswer = value;

        if (!this.multipleCorrect) {
            this.privAnswers.forEach(answer => (answer.correct = false));
            this.privAnswers[value].correct = true;
        }
    }

    private async submit() {
        let valid = await this.$validator.validateAll();

        if (valid) {
            if (!this.multipleCorrect) {
                this.answers[this.radioAnswer].correct = true;
            }

            const questionObj: FullQuestion = {
                question: this.question,
                explanation: this.explanation,
                type: this.multipleCorrect ? QuestionType.MULTICLOSED : QuestionType.SINGLECLOSED,
                answers: this.answers
            };

            if (this.isEditing) {
                await ApiWrapper.put(new EditQuestion(questionObj, this.isEditing));
            } else {
                await ApiWrapper.post(new AddQuestion(questionObj, +this.$route.params.hash));
            }

            EventBus.$emit(QUESTIONS_CHANGED);
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
.multiple-choice-textarea .v-text-field__slot {
    margin-right: 0 !important;
}

.questionContent p {
    margin-bottom: 0 !important;
}
</style>
