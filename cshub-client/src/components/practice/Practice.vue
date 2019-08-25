<template>
    <div>
        <v-expansion-panels v-model="currentOption">
            <EditorAccordion title="Practice" subtitle="Practice a bunch of questions">
                <v-select
                    v-model="amountOfQuestions"
                    :items="amountOfQuestionsOptions"
                    filled
                    label="Amount of questions"
                ></v-select>
                <v-btn small color="primary" @click="startPractice">Start</v-btn>
            </EditorAccordion>
            <EditorAccordion
                v-if="isLoggedIn"
                title="Add new questions"
                subtitle="Upon adding new questions, they will be reviewed by admins before they become public.
                            There are multiple types of questions which you can add"
            >
                <Editors></Editors>
            </EditorAccordion>
            <EditorAccordion
                v-if="isLoggedIn"
                title="Edit"
                subtitle="Edit existing questions to make all the questions even better!"
            >
                <QuestionList :key="$route.fullPath" :unpublished="false"></QuestionList>
            </EditorAccordion>
            <EditorAccordion
                v-if="isStudyAdmin"
                title="Review"
                subtitle="Hi admin, please review these new questions :)"
            >
                <QuestionList :key="$route.fullPath" :unpublished="true"></QuestionList>
            </EditorAccordion>
        </v-expansion-panels>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import EditorAccordion from "./editors/EditorAccordion.vue";
import Editors from "./editors/Editors.vue";
import { ApiWrapper } from "../../utilities";
import { GetQuestions } from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { practiceState, userState } from "../../store";
import QuestionList from "./QuestionList.vue";
import { Routes } from "../../../../cshub-shared/src/Routes";

@Component({
    name: "Practice",
    components: { QuestionList, Editors, EditorAccordion }
})
export default class Practice extends Vue {
    private amountOfQuestions: number | string = 10;
    private amountOfQuestionsOptions = [5, 10, 15, 20, 25, 50, "All"];

    private currentOption = 0;

    get isStudyAdmin(): boolean {
        return userState.isStudyAdmin;
    }

    get isLoggedIn(): boolean {
        return userState.isLoggedIn;
    }

    private async startPractice() {
        const amountOfQuestions: number | undefined =
            this.amountOfQuestions === "All" ? undefined : +this.amountOfQuestions;

        const questions = await ApiWrapper.get(new GetQuestions(+this.$route.params.hash, amountOfQuestions));

        if (questions) {
            practiceState.setCurrentQuestions(
                questions.questionIds.map(id => {
                    return {
                        questionId: id,
                        answer: null
                    };
                })
            );

            this.$router.push(Routes.QUESTION.replace(":index", "0"));
        }
    }
}
</script>

<style scoped></style>
