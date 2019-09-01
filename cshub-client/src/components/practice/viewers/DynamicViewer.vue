<template>
    <div>
        <b>Question:</b>
        <p v-html="renderedQuestion"></p>
        <b>Explanation:</b>
        <p v-html="renderedExplanation"></p>
        <b>Answer:</b>
        <p>{{ answer }}</p>
    </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";

import { mixins } from "vue-class-component";
import ViewerMixin from "./ViewerMixin";
import {
    VariableExpression,
    VariableValue
} from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/Variable";
import { evaluate, generateVariableValues } from "../../../../../cshub-shared/src/utilities/DynamicQuestionUtils";
import { replaceVariablesByValues } from "../DynamicQuestionUtils";

@Component({
    name: DynamicViewer.name
})
export default class DynamicViewer extends mixins(ViewerMixin) {
    @Prop({
        required: true
    })
    private question!: string;

    @Prop({
        required: true
    })
    private explanation!: string;

    @Prop({
        required: true
    })
    private answerExpression!: string;

    @Prop({
        required: true
    })
    private variableExpressions!: VariableExpression[];

    get valuedVariables(): VariableValue[] {
        return generateVariableValues(this.variableExpressions);
    }

    get renderedQuestion() {
        return this.renderMarkdown(replaceVariablesByValues(this.question, this.valuedVariables));
    }

    get renderedExplanation() {
        return this.renderMarkdown(replaceVariablesByValues(this.explanation, this.valuedVariables));
    }

    get answer() {
        return evaluate(this.answerExpression, this.valuedVariables);
    }
}
</script>

<style></style>
