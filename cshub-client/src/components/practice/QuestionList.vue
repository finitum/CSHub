<template>
    <div>
        <h4 v-if="questionIds.length === 0 && canShowNoQuestionMessage">
            No questions found in this topic (or underlying topics)
        </h4>
        <div v-else>
            <v-list two-line subheader>
                <div v-for="questionId in shownQuestionIds" :key="questionId">
                    <ReviewQuestionListItem v-if="unpublished" :question-id="questionId"></ReviewQuestionListItem>
                    <EditQuestionListItem v-else :question-id="questionId"></EditQuestionListItem>
                </div>
            </v-list>
            <v-pagination
                v-if="questionIds.length > 0"
                v-model="paginationPageState"
                :length="Math.ceil(questionIds.length / 5)"
            ></v-pagination>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { ApiWrapper } from "../../utilities";
import {
    GetEditableQuestions,
    GetQuestions,
    GetUnpublishedQuestions
} from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { EventBus, QUESTIONS_CHANGED } from "../../utilities/EventBus";
import ReviewQuestionListItem from "./ReviewQuestionListItem.vue";
import EditQuestionListItem from "./EditQuestionListItem.vue";
import { uiState } from "../../store";

@Component({
    name: QuestionList.name,
    components: { EditQuestionListItem, ReviewQuestionListItem }
})
export default class QuestionList extends Vue {
    @Prop({
        required: true
    })
    private unpublished!: boolean;

    private questionIds: number[] = [];
    private paginationPageState = 1;

    private canShowNoQuestionMessage = false;

    get shownQuestionIds(): number[] {
        const start = this.paginationPageState * 5 - 5;
        return this.questionIds.slice(start, start + 5);
    }

    private mounted() {
        setTimeout(() => (this.canShowNoQuestionMessage = true), 500);

        EventBus.$on(QUESTIONS_CHANGED, () => {
            this.getData();
        });

        this.getData();
    }

    private destroyed() {
        EventBus.$off(QUESTIONS_CHANGED);
    }

    private getData() {
        if (this.unpublished) {
            ApiWrapper.get(new GetUnpublishedQuestions(Number(uiState.studyNr))).then(questionIds => {
                this.questionIds = questionIds !== null ? questionIds.questionIds : [];
            });
        } else {
            ApiWrapper.get(new GetEditableQuestions(+this.$route.params.hash)).then(questionIds => {
                this.questionIds = questionIds !== null ? questionIds.questionIds : [];
            });
        }
    }
}
</script>
