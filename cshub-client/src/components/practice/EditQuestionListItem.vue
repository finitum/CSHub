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
                <v-btn v-if="isStudyAdmin" icon @click="removeQuestion">
                    <v-icon color="red lighten-1">fas fa-trash</v-icon>
                </v-btn>
                <v-btn icon @click="editQuestionDialog = true">
                    <v-icon color="green lighten-1">fas fa-edit</v-icon>
                </v-btn>
            </v-list-item-action>
        </v-list-item>
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
import { mixins } from "vue-class-component";
import QuestionListItemMixin from "./QuestionListItemMixin";
import MultipleChoiceEditor from "./editors/MultipleChoiceEditor.vue";
import OpenTextEditor from "./editors/OpenTextEditor.vue";
import OpenNumberEditor from "./editors/OpenNumberEditor.vue";
import { userState } from "../../store";
import DynamicEditor from "./editors/DynamicEditor.vue";

@Component({
    name: QuestionListItem.name,
    components: { DynamicEditor, OpenNumberEditor, OpenTextEditor, MultipleChoiceEditor }
})
export default class QuestionListItem extends mixins(QuestionListItemMixin) {
    private editQuestionDialog = false;

    get isStudyAdmin(): boolean {
        return userState.isStudyAdmin;
    }

    private created() {
        ApiWrapper.get(new GetFullQuestion(this.questionId)).then(question => {
            this.question = question !== null ? question.question : null;
        });
    }

    private removeQuestion() {
        if (this.question) {
            ApiWrapper.put(new QuestionSettings(this.question.id, QuestionSettingsEditType.DELETE));
        }
    }
}
</script>
