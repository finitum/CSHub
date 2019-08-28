import Vue from "vue";
import Component from "vue-class-component";
import { practiceState } from "../../../store";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { Watch } from "vue-property-decorator";

@Component({
    name: OTQuestionMixin.name
})
export default class OTQuestionMixin extends Vue {
    private privOtAnswer: string | null = this.getInitialOtState();

    get otAnswer(): string | null {
        return this.privOtAnswer;
    }

    @Watch("privOtAnswer", {
        deep: true
    })
    private onPrivOtAnswersUpdate(value: string | null) {
        const questionIndex = +this.$route.params.index;

        if (value !== null) {
            const questionIndex = +this.$route.params.index;
            const currentQuestions = practiceState.currentQuestions;
            practiceState.addAnswer({
                questionIndex,
                answer: {
                    type: QuestionType.OPENTEXT,
                    text: value
                }
            });
        }
    }

    private getInitialOtState(): string | null {
        const currentQuestions = practiceState.currentQuestions;
        if (currentQuestions) {
            const savedData = currentQuestions[+this.$route.params.index];

            if (savedData.answer && savedData.answer.type === QuestionType.OPENTEXT) {
                return savedData.answer.text;
            }
        }

        return "";
    }
}
