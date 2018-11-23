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
