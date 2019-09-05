<template>
    <div>
        <v-list-item v-if="question !== null">
            <v-list-item-avatar>
                <v-icon>{{ icon }}</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
                <v-list-item-title id="renderedQuestion" v-html="getRenderedQuestion(question)"></v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
                <v-btn icon @click="approve">
                    <v-icon color="green lighten-1">fas fa-thumbs-up</v-icon>
                </v-btn>
                <v-btn icon @click="dissaprove">
                    <v-icon color="red lighten-1">fas fa-thumbs-down</v-icon>
                </v-btn>
                <v-btn icon @click="editQuestionDialog = true">
                    <v-icon color="orange lighten-1">fas fa-edit</v-icon>
                </v-btn>
                <v-btn icon @click="questionDialog = true">
                    <v-icon color="primary lighten-1">fas fa-info</v-icon>
                </v-btn>
            </v-list-item-action>
        </v-list-item>
        <v-dialog v-model="questionDialog">
            <v-card class="pa-4">
                <v-row>
                    <v-col v-if="question !== null" :cols="replacesQuestion !== null ? 6 : 12">
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
                            v-if="type === 'dn'"
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
                            v-if="type === 'dn'"
                            :question="replacesQuestion.question"
                            :explanation="replacesQuestion.explanation"
                            :answer-expression="replacesQuestion.answerExpression"
                            :variable-expressions="replacesQuestion.variableExpressions"
                        ></DynamicViewer>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
        <v-dialog v-model="editQuestionDialog">
            <v-card class="pa-4">
                <MultipleChoiceEditor
                    v-if="type === 'mc'"
                    :prop-multiple-correct="question.multipleCorrect"
                    :prop-question="question.question"
                    :prop-explanation="question.explanation"
                    :prop-answers="question.answers"
                    :is-editing="question.id"
                ></MultipleChoiceEditor>
                <OpenTextEditor
                    v-if="type === 'ot'"
                    :prop-question="question.question"
                    :prop-explanation="question.explanation"
                    :prop-answer="question.answer"
                    :is-editing="question.id"
                ></OpenTextEditor>
                <OpenNumberEditor
                    v-if="type === 'on'"
                    :prop-question="question.question"
                    :prop-explanation="question.explanation"
                    :prop-answer="question.number"
                    :prop-precision="question.precision"
                    :is-editing="question.id"
                ></OpenNumberEditor>
                <DynamicEditor
                    v-if="type === 'dn'"
                    :prop-question="question.question"
                    :prop-explanation="question.explanation"
                    :prop-answer-expression="question.answerExpression"
                    :prop-variable-expression="question.variableExpressions"
                ></DynamicEditor>
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
import ViewerMixin from "./viewers/ViewerMixin";
import DynamicEditor from "./editors/DynamicEditor.vue";
import OpenNumberEditor from "./editors/OpenNumberEditor.vue";
import OpenTextEditor from "./editors/OpenTextEditor.vue";
import MultipleChoiceEditor from "./editors/MultipleChoiceEditor.vue";

@Component({
    name: QuestionListItem.name,
    components: {
        DynamicViewer,
        MultipleChoiceViewer,
        OpenNumberViewer,
        OpenTextViewer,
        DynamicEditor,
        OpenNumberEditor,
        OpenTextEditor,
        MultipleChoiceEditor
    }
})
export default class QuestionListItem extends mixins(QuestionListItemMixin, ViewerMixin) {
    private replacesQuestion: FullQuestionWithId | null = null;

    private questionDialog = false;
    private editQuestionDialog = false;

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

    public dissaprove() {
        if (this.question) {
            ApiWrapper.put(new QuestionSettings(this.question.id, QuestionSettingsEditType.DELETE));
            EventBus.$emit(QUESTIONS_CHANGED);
        }
    }
}
</script>

<style lang="scss">
.renderedQuestion {
    p {
        margin-bottom: 0 !important;
    }
}
</style>
