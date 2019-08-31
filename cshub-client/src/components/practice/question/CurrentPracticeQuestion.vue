<template>
    <div v-if="question !== null">
        <v-card-title style="font-size: 1.25rem" class="pa-0" v-html="renderMarkdown(question.question)"></v-card-title>

        <div v-if="type === 'mc'">
            <v-checkbox
                v-for="answer of question.answers"
                :key="answer.id"
                v-model="mcAnswers[answer.id]"
                hide-details
                :color="getColor(answer.id)"
                :readonly="checkedQuestion !== null"
                class="mt-0"
            >
                <template v-slot:label>
                    <span class="questionContent" v-html="renderMarkdown(answer.answer)"></span>
                </template>
            </v-checkbox>
        </div>
        <div v-if="type === 'sc'">
            <v-radio-group
                v-model="scAnswer"
                class="ml-5 mt-0"
                hide-details
                :readonly="checkedQuestion !== null"
                :multiple="checkedQuestion !== null"
            >
                <v-radio
                    v-for="answer of question.answers"
                    :key="answer.id"
                    :value="answer.id"
                    hide-details
                    :color="getColor(answer.id)"
                >
                    <template v-slot:label>
                        <span class="questionContent" v-html="renderMarkdown(answer.answer)"></span>
                    </template>
                </v-radio>
            </v-radio-group>
        </div>
        <div v-if="type === 'on'">
            <v-text-field
                v-model="privOnAnswer"
                outlined
                :readonly="checkedQuestion !== null"
                hide-details
                type="number"
                :background-color="color"
            ></v-text-field>
            <p v-if="checkedQuestion !== null" class="mt-4">
                <b>Answer:</b> {{ checkedQuestion.correctAnswer.number }}
            </p>
        </div>
        <div v-if="type === 'ot'">
            <v-text-field
                v-model="privOtAnswer"
                outlined
                :readonly="checkedQuestion !== null"
                hide-details
                :background-color="color"
            ></v-text-field>
            <p v-if="checkedQuestion !== null" class="mt-4"><b>Answer:</b> {{ checkedQuestion.correctAnswer.text }}</p>
        </div>
        <p v-if="checkedQuestion !== null" class="mt-4"><b>Explanation:</b> {{ checkedQuestion.explanation }}</p>
    </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { Routes } from "../../../../../cshub-shared/src/Routes";
import { practiceState } from "../../../store";
import { ApiWrapper } from "../../../utilities";
import { GetQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question";
import { PracticeQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/PracticeQuestion";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { mixins } from "vue-class-component";
import ViewerMixin from "../viewers/ViewerMixin";
import SCQuestionMixin from "./SCQuestionMixin";
import MCQuestionMixin from "./MCQuestionMixin";
import OTQuestionMixin from "./OTQuestionMixin";
import ONQuestionMixin from "./ONQuestionMixin";
import { CheckedAnswerType } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/CheckAnswer";

@Component({
    name: CurrentPracticeQuestion.name
})
export default class CurrentPracticeQuestion extends mixins(
    ViewerMixin,
    SCQuestionMixin,
    MCQuestionMixin,
    OTQuestionMixin,
    ONQuestionMixin
) {
    private question: PracticeQuestion | null = null;
    private checkedQuestion: CheckedAnswerType | null = null;

    get type(): string {
        if (this.question) {
            switch (this.question.type) {
                case QuestionType.MULTICLOSED:
                    return "mc";
                case QuestionType.SINGLECLOSED:
                    return "sc";
                case QuestionType.OPENNUMBER:
                    return "on";
                case QuestionType.OPENTEXT:
                    return "ot";
            }
        }
        return "";
    }

    get color(): string {
        if (this.checkedQuestion) {
            if (this.checkedQuestion.correct === true) {
                return "green";
            } else if (this.checkedQuestion.correct === false) {
                return "red";
            } else {
                return "";
            }
        } else {
            return "";
        }
    }

    private getColor(answerId: number) {
        if (practiceState.currentCheckedQuestion) {
            const answer = practiceState.currentCheckedQuestion.correctAnswer;
            if (answer.type === QuestionType.SINGLECLOSED) {
                if (answer.answerId !== answerId) {
                    return "red";
                } else {
                    return "green";
                }
            } else if (answer.type === QuestionType.MULTICLOSED) {
                if (answer.answerIds.includes(answerId)) {
                    return "green";
                } else {
                    return "red";
                }
            }
        }
    }

    private mounted() {
        const questionIndex = +this.$route.params.index;

        if (!isNaN(questionIndex)) {
            const currentQuestions = practiceState.currentQuestions;
            if (!currentQuestions) {
                this.$router.push(Routes.INDEX);
                return;
            }

            const currentQuestion = currentQuestions[questionIndex];
            if (!currentQuestion) {
                practiceState.clear();
                this.$router.push(Routes.INDEX);
                return;
            }

            ApiWrapper.get(new GetQuestion(currentQuestion.questionId)).then(retrievedQuestion => {
                this.question = retrievedQuestion !== null ? retrievedQuestion.question : null;

                if (retrievedQuestion !== null && practiceState.checkedQuestions) {
                    const checkedAnswer = practiceState.checkedQuestions.find(
                        question => question.questionId === retrievedQuestion.question.id
                    );

                    this.checkedQuestion = checkedAnswer || null;
                    practiceState.setCurrentCheckedQuestion(this.checkedQuestion);
                }
            });
        } else {
            this.$router.push(Routes.INDEX);
            return;
        }
    }
}
</script>

<style>
.questionContent p {
    margin-bottom: 0 !important;
}
</style>
