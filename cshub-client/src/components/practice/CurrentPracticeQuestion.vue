<template>
    <v-card v-if="question !== null" class="ma-5 pa-5">
        <v-card-title style="font-size: 1.25rem" class="pa-0" v-html="renderMarkdown(question.question)"></v-card-title>

        <div v-if="type === 'mc'">
            <v-checkbox
                v-for="answer of question.answers"
                :key="answer.id"
                v-model="mcAnswers[answer.id]"
                hide-details
                class="mt-0"
            >
                <template v-slot:label>
                    <p class="ma-0 questionContent" v-html="renderMarkdown(answer.answer)"></p>
                </template>
            </v-checkbox>
        </div>
        <div v-if="type === 'sc'">
            <v-radio-group v-model="scAnswer" class="ml-5 mt-0">
                <v-radio v-for="answer of question.answers" :key="answer.id" :value="answer.id" hide-details>
                    <template v-slot:label>
                        <p class="ma-0 questionContent" v-html="renderMarkdown(answer.answer)"></p>
                    </template>
                </v-radio>
            </v-radio-group>
        </div>
        <div v-if="type === 'on'">
            <v-text-field v-model="privOtAnswer" label="Answer" outlined hide-details type="number"></v-text-field>
        </div>
        <div v-if="type === 'ot'">
            <v-text-field v-model="privOnAnswer" label="Answer" outlined hide-details></v-text-field>
        </div>
    </v-card>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import EditorAccordion from "./editors/EditorAccordion.vue";
import Editors from "./editors/Editors.vue";
import QuestionList from "./QuestionList.vue";
import { Routes } from "../../../../cshub-shared/src/Routes";
import { practiceState } from "../../store";
import { ApiWrapper } from "../../utilities";
import { GetQuestion } from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { PracticeQuestion } from "../../../../cshub-shared/src/api-calls/endpoints/question/models/PracticeQuestion";
import { QuestionType } from "../../../../cshub-shared/src/entities/question";
import { mixins } from "vue-class-component";
import ViewerMixin from "./viewers/ViewerMixin";
import SCQuestionMixin from "./practice/SCQuestionMixin";
import MCQuestionMixin from "./practice/MCQuestionMixin";
import OTQuestionMixin from "./practice/OTQuestionMixin";
import ONQuestionMixin from "./practice/ONQuestionMixin";

@Component({
    name: CurrentPracticeQuestion.name,
    components: { QuestionList, Editors, EditorAccordion }
})
export default class CurrentPracticeQuestion extends mixins(
    ViewerMixin,
    SCQuestionMixin,
    MCQuestionMixin,
    OTQuestionMixin,
    ONQuestionMixin
) {
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
            }
        }
        return "";
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
            });
        } else {
            this.$router.push(Routes.INDEX);
            return;
        }
    }
}
</script>

<style scoped></style>
