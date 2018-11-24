import Quill from "quill";
import {BlotConstructor} from "parchment/dist/src/blot/abstract/blot";

export const blotName = "mklqx";

const Block: BlotConstructor = Quill.import("blots/block");

export class MarkdownLatexQuill extends Block {
}

MarkdownLatexQuill.blotName = blotName;
MarkdownLatexQuill.className = blotName;
MarkdownLatexQuill.tagName = "PRE";

Quill.register(MarkdownLatexQuill);

// @ts-ignore
import mk from "markdown-it-katex";
import MarkdownIt from "markdown-it";

export const markdownParser = new MarkdownIt({
    highlight: (str, lang) => {
        if (lang && (window as any).hljs.getLanguage(lang)) {
            try {
                return (window as any).hljs.highlight(lang, str).value;
            } catch (__) {
                return "";
            }
        }

        return ""; // use external default escaping
    }
}).use(mk);
