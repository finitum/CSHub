import Component from "vue-class-component";
import Vue from "vue";

import katex from "katex";
import "katex/dist/katex.min.css";
import { getMarkdownParser } from "../../../../../cshub-shared/src/utilities/MarkdownLatexQuill";
import { colorize } from "../../../utilities/codemirror-colorize";
import CodeMirror from "codemirror";
import { FullQuestionWithId } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { generateVariableValues } from "../../../../../cshub-shared/src/utilities/DynamicQuestionUtils";
import { replaceVariablesByValues } from "../DynamicQuestionUtils";
import { PracticeQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/PracticeQuestion";
import { VariableValue } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/Variable";

@Component({
    name: ViewerMixin.name
})
export default class ViewerMixin extends Vue {
    public markdownParser = getMarkdownParser();

    private beforeCreate() {
        (window as any).katex = katex;
    }

    private highlightCode() {
        colorize(null, CodeMirror);
    }

    public renderMarkdown(text: string): string {
        this.highlightCode();
        return this.markdownParser.render(
            text
                .split("<")
                .join("&lt;")
                .split(">")
                .join("&gt;")
        );
    }

    public getRenderedQuestion(nullQuestion: null): string;
    public getRenderedQuestion(practiceQuestion: PracticeQuestion): string;
    public getRenderedQuestion(fullQuestion: FullQuestionWithId): string;
    public getRenderedQuestion(question: FullQuestionWithId | PracticeQuestion | null): string {
        if (question !== null) {
            if (question.type === QuestionType.DYNAMIC) {
                try {
                    let variableValues: VariableValue[];

                    const fullQuestion = question as FullQuestionWithId;
                    const practiceQuestion = question as PracticeQuestion;
                    if (fullQuestion.type === QuestionType.DYNAMIC && fullQuestion.variableExpressions) {
                        variableValues = generateVariableValues(fullQuestion.variableExpressions);
                    } else if (practiceQuestion.type === QuestionType.DYNAMIC && practiceQuestion.variables) {
                        variableValues = practiceQuestion.variables;
                    } else {
                        throw new Error();
                    }

                    return this.renderMarkdown(replaceVariablesByValues(question.question, variableValues));
                } catch (err) {
                    console.error(err);
                    return "";
                }
            } else {
                return this.renderMarkdown(question.question);
            }
        } else {
            return "";
        }
    }
}
