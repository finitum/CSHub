import { Module, Mutation, VuexModule } from "vuex-class-modules";
import { CheckAnswerType } from "../../../../cshub-shared/src/api-calls/endpoints/question/models/CheckAnswer";
import store from "../store";
import localforage from "localforage";

export interface QuestionType {
    questionId: number;
    answer: CheckAnswerType | null;
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
    public clear() {
        this._currentQuestions = false;
    }

    @Mutation
    public setCurrentQuestions(value: QuestionType[] | false) {
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

const key = "vuex-practicestate";

practiceStateModule.$watch(
    practiceStateModule => practiceStateModule.currentQuestions,
    (newValue, oldValue) => {
        localforage.setItem(key, newValue);
    },
    {
        deep: true,
        immediate: false
    }
);

const setInitialState = async () => {
    const questions = await localforage.getItem<QuestionType[]>(key);
    if (questions) {
        questions.forEach(question => (question.answer = question.answer || null));
    }
    practiceStateModule.setCurrentQuestions(questions || false);
};

setInitialState();
