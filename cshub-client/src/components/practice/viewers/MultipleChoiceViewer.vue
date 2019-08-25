<template>
    <div>
        <b>Question:</b>
        <p v-html="renderMarkdown(question)"></p>
        <b>Explanation:</b>
        <p v-html="renderMarkdown(explanation)"></p>

        <v-radio-group v-model="radioAnswer" hide-details>
            <div v-for="(answer, i) of answers" :key="answer.id">
                <v-checkbox
                    v-if="multipleCorrect"
                    v-model="answer.correct"
                    readonly
                    hide-details
                    class="shrink mr-2 mt-0"
                >
                    <template v-slot:label>
                        <p class="ma-0 questionContent" v-html="renderMarkdown(answer.answerText)"></p>
                    </template>
                </v-checkbox>
                <v-radio v-else :value="i" readonly hide-details>
                    <template v-slot:label>
                        <p class="ma-0 questionContent" v-html="renderMarkdown(answer.answerText)"></p>
                    </template>
                </v-radio>
            </div>
        </v-radio-group>
    </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";

import { FullClosedAnswerType } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import { mixins } from "vue-class-component";
import ViewerMixin from "./ViewerMixin";

@Component({
    name: "MultipleChoiceViewer"
})
export default class MultipleChoiceViewer extends mixins(ViewerMixin) {
    @Prop({
        required: true
    })
    private multipleCorrect!: boolean;

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
    private answers!: FullClosedAnswerType[];

    get radioAnswer(): number {
        for (let i = 0; i < this.answers.length; i++) {
            if (this.answers[i].correct) {
                return i;
            }
        }

        return -1;
    }

    set radioAnswer(answer: number) {
        // NOOP
    }
}
</script>

<style></style>
