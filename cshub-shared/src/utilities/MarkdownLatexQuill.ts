import {BlotConstructor} from "parchment/dist/src/registry";

// @ts-ignore
import mk from "markdown-it-katex";
import MarkdownIt from "markdown-it";

export class MarkdownLatexQuill {

    public static blotName = "mklqx";

    private MarkdownLatexQuillExt: any;

    constructor(private quillObj: any) {}

    public registerQuill = () => {

        const Block: BlotConstructor = this.quillObj.import("blots/block");

        this.MarkdownLatexQuillExt = class extends Block {
        };

        this.MarkdownLatexQuillExt.blotName = MarkdownLatexQuill.blotName;

        // @ts-ignore
        this.MarkdownLatexQuillExt.className = MarkdownLatexQuill.blotName;

        // @ts-ignore
        this.MarkdownLatexQuillExt.tagName = "PRE";

        // @ts-ignore
        this.MarkdownLatexQuillExt.allowedChildren = Block.allowedChildren;

        this.quillObj.register(this.MarkdownLatexQuillExt);
    }

}

export const getMarkdownParser = () => {
    return new MarkdownIt({
        highlight: (str: string, lang: string) => {
            if (lang.length === 0) { lang = "null"; }
            return `<pre data-lang=${lang}><code>${str}</code></pre>`;
        }
    }).use(mk);
};
