import Vue from "vue";
import Component from "vue-class-component";
import { practiceState } from "../../../store";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";

@Component({
    name: SCQuestionMixin.name
})
export default class SCQuestionMixin extends Vue {
    private privScAnswer: number | null = this.getInitialScState();

    get scAnswer(): number | null {
        return this.privScAnswer;
    }

    set scAnswer(value: number | null) {
        this.privScAnswer = value;

        if (value !== null) {
            const questionIndex = +this.$route.params.index;
            const currentQuestions = practiceState.currentQuestions;
            practiceState.addAnswer({
                questionIndex,
                answer: {
                    type: QuestionType.SINGLECLOSED,
                    answerId: value
                }
            });
        }
    }

    private getInitialScState(): number | null {
        const currentQuestions = practiceState.currentQuestions;
        if (currentQuestions) {
            const savedData = currentQuestions[+this.$route.params.index];

            if (savedData.answer && savedData.answer.type === QuestionType.SINGLECLOSED) {
                return savedData.answer.answerId;
            }
        }

        return null;
    }
}
