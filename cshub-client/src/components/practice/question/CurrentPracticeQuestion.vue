import {QuestionType} from "../../../../../cshub-shared/src/entities/question";
import {QuestionType} from "../../../../../cshub-shared/src/entities/question"; import {QuestionType} from
"../../../../../cshub-shared/src/entities/question"; import {QuestionType} from
"../../../../../cshub-shared/src/entities/question";
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
                v-model="onAnswer"
                outlined
                :readonly="checkedQuestion !== null"
                hide-details
                type="number"
                :background-color="color"
            ></v-text-field>
            <p v-if="checkedQuestion === null" class="mt-4">
                Answer this question with a precision of {{ question.precision }}
            </p>
            <p v-if="checkedQuestion !== null" class="mt-4">
                <b>Answer:</b> {{ checkedQuestion.correctAnswer.number }}
            </p>
        </div>
        <div v-if="type === 'ot'">
            <v-text-field
                v-model="otAnswer"
                outlined
                :readonly="checkedQuestion !== null"
                hide-details
                :background-color="color"
            ></v-text-field>
            <p v-if="checkedQuestion !== null" class="mt-4"><b>Answer:</b> {{ checkedQuestion.correctAnswer.text }}</p>
        </div>
        <div v-if="type === 'dn'">
            <v-text-field
                v-model="dnAnswer"
                outlined
                :readonly="checkedQuestion !== null"
                hide-details
                :background-color="color"
            ></v-text-field>
            <p v-if="checkedQuestion !== null" class="mt-4">
                <b>Answer:</b> {{ checkedQuestion.correctAnswer.answer }}
            </p>
        </div>
        <p v-if="checkedQuestion !== null" class="mt-4">
            <b>Correct:</b> {{ checkedQuestion.correct === null ? "can't check" : checkedQuestion.correct }}
        </p>
        <p v-if="checkedQuestion !== null" class="mt-4"><b>Explanation:</b> {{ checkedQuestion.explanation }}</p>
    </div>
</template>

<script lang="ts">
    import {Component} from "vue-property-decorator";
    import {Routes} from "../../../../../cshub-shared/src/Routes";
    import {practiceState} from "../../../store";
    import {ApiWrapper} from "../../../utilities";
    import {GetQuestion} from "../../../../../cshub-shared/src/api-calls/endpoints/question";
    import {PracticeQuestion} from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/PracticeQuestion";
    import {QuestionType} from "../../../../../cshub-shared/src/entities/question";
    import {mixins} from "vue-class-component";
    import ViewerMixin from "../viewers/ViewerMixin";
    import {CheckedAnswerType} from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/CheckAnswer";
    import QuestionMixin from "./QuestionMixin";
    import {StoreQuestionType} from "../../../store/state/practiceState";

    @Component({
    name: CurrentPracticeQuestion.name
})
export default class CurrentPracticeQuestion extends mixins(ViewerMixin, QuestionMixin) {
    private question: PracticeQuestion | null = null;

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
                case QuestionType.DYNAMIC:
                    return "dn";
            }
        }
        return "";
    }

    get checkedQuestion(): CheckedAnswerType | null {
        return (
            practiceState.checkedQuestions.find(
                question => question && question.questionId === this.currentQuestion.questionId
            ) || null
        );
    }

    get currentQuestion(): StoreQuestionType {
        const questionIndex = +this.$route.params.index;

        if (!isNaN(questionIndex)) {
            const currentQuestions = practiceState.currentQuestions;
            if (!currentQuestions) {
                this.$router.push(Routes.INDEX);
                throw new Error();
            }

            const currentQuestion = currentQuestions[questionIndex];
            if (!currentQuestion) {
                practiceState.clear();
                this.$router.push(Routes.INDEX);
                throw new Error();
            }

            return currentQuestion;
        }

        this.$router.push(Routes.INDEX);
        throw new Error();
    }

    get color(): string {
        if (this.checkedQuestion) {
            if (this.checkedQuestion.correct === true) {
                return "green";
            } else if (this.checkedQuestion.correct === false) {
                return "red";
            } else if (this.checkedQuestion.correctAnswer.type === QuestionType.OPENTEXT) {
                return "orange";
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
            const userAnswer = practiceState.currentCheckedQuestion.answer;
            if (answer.type === QuestionType.SINGLECLOSED && userAnswer.type === QuestionType.SINGLECLOSED) {
                if (answer.answerId !== answerId) {
                    return "red";
                } else {
                    return "green";
                }
            } else if (answer.type === QuestionType.MULTICLOSED && userAnswer.type === QuestionType.MULTICLOSED) {
                if (answer.answerIds.includes(answerId) && userAnswer.answerIds.includes(answerId)) {
                    return "green";
                } else if (answer.answerIds.includes(answerId)) {
                    return "orange";
                } else {
                    return "red";
                }
            }
        }
    }

    private mounted() {
        ApiWrapper.get(new GetQuestion(this.currentQuestion.questionId)).then(retrievedQuestion => {
            this.question = retrievedQuestion !== null ? retrievedQuestion.question : null;

            if (retrievedQuestion !== null) {
                if (retrievedQuestion.question.type === QuestionType.DYNAMIC) {
                    this.variableValues = retrievedQuestion.question.variables;
                }

                practiceState.setCurrentCheckedQuestion(this.checkedQuestion);
            }
        });
    }
}
</script>

<style>
.questionContent p {
    margin-bottom: 0 !important;
}
</style>
