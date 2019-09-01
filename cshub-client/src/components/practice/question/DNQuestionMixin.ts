import Vue from "vue";
import Component from "vue-class-component";
import { practiceState } from "../../../store";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { VariableValue } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/Variable";

@Component({
    name: DNQuestionMixin.name
})
export default class DNQuestionMixin extends Vue {
    private privDnAnswer: string | number | null = this.getInitialDnState();
    public variableValues: VariableValue[] = [];

    get dnAnswer(): string | number | null {
        return this.privDnAnswer;
    }

    set dnAnswer(value: string | number | null) {
        if (value !== null) {
            let valueAsStringOrNumber: string | number = Number(value);
            if (isNaN(valueAsStringOrNumber)) {
                valueAsStringOrNumber = value;
            }

            const questionIndex = +this.$route.params.index;
            practiceState.addAnswer({
                questionIndex,
                answer: {
                    type: QuestionType.DYNAMIC,
                    answer: valueAsStringOrNumber,
                    variables: this.variableValues
                }
            });
        }
    }

    private getInitialDnState(): string | number | null {
        const currentQuestions = practiceState.currentQuestions;
        if (currentQuestions) {
            const savedData = currentQuestions[+this.$route.params.index];

            if (savedData.answer && savedData.answer.type === QuestionType.DYNAMIC) {
                return savedData.answer.answer;
            }
        }

        return "";
    }
}
