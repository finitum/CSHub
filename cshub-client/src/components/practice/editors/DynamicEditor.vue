<template>
    <v-row>
        <v-col cols="6">
            <v-form @submit="submit">
                <v-btn color="primary" @click="submit">Submit</v-btn>

                <p class="mt-5">Use $VariableName to create dynamically assignable variables in your question.</p>

                <v-row>
                    <p v-if="variables.length > 0" class="mt-5">
                        Write a mathematical expression as a function of the <i>seed</i> variable to describe this
                        parameter. Use <a href="https://mathjs.org/docs/expressions/syntax.html">MathJS</a> syntax.
                    </p>
                </v-row>

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
                    class="mb-4"
                    hide-details
                    @keyup="inputChanged"
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
                    class="mt-4"
                    @keyup="inputChanged"
                ></v-textarea>

                <v-item-group>
                    <v-row v-for="(variable, i) of variables" :key="i" align="center" class="mb-4 ml-0 mr-0">
                        <v-textarea
                            v-model="variable.code"
                            v-validate="'required|min:2'"
                            :label="`Variable ${variable.name}`"
                            outlined
                            auto-grow
                            :name="`variable${i}`"
                            :error-messages="errors.collect(`answer${i}`)"
                            rows="1"
                            class="mr-0 multiple-choice-textarea"
                            :rules="[validateVariable(variable)]"
                        >
                        </v-textarea>
                    </v-row>
                    <v-row align="center" class="mb-4 ml-0 mr-0">
                        <v-textarea
                            v-model="answer"
                            v-validate="'required|min:2'"
                            :label="`Answer`"
                            outlined
                            auto-grow
                            :name="`Answer`"
                            :error-messages="errors.collect(`answer`)"
                            rows="1"
                            class="mr-0 multiple-choice-textarea"
                            hide-details
                            messages="hello world"
                            @keyup="inputChanged"
                        >
                        </v-textarea>
                    </v-row>
                </v-item-group>
            </v-form>
        </v-col>
        <v-col cols="6">
            <b>Question:</b>
            <p v-html="renderMarkdown(question)"></p>
            <!--            <b>Explanation:</b>-->
            <!--            <p v-html="renderMarkdown(explanation)"></p>-->

            <v-item-group>
                <div v-for="(variable, i) of variables" :key="i" align="center" class="mb-4 ml-0 mr-0">
                    <v-row>
                        <p v-html="`Variable ${variable.name}:`"></p>
                    </v-row>
                    <v-row>
                        <p
                            v-show="variable.code"
                            class="ma-0 questionContent codeblock"
                            v-html="renderMarkdown('```\n' + variable.code + '\n```')"
                        ></p>
                    </v-row>
                </div>

                <v-row>
                    <p v-html="'Answer:'"></p>
                </v-row>
                <v-row>
                    <p
                        v-show="answer.answer"
                        class="ma-0 questionContent"
                        v-html="renderMarkdown('```javascript\n' + answer.answer + '\n```')"
                    ></p>
                </v-row>
            </v-item-group>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import ViewerMixin from "../viewers/ViewerMixin";
import { FullQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import { ApiWrapper } from "../../../utilities";
import { AddQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question";

@Component({
    name: "DynamicEditor",
    inject: ["$validator"]
})
export default class DynamicEditor extends ViewerMixin {
    private question = "";
    private explanation = "";
    private answerExpression = "";

    private variableExpressions: { [name: string]: string } = {};

    private async submit() {
        let valid = await this.$validator.validateAll();

        if (valid) {
            const question: FullQuestion = {
                question: this.question,
                explanation: this.explanation,
                answerExpression: this.answerExpression,
                type: QuestionType.DYNAMIC,
                variableExpressions: []
            };

            await ApiWrapper.post(new AddQuestion(question, +this.$route.params.hash));
        }
    }

    private async inputChanged() {}
}
</script>

<style>
.dynamic-question-textarea .v-text-field__slot {
    margin-right: 0 !important;
}

.questionContent p {
    margin-bottom: 0 !important;
}

.codeblock > * {
    transition: all 20s;
}
</style>
