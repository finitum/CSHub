<template>
    <div>
        <h4 v-if="questionIds.length === 0 && canShowNoQuestionMessage">
            No questions found in this topic (or underlying topics)
        </h4>
        <div v-else>
            <v-list two-line subheader>
                <QuestionListItem
                    v-for="questionId in shownQuestionIds"
                    :key="questionId"
                    :question-id="questionId"
                ></QuestionListItem>
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
import { GetQuestions, GetUnpublishedQuestions } from "../../../../cshub-shared/src/api-calls/endpoints/question";
import QuestionListItem from "./QuestionListItem.vue";

@Component({
    name: QuestionList.name,
    components: { QuestionListItem }
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

    private async mounted() {
        setTimeout(() => (this.canShowNoQuestionMessage = true), 500);

        if (this.unpublished) {
            const questionIds = await ApiWrapper.get(new GetUnpublishedQuestions(+this.$route.params.hash));
            this.questionIds = questionIds !== null ? questionIds.questionIds : [];
        } else {
            const questionIds = await ApiWrapper.get(new GetQuestions(+this.$route.params.hash));
            this.questionIds = questionIds !== null ? questionIds.questionIds : [];
        }
    }
}
</script>
