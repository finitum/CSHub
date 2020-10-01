<template>
    <v-row>
        <v-col cols="6">
            <v-form @submit="submit">
                <v-btn color="primary" @click="submit">Submit</v-btn>

                <p class="mt-5">
                    Use $VariableName to create dynamically assignable variables in your question. For answers and
                    variables you should write a mathematical expression variable to describe this parameter. Use
                    <a href="https://mathjs.org/docs/expressions/syntax.html">MathJS</a> syntax. You can also use your
                    variables here, so if you defined $Variable, you can use $Variable in your answer or variable
                    expressions
                </p>

                <v-textarea
                    v-model="question"
                    v-validate="'required|min:2'"
                    :error-messages="errors.collect('question')"
                    name="question"
                    filled
                    required
                    auto-grow
                    :hide-details="!errors.has('question')"
                    rows="2"
                    label="Question"
                    value="Bla"
                    class="mb-4"
                    @input="inputChanged"
                ></v-textarea>
                <v-textarea
                    v-model="explanation"
                    v-validate="'required|min:2'"
                    :error-messages="errors.collect('explanation')"
                    :hide-details="!errors.has('explanation')"
                    required
                    name="explanation"
                    filled
                    auto-grow
                    rows="3"
                    label="Explanation"
                    value="Bla"
                    class="mt-4"
                    @input="inputChanged"
                ></v-textarea>
                <v-textarea
                    v-model="answerExpression"
                    v-validate="'required|min:2'"
                    :label="`Answer`"
                    filled
                    auto-grow
                    name="answer"
                    :hide-details="!errors.has('answer') && validateVariable(answerExpression)() === true"
                    :rules="[validateVariable(answerExpression)]"
                    :error-messages="errors.collect('answer')"
                    rows="1"
                    class="mr-0 mt-4"
                    @input="inputChanged"
                >
                </v-textarea>

                <v-item-group>
                    <v-row
                        v-for="(value, name) in variableExpressions"
                        :key="name"
                        align="center"
                        class="mt-4 ml-0 mr-0"
                    >
                        <v-textarea
                            v-model="variableExpressions[name]"
                            v-validate="'required|min:1'"
                            :label="`Variable ${name}`"
                            outlined
                            auto-grow
                            :name="`Variable ${name}`"
                            :hide-details="
                                !errors.has(`Variable ${name}`) &&
                                validateVariable(variableExpressions[name])() === true
                            "
                            :error-messages="errors.collect(`Variable ${name}`)"
                            rows="1"
                            :rules="[validateVariable(variableExpressions[name])]"
                            @input="inputChanged"
                        >
                        </v-textarea>
                    </v-row>
                </v-item-group>
            </v-form>
        </v-col>
        <v-col cols="6">
            <DynamicViewer
                :question="question"
                :explanation="explanation"
                :answer-expression="answerExpression"
                :variable-expressions="variableExpressionsParsed"
            ></DynamicViewer>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import ViewerMixin from "../viewers/ViewerMixin";
import { FullQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import { ApiWrapper } from "../../../utilities";
import { AddQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question";
import {
    getVariableNames,
    evaluate,
    generateVariableValues,
} from "../../../../../cshub-shared/src/utilities/DynamicQuestionUtils";
import DynamicViewer from "../viewers/DynamicViewer.vue";
import { uiState } from "../../../store";
import { VariableExpression } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/Variable";
import { replaceVariablesByValues } from "../DynamicQuestionUtils";

type VariableDictionary = { [name: string]: string };

@Component({
    name: "DynamicEditor",
    components: { DynamicViewer },
    inject: ["$validator"],
})
export default class DynamicEditor extends ViewerMixin {
    @Prop({
        required: false,
    })
    private propQuestion?: string;

    @Prop({
        required: false,
    })
    private propExplanation?: string;

    @Prop({
        required: false,
    })
    private propAnswerExpression?: string;

    @Prop({
        required: false,
    })
    private propVariableExpressions?: VariableExpression[];

    private question = this.propQuestion || "";
    private explanation = this.propExplanation || "";

    private answerExpression = this.propAnswerExpression || "";
    private variableExpressions: VariableDictionary = this.getInitialVariableExpressions(); // key = name, value = value

    get variableExpressionsParsed() {
        return Object.keys(this.variableExpressions).map((key) => {
            return {
                expression: this.variableExpressions[key],
                name: key,
            };
        });
    }

    /**
     * Methods
     */
    private async submit() {
        let valid = await this.$validator.validateAll();

        if (valid) {
            const question: FullQuestion = {
                question: this.question,
                explanation: this.explanation,
                answerExpression: this.answerExpression,
                type: QuestionType.DYNAMIC,
                variableExpressions: this.variableExpressionsParsed,
            };

            await ApiWrapper.post(new AddQuestion(question, +this.$route.params.hash));

            uiState.setNotificationDialog({
                header: "Saved",
                text: "Saved question, it will be reviewed by an admin soon!",
                on: true,
            });
        }
    }

    private getInitialVariableExpressions(): VariableDictionary {
        if (this.propVariableExpressions) {
            const propVariables: VariableDictionary = {};
            this.propVariableExpressions.forEach((variable) => (propVariables[variable.name] = variable.expression));
            return propVariables;
        }
        return {};
    }

    private validateVariable(variableExpression: string) {
        return () => {
            try {
                const variables = generateVariableValues(this.variableExpressionsParsed);
                evaluate(variableExpression || "", variables);
                return true;
            } catch (err) {
                return String(err);
            }
        };
    }

    private inputChanged() {
        let expressionValue = "";
        for (const name of Object.keys(this.variableExpressions)) {
            expressionValue += ` ${this.variableExpressions[name]}`;
        }

        const variableNames = getVariableNames(
            `${this.question} ${this.answerExpression} ${this.explanation} ${expressionValue}`,
        );

        variableNames.forEach((variableName) => {
            if (!Object.prototype.hasOwnProperty.call(this.variableExpressions, variableName)) {
                Vue.set(this.variableExpressions, variableName, "");
            }
        });

        Object.keys(this.variableExpressions).forEach((key) => {
            if (!variableNames.includes(key)) {
                Vue.delete(this.variableExpressions, key);
            }
        });
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

.codeblock > * {
    transition: all 20s;
}
</style>
