<template>
    <div>
        <v-list-item v-if="question !== null">
            <v-list-item-avatar>
                <v-icon>{{ icon }}</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
                <v-list-item-title v-text="question.question"></v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
                <v-btn icon @click="approve">
                    <v-icon color="green lighten-1">fas fa-thumbs-up</v-icon>
                </v-btn>
                <v-btn icon @click="questionDialog = true">
                    <v-icon color="primary lighten-1">fas fa-info</v-icon>
                </v-btn>
            </v-list-item-action>
        </v-list-item>
        <v-dialog v-model="questionDialog">
            <v-card class="pa-4">
                <v-row>
                    <v-col :cols="replacesQuestion !== null ? 6 : 12">
                        <b v-if="replacesQuestion !== null">New question:</b>
                        <MultipleChoiceViewer
                            v-if="type === 'mc'"
                            :multiple-correct="question.multipleCorrect"
                            :question="question.question"
                            :explanation="question.explanation"
                            :answers="question.answers"
                        ></MultipleChoiceViewer>
                        <OpenTextViewer
                            v-if="type === 'ot'"
                            :question="question.question"
                            :explanation="question.explanation"
                            :answer="question.answer"
                        ></OpenTextViewer>
                        <OpenNumberViewer
                            v-if="type === 'on'"
                            :question="question.question"
                            :explanation="question.explanation"
                            :answer="question.number"
                            :precision="question.precision"
                        ></OpenNumberViewer>
                        <DynamicViewer
                            :question="question.question"
                            :explanation="question.explanation"
                            :answer-expression="question.answerExpression"
                            :variable-expressions="question.variableExpressions"
                        ></DynamicViewer>
                    </v-col>
                    <v-col v-if="replacesQuestion !== null" cols="6">
                        <b>Original question:</b>
                        <MultipleChoiceViewer
                            v-if="type === 'mc'"
                            :multiple-correct="replacesQuestion.multipleCorrect"
                            :question="replacesQuestion.question"
                            :explanation="replacesQuestion.explanation"
                            :answers="replacesQuestion.answers"
                        ></MultipleChoiceViewer>
                        <OpenTextViewer
                            v-if="type === 'ot'"
                            :question="replacesQuestion.question"
                            :explanation="replacesQuestion.explanation"
                            :answer="replacesQuestion.answer"
                        ></OpenTextViewer>
                        <OpenNumberViewer
                            v-if="type === 'on'"
                            :question="replacesQuestion.question"
                            :explanation="replacesQuestion.explanation"
                            :answer="replacesQuestion.number"
                            :precision="replacesQuestion.precision"
                        ></OpenNumberViewer>
                        <DynamicViewer
                            :question="replacesQuestion.question"
                            :explanation="replacesQuestion.explanation"
                            :answer-expression="replacesQuestion.answerExpression"
                            :variable-expressions="replacesQuestion.variableExpressions"
                        ></DynamicViewer>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { ApiWrapper } from "../../utilities";
import {
    GetFullQuestion,
    QuestionSettings,
    QuestionSettingsEditType
} from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { FullQuestionWithId } from "../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import OpenTextViewer from "./viewers/OpenTextViewer.vue";
import OpenNumberViewer from "./viewers/OpenNumberViewer.vue";
import MultipleChoiceViewer from "./viewers/MultipleChoiceViewer.vue";
import { EventBus, QUESTIONS_CHANGED } from "../../utilities/EventBus";
import { mixins } from "vue-class-component";
import QuestionListItemMixin from "./QuestionListItemMixin";
import DynamicViewer from "./viewers/DynamicViewer.vue";

@Component({
    name: QuestionListItem.name,
    components: { DynamicViewer, MultipleChoiceViewer, OpenNumberViewer, OpenTextViewer }
})
export default class QuestionListItem extends mixins(QuestionListItemMixin) {
    private replacesQuestion: FullQuestionWithId | null = null;

    private questionDialog = false;

    private created() {
        ApiWrapper.get(new GetFullQuestion(this.questionId)).then(question => {
            if (question) {
                this.question = question.question;
            }

            if (this.question && this.question.replacesQuestion) {
                ApiWrapper.get(new GetFullQuestion(this.question.replacesQuestion)).then(replacesQuestion => {
                    this.replacesQuestion = replacesQuestion !== null ? replacesQuestion.question : null;
                });
            }
        });
    }

    public approve() {
        if (this.question) {
            ApiWrapper.put(new QuestionSettings(this.question.id, QuestionSettingsEditType.APPROVE));
            EventBus.$emit(QUESTIONS_CHANGED);
        }
    }
}
</script>
