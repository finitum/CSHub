<template>
    <v-row>
        <v-col cols="6">
            <v-form @submit="submit">
                <v-btn color="primary" @click="submit">Submit</v-btn>
                <v-textarea
                    v-model="question"
                    v-validate="'required|min:2'"
                    :error-messages="errors.collect('question')"
                    name="question"
                    filled
                    required
                    auto-grow
                    rows="2"
                    label="Question"
                    value="Bla"
                    class="mb-4 mt-4"
                    hide-details
                ></v-textarea>
                <v-textarea
                    v-model="explanation"
                    v-validate="'required|min:2'"
                    :error-messages="errors.collect('explanation')"
                    required
                    name="explanation"
                    filled
                    auto-grow
                    rows="3"
                    label="Explanation"
                    value="Bla"
                    class="mb-4"
                    hide-details
                ></v-textarea>
                <v-text-field
                    v-model="answer"
                    v-validate="'required|min:2'"
                    label="Answer"
                    outlined
                    name="answer"
                    :error-messages="errors.collect('answer')"
                    hide-details
                >
                </v-text-field>
            </v-form>
        </v-col>
        <v-col cols="6">
            <OpenTextViewer :question="question" :explanation="explanation" :answer="answer"></OpenTextViewer>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { ApiWrapper } from "../../../utilities";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { AddQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question";
import { FullQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import OpenTextViewer from "../viewers/OpenTextViewer.vue";

@Component({
    name: OpenTextEditor.name,
    components: { OpenTextViewer },
    inject: ["$validator"]
})
export default class OpenTextEditor extends Vue {
    private question = "";
    private explanation = "";

    private answer: string = "";

    private async submit() {
        let valid = await this.$validator.validateAll();

        if (valid) {
            const question: FullQuestion = {
                question: this.question,
                explanation: this.explanation,
                type: QuestionType.OPENTEXT,
                answer: this.answer
            };

            await ApiWrapper.post(new AddQuestion(question, +this.$route.params.hash));
        }
    }
}
</script>

<style>
.multiple-choice-textarea .v-text-field__slot {
    margin-right: 0 !important;
}

.questionContent p {
    margin-bottom: 0 !important;
}
</style>
