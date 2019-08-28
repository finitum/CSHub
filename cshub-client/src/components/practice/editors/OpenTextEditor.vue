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
import { Component, Prop } from "vue-property-decorator";

import { ApiWrapper } from "../../../utilities";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { AddQuestion, EditQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question";
import { FullQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import OpenTextViewer from "../viewers/OpenTextViewer.vue";
import { EventBus, QUESTIONS_CHANGED } from "../../../utilities/EventBus";
import {uiState} from "../../../store";

@Component({
    name: OpenTextEditor.name,
    components: { OpenTextViewer },
    inject: ["$validator"]
})
export default class OpenTextEditor extends Vue {
    @Prop({
        required: false
    })
    private propQuestion?: string;

    @Prop({
        required: false
    })
    private propExplanation?: string;

    @Prop({
        required: false
    })
    private propAnswer?: string;

    @Prop({
        required: true
    })
    private isEditing!: false | number;

    private question = this.propQuestion || "";
    private explanation = this.propExplanation || "";

    private answer: string = this.propAnswer || "";

    private async submit() {
        let valid = await this.$validator.validateAll();

        if (valid) {
            const question: FullQuestion = {
                question: this.question,
                explanation: this.explanation,
                type: QuestionType.OPENTEXT,
                answer: this.answer
            };

            if (this.isEditing) {
                await ApiWrapper.put(new EditQuestion(question, this.isEditing));
            } else {
                await ApiWrapper.post(new AddQuestion(question, +this.$route.params.hash));
            }

            uiState.setNotificationDialog({
                header: "Saved",
                text: "Saved question, it will be reviewed by an admin soon!",
                on: true
            });

            EventBus.$emit(QUESTIONS_CHANGED);
        }
    }
}
</script>

<style>
.dynamic-question-textarea .v-text-field__slot {
    margin-right: 0 !important;
}

.questionContent p {
    margin-bottom: 0 !important;
}
</style>
