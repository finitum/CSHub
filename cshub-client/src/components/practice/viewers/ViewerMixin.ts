import Component from "vue-class-component";
import Vue from "vue";

import katex from "katex";
import "katex/dist/katex.min.css";
import { getMarkdownParser } from "../../../../../cshub-shared/src/utilities/MarkdownLatexQuill";
import { colorize } from "../../../utilities/codemirror-colorize";
import CodeMirror from "codemirror";

@Component({
    name: ViewerMixin.name
})
export default class ViewerMixin extends Vue {
    public markdownParser = getMarkdownParser();

    private created() {
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
}
