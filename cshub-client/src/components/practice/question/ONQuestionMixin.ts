import Vue from "vue";
import Component from "vue-class-component";
import { practiceState } from "../../../store";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { Watch } from "vue-property-decorator";

@Component({
    name: ONQuestionMixin.name
})
export default class ONQuestionMixin extends Vue {
    private privOnAnswer: number | null = this.getInitialOnState();

    get otAnswer(): number | null {
        return this.privOnAnswer;
    }

    @Watch("privOnAnswer", {
        deep: true
    })
    private onPrivOnAnswersUpdate(value: number | null) {
        const questionIndex = +this.$route.params.index;

        if (value !== null) {
            const questionIndex = +this.$route.params.index;
            const currentQuestions = practiceState.currentQuestions;
            practiceState.addAnswer({
                questionIndex,
                answer: {
                    type: QuestionType.OPENNUMBER,
                    number: value
                }
            });
        }
    }

    private getInitialOnState(): number | null {
        const currentQuestions = practiceState.currentQuestions;
        if (currentQuestions) {
            const savedData = currentQuestions[+this.$route.params.index];

            if (savedData.answer && savedData.answer.type === QuestionType.OPENNUMBER) {
                return savedData.answer.number;
            }
        }

        return 0;
    }
}
