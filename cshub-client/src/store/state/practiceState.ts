import { Module, Mutation, VuexModule } from "vuex-class-modules";
import { CheckAnswerType } from "../../../../cshub-shared/src/api-calls/endpoints/question/models/CheckAnswer";
import store from "../store";

export interface QuestionType {
    questionId: number;
    answer?: CheckAnswerType;
}

export interface IPracticeState {
    currentQuestions: QuestionType[] | false;
}

@Module
class PracticeState extends VuexModule implements IPracticeState {
    private _currentQuestions: QuestionType[] | false = false;

    get currentQuestions(): QuestionType[] | false {
        return this._currentQuestions;
    }

    @Mutation
    public setCurrentQuestions(value: QuestionType[]) {
        this._currentQuestions = value;
    }

    @Mutation
    public addAnswer(value: { questionIndex: number; answer: CheckAnswerType }) {
        if (this._currentQuestions) {
            this._currentQuestions[value.questionIndex].answer = value.answer;
        }
    }
}

export const practiceStateModule = new PracticeState({
    store,
    name: "practiceStateModule"
});
