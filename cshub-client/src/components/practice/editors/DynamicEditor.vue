<template>
    <v-row>
        <v-col cols="6">
            <v-form @submit="submit">
                <v-btn color="primary" @click="submit">Submit</v-btn>

                <p class="mt-5">Use $VariableName to create dynamically assignable variables in your question.</p>

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
                    @keyup="questionChanged"
                ></v-textarea>

                <v-item-group>
                    <v-row>
                        <p v-if="variables.length > 0" class="mt-5">
                            Write a mathematical expression as a function of the <i>seed</i> variable to describe this
                            parameter. Use <a href="https://mathjs.org/docs/expressions/syntax.html">MathJS</a> syntax.
                        </p>
                    </v-row>
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

                    <v-row>
                        <v-text-field
                            v-model="seed.minimum"
                            label="Min seed value"
                            max="10000"
                            min="0"
                            step="1"
                            type="number"
                            class="ma-2"
                            value="0"
                        ></v-text-field>
                        <v-text-field
                            v-model="seed.maximum"
                            label="Max seed value"
                            max="10000"
                            min="0"
                            step="1"
                            type="number"
                            class="ma-2"
                            value="10"
                        ></v-text-field>
                    </v-row>

                    <v-row>
                        <p class="mt-5">
                            Write a mathematical expression as a function of the parameters used in the assignment. Use
                            <a href="https://mathjs.org/docs/expressions/syntax.html">MathJS</a> syntax.
                        </p>
                    </v-row>
                    <v-row align="center" class="mb-4 ml-0 mr-0">
                        <v-textarea
                            v-model="answer.answer"
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
import {
    DynamicQuestionVariable,
    FullAnswerType,
    SeedRange
} from "../../../../../cshub-shared/src/api-calls/endpoints/question/AddQuestion";
import { evaluate } from "mathjs";
import ViewerMixin from "../viewers/ViewerMixin";

@Component({
    name: "DynamicEditor",
    inject: ["$validator"]
})
export default class DynamicEditor extends ViewerMixin {
    private question: string = "";
    private variables: DynamicQuestionVariable[] = [];
    private answer: FullAnswerType = {
        type: QuestionType.DYNAMIC,
        answer: ""
    };
    private seed: number = 0;

    private range: SeedRange = {
        minimum: 0,
        maximum: 100
    };

    get _range() {
        return [this.range.minimum, this.range.maximum];
    }

    set _range(value) {
        this.range.minimum = value[0];
        this.range.maximum = value[1];
    }

    private validateVariable(variable: DynamicQuestionVariable) {
        return () => {
            try {
                evaluate(variable.code);
                return true;
            } catch (err) {
                return String(err);
            }
        };
    }

    private async submit() {
        let valid = await this.$validator.validateAll();

        // if (valid) {
        //     if (!this.multipleCorrect) {
        //         this.answers[this.radioAnswer].correct = true;
        //     }
        //
        //     const question: FullQuestion = {
        //         question: this.question,
        //         explanation: this.explanation,
        //         type: this.multipleCorrect ? QuestionType.MULTICLOSED : QuestionType.SINGLECLOSED,
        //         answers: this.answers
        //     };
        //
        //     await ApiWrapper.post(new AddQuestion(question, +this.$route.params.hash));
        // }
    }

    private async questionChanged() {
        const regex = /\$([a-zA-Z_$][a-zA-Z_$0-9]*)/g;
        let match: RegExpExecArray | null;
        this.variables = [];
        while ((match = regex.exec(this.question))) {
            this.variables.push({
                code: "",
                name: match[1]
            });
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

.codeblock > * {
    transition: all 20s;
}
</style>
