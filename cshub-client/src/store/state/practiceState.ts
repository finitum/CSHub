import { Module, Mutation, VuexModule } from "vuex-class-modules";
import {
    CheckAnswerType,
    CheckedAnswerType
} from "../../../../cshub-shared/src/api-calls/endpoints/question/models/CheckAnswer";
import store from "../store";
import localforage from "localforage";
import Vue from "vue";

export interface StoreQuestionType {
    questionId: number;
    answer: CheckAnswerType | null;
}

export interface IPracticeState {
    currentQuestions: StoreQuestionType[] | false;
    checkedQuestions: (CheckedAnswerType | false)[];
    currentCheckedQuestion: CheckedAnswerType | null;
}

@Module
class PracticeState extends VuexModule implements IPracticeState {
    private _currentQuestions: StoreQuestionType[] | false = false;
    private _checkedQuestions: (CheckedAnswerType | false)[] = [];
    private _currentCheckedQuestion: CheckedAnswerType | null = null;

    get currentQuestions(): StoreQuestionType[] | false {
        return this._currentQuestions;
    }

    get checkedQuestions(): (CheckedAnswerType | false)[] {
        return this._checkedQuestions;
    }

    get currentCheckedQuestion(): CheckedAnswerType | null {
        return this._currentCheckedQuestion;
    }

    @Mutation
    public clear() {
        this._currentQuestions = false;
        this._checkedQuestions = [];
        this._currentCheckedQuestion = null;
    }

    @Mutation
    public setCurrentCheckedQuestion(value: CheckedAnswerType | null) {
        this._currentCheckedQuestion = value;
    }

    @Mutation
    public setCurrentQuestions(value: StoreQuestionType[] | false) {
        this._currentQuestions = value;
    }

    @Mutation
    public setCheckedQuestions(value: (CheckedAnswerType | false)[]) {
        this._checkedQuestions = value;
    }

    @Mutation
    public setCheckedQuestion(value: { value: CheckedAnswerType; index: number }) {
        Vue.set(this._checkedQuestions, value.index, value.value);
        this._currentCheckedQuestion = value.value;
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
        localforage.setItem(`${key}-questions`, newValue);
    },
    {
        deep: true,
        immediate: false
    }
);

practiceStateModule.$watch(
    practiceStateModule => practiceStateModule.checkedQuestions,
    (newValue, oldValue) => {
        localforage.setItem(`${key}-checked`, newValue);
    },
    {
        deep: true,
        immediate: false
    }
);

const setInitialState = async () => {
    const questions = await localforage.getItem<StoreQuestionType[]>(`${key}-questions`);
    if (questions) {
        practiceStateModule.setCurrentQuestions(questions);
    }

    const checked = await localforage.getItem<CheckedAnswerType[]>(`${key}-checked`);
    if (checked) {
        practiceStateModule.setCheckedQuestions(checked);
    }
};

setInitialState();
