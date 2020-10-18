<template>
    <v-card class="ma-5 pa-5">
        <div class="mb-4">
            <v-btn color="primary" class="mr-2" @click="submit">Submit</v-btn>
            <v-btn color="error" class="mr-2" @click="stop">Stop</v-btn>
            <v-btn color="primary" class="mr-2" outlined @click="checkCurrent">Check current question</v-btn>
            <v-pagination v-model="paginationPageState" :length="paginationLength" style="width: unset"></v-pagination>
        </div>

        <transition name="questionTransition">
            <router-view></router-view>
        </transition>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Routes } from "../../../../../cshub-shared/src/Routes";
import { practiceState, uiState } from "../../../store";
import { ApiWrapper } from "../../../utilities";
import { CheckAnswers } from "../../../../../cshub-shared/src/api-calls/endpoints/question";
import {
    CheckAnswerType,
    ToCheckAnswerType,
} from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/CheckAnswer";

@Component({
    name: PracticeQuestion.name,
})
export default class PracticeQuestion extends Vue {
    get paginationLength(): number {
        return practiceState.currentQuestions ? practiceState.currentQuestions.length : 1;
    }

    get paginationPageState(): number {
        return +this.$route.params.index + 1;
    }

    set paginationPageState(page: number) {
        this.$router.push(`${Routes.QUESTION}/${(page - 1).toString()}`);
    }

    private async checkCurrent() {
        const questionIndex = +this.$route.params.index;

        const questions = practiceState.currentQuestions;
        if (questions) {
            const currQuestion = questions[questionIndex];
            if (currQuestion) {
                if (!currQuestion.answer) {
                    uiState.setNotificationDialog({
                        header: "Missing answer!",
                        text: "You haven't answered anything!",
                        on: true,
                    });
                    return;
                }

                ApiWrapper.post(
                    new CheckAnswers([
                        {
                            questionId: currQuestion.questionId,
                            answer: currQuestion.answer,
                        },
                    ]),
                ).then((value) => {
                    if (value && value.answers.length === 1) {
                        practiceState.setCheckedQuestion({
                            value: value.answers[0],
                            index: questionIndex,
                        });
                    }
                });
            }
        }
    }

    private stop() {
        practiceState.clear();
        this.$router.push(Routes.INDEX);
    }

    private async submit() {
        const questions = practiceState.currentQuestions;
        if (questions) {
            const checkQuestions: ToCheckAnswerType[] = [];

            for (const question of questions) {
                if (!question.answer) {
                    uiState.setNotificationDialog({
                        header: "Missing answer!",
                        text:
                            "You are missing an answer for some question! In future updates this answer will be more specified but now we're in a hurry :)",
                        on: true,
                    });
                    return;
                }

                checkQuestions.push({
                    questionId: question.questionId,
                    answer: question.answer,
                });
            }

            const value = await ApiWrapper.post(new CheckAnswers(checkQuestions));
            if (value) {
                practiceState.setCheckedQuestions(value.answers);
                this.$router.push(`${Routes.QUESTION}/0`);
            }
        }
    }
}
</script>

<style scoped>
.questionTransition-enter-active,
.questionTransition-leave-active {
    transition: opacity 0.5s;
}
.questionTransition-enter,
.questionTransition-leave-to {
    opacity: 0;
}
</style>
