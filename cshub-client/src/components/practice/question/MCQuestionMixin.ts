import Vue from "vue";
import Component from "vue-class-component";
import { practiceState } from "../../../store";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { Watch } from "vue-property-decorator";

type MCAnswerType = { [index: number]: boolean };

@Component({
    name: MCQuestionMixin.name,
})
export default class MCQuestionMixin extends Vue {
    private privMcAnswers: MCAnswerType = this.getInitialMcState();

    get mcAnswers(): MCAnswerType {
        if (practiceState.currentCheckedQuestion) {
            if (!practiceState.currentCheckedQuestion.correct) {
                const answer = practiceState.currentCheckedQuestion.correctAnswer;
                if (answer.type === QuestionType.MULTICLOSED) {
                    const correctAnswers: MCAnswerType = {};

                    answer.answerIds.forEach((answer) => (correctAnswers[answer] = true));

                    return {
                        ...this.privMcAnswers,
                        ...correctAnswers,
                    };
                }
            }
        }

        return this.privMcAnswers;
    }

    @Watch("privMcAnswers", {
        deep: true,
    })
    private onPrivMcAnswersUpdate(value: MCAnswerType) {
        const questionIndex = +this.$route.params.index;
        const answerIds: number[] = [];

        for (const key of Object.keys(value)) {
            if (value[+key]) {
                answerIds.push(+key);
            }
        }

        practiceState.addAnswer({
            questionIndex,
            answer: {
                type: QuestionType.MULTICLOSED,
                answerIds: answerIds,
            },
        });
    }

    private getInitialMcState(): MCAnswerType {
        const currentQuestions = practiceState.currentQuestions;
        if (currentQuestions) {
            const savedData = currentQuestions[+this.$route.params.index];

            if (savedData.answer && savedData.answer.type === QuestionType.MULTICLOSED) {
                return savedData.answer.answerIds.reduce((previousValue, currentValue) => {
                    previousValue[currentValue] = true;
                    return previousValue;
                }, {} as MCAnswerType);
            }
        }

        return {} as MCAnswerType;
    }
}
