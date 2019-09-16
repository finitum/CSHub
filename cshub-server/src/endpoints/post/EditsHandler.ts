import { MarkdownLatexQuill } from "../../../../cshub-shared/src/utilities/MarkdownLatexQuill";
import { JSDOM, VirtualConsole } from "jsdom";
import QuillDefaultOptions from "../../../../cshub-shared/src/utilities/QuillDefaultOptions";
import logger from "../../utilities/Logger";
import { getHTML } from "../../../../cshub-shared/src/utilities/EditsHandler";

process.on("message", delta => {
    logger.info("SPAWNED")
    const virtualConsole = new VirtualConsole();
    virtualConsole.on("error", err => {
        logger.info(err);
    });

    virtualConsole.on("warn", warn => {
        logger.info(warn);
    });

    const jsdom = new JSDOM(
        `
    <!DOCTYPE html>
    <html>
        <head>
            <script src="file://${__dirname}/assets/quill.min.js"></script>
            <script src="file://${__dirname}/assets/katex.min.js"></script>
        </head>
        <body><div id="editor-container"></div></body>
    </html>`,
        {
            runScripts: "dangerously",
            resources: "usable",
            virtualConsole
        }
    );

    const window = jsdom.window;
    const document = window.document;

    // @ts-ignore (quill wants to execute but JSDom doesn't have it)
    document.execCommand = () => {};

    window.onerror = err => {
        logger.info("JSDOM Save errors");
        logger.info(err.toString());
        process.emit("warning", err as any);
    };

    window.onload = () => {
        const container = document.getElementById("editor-container");

        // @ts-ignore
        document.getSelection = function() {
            return {
                getRangeAt: function() {}
            };
        };
        // @ts-ignore
        const quillWindow = window.Quill;

        const options = QuillDefaultOptions;
        delete options.modules.cursors;
        delete options.modules.resize;

        const quill = new quillWindow(container, options);
        const markdownParser = new MarkdownLatexQuill(quillWindow);
        markdownParser.registerQuill();
        quill.setContents(delta);
        const html = getHTML(quill, document);

        const filteredArr: string[] = html
            .toLowerCase()
            .replace(/<(.+?)>/g, " ") // Remove all HTML tags
            .replace(/[^a-zA-Z -]/g, " ") // Remove all non letters (but keep streepjes)
            .replace(/\b[a-zA-Z]{1,3}\b/g, " ") // Remove all words smaller than 3 chars
            .replace(/\s+/g, "\n") // Replace all whitespace by newlines
            .split("\n");

        const unique = [...new Set(filteredArr)];
        const htmlFiltered = unique.join("");

        if (process.send) {
            logger.info("SENDING");
            process.send({ html, indexWords: htmlFiltered });
        }
    };
});
