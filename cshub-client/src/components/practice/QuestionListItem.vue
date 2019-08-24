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
                <v-btn icon>
                    <v-icon color="grey lighten-1" @click="questionDialog = true">fas fa-info</v-icon>
                </v-btn>
            </v-list-item-action>
        </v-list-item>
        <v-dialog v-model="questionDialog">
            <v-card class="pa-4">
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
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { ApiWrapper } from "../../utilities";
import { GetFullQuestion } from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { FullQuestionWithId } from "../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import { QuestionType } from "../../../../cshub-shared/src/entities/question";
import OpenTextViewer from "./viewers/OpenTextViewer.vue";
import OpenNumberViewer from "./viewers/OpenNumberViewer.vue";
import MultipleChoiceViewer from "./viewers/MultipleChoiceViewer.vue";

@Component({
    name: QuestionListItem.name,
    components: { MultipleChoiceViewer, OpenNumberViewer, OpenTextViewer }
})
export default class QuestionListItem extends Vue {
    @Prop({
        required: true
    })
    private questionId!: number;

    private question: FullQuestionWithId | null = null;

    private questionDialog = false;

    get type(): string {
        if (this.question) {
            switch (this.question.type) {
                case QuestionType.MULTICLOSED:
                case QuestionType.SINGLECLOSED:
                    return "mc";
                case QuestionType.OPENNUMBER:
                    return "on";
                case QuestionType.OPENTEXT:
                    return "ot";
            }
        }
        return "";
    }

    get icon(): string {
        if (this.question) {
            switch (this.question.type) {
                case QuestionType.MULTICLOSED:
                    return "fas fa-list";
                case QuestionType.SINGLECLOSED:
                    return "fas fa-list-ul";
                case QuestionType.OPENNUMBER:
                    return "fas fa-calculator";
                case QuestionType.OPENTEXT:
                    return "fas fa-font";
            }
        }

        return "";
    }

    private async created() {
        const question = await ApiWrapper.get(new GetFullQuestion(this.questionId));
        this.question = question !== null ? question.question : null;
    }
}
</script>
