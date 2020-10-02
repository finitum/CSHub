declare module "markdown-it-katex" {
    import MarkdownIt from "markdown-it";
    function mk(md: MarkdownIt, ...params: any[]): void;
    export = mk;
}
