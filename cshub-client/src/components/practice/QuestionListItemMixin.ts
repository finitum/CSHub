import Vue from "vue";
import Component from "vue-class-component";
import { FullQuestionWithId } from "../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import { Prop } from "vue-property-decorator";
import { QuestionType } from "../../../../cshub-shared/src/entities/question";

@Component({
    name: QuestionListItemMixin.name
})
export default class QuestionListItemMixin extends Vue {
    @Prop({
        required: true
    })
    public questionId!: number;

    public question: FullQuestionWithId | null = null;

    get type(): string {
        if (this.question) {
            switch (this.question.type) {
                case QuestionType.MULTICLOSED:
                case QuestionType.SINGLECLOSED:
                    return "mc";
                case QuestionType.OPENNUMBER:
                    return "on";
                case QuestionType.OPENTEXT:
                    return "ot";
                case QuestionType.DYNAMIC:
                    return "dn";
            }
        }
        return "";
    }

    get icon(): string {
        if (this.question) {
            switch (this.question.type) {
                case QuestionType.MULTICLOSED:
                    return "fas fa-list";
                case QuestionType.SINGLECLOSED:
                    return "fas fa-list-ul";
                case QuestionType.OPENNUMBER:
                    return "fas fa-calculator";
                case QuestionType.OPENTEXT:
                    return "fas fa-font";
                case QuestionType.DYNAMIC:
                    return "fas fa-sync";
            }
        }

        return "";
    }
}
