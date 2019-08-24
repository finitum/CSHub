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
                    v-validate="'required|decimal'"
                    label="Answer"
                    outlined
                    type="number"
                    name="answer"
                    :error-messages="errors.collect('answer')"
                    class="mb-4"
                    hide-details
                >
                </v-text-field>
                <v-text-field
                    v-model="precision"
                    v-validate="'required|decimal'"
                    label="Precision"
                    outlined
                    type="number"
                    name="precision"
                    :error-messages="errors.collect('precision')"
                    hide-details
                >
                </v-text-field>
            </v-form>
        </v-col>
        <v-col cols="6">
            <OpenNumberViewer
                :question="question"
                :explanation="explanation"
                :answer="answer"
                :precision="precision"
            ></OpenNumberViewer>
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
import OpenNumberViewer from "../viewers/OpenNumberViewer.vue";

@Component({
    name: OpenNumberEditor.name,
    components: { OpenNumberViewer },
    inject: ["$validator"]
})
export default class OpenNumberEditor extends Vue {
    private question = "";
    private explanation = "";

    private answer: number = 0;
    private precision: number = 0.01;

    private async submit() {
        let valid = await this.$validator.validateAll();

        if (valid) {
            const question: FullQuestion = {
                question: this.question,
                explanation: this.explanation,
                type: QuestionType.OPENNUMBER,
                number: this.answer,
                precision: this.precision
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
