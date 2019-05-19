import {Settings} from "./SettingsBaseline";
import {JSDOM, VirtualConsole} from "jsdom";
import {Request, Response} from "express";
import {delta2htmlRequest, delta2htmlResponse} from "./classes";
import QuillDefaultOptions from "../../cshub-shared/src/utilities/QuillDefaultOptions";
import {MarkdownLatexQuill} from "../../cshub-shared/src/utilities/MarkdownLatexQuill";
import {getHTML} from "../../cshub-shared/src/utilities/EditsHandler";
import express = require("express");
import bodyParser = require("body-parser");


export const app = express();

app.use(bodyParser.json());

app.use(async (req: Request, res: Response) => {
    const virtualConsole = new VirtualConsole();
    virtualConsole.on("error", (err: any) => {
        console.error(JSON.stringify({
            "message": err,
            "type": "error"
        }));
    });

    virtualConsole.on("warn", (warn: any) => {
        console.error(JSON.stringify({
            "message": warn,
            "type": "warn"
        }));
    });

    const jsdom = new JSDOM(`
    <!DOCTYPE html>
    <html>
        <head>
            <script src="file://${__dirname}/assets/quill.min.js"></script>
            <script src="file://${__dirname}/assets/katex.min.js"></script>
            <script>
                window.onload = () => {
                    console.log("loaded");
                }
            </script>
        </head>
        <body><div id="editor-container"></div></body>
    </html>`, {
        runScripts: "dangerously",
        resources: "usable",
        virtualConsole
    });


    const request: delta2htmlRequest = req.body;
    const delta = request.delta;

    await new Promise((resolve, _) => {
        virtualConsole.on("log", (log: string) => {if (log === "loaded") resolve(jsdom)})
    });

    const window = jsdom.window;
    const document = window.document;

    // @ts-ignore
    document.execCommand = () => {
    };

    window.onerror = (err: any) => {
        console.info("JSDOM Save errors");
        console.info(err.toString());
        console.error(JSON.stringify({
            "message": `JSDOM Save error: ${err}`,
            "type": "error"
        }))
    };

    const container = document.getElementById("editor-container");

    // @ts-ignore
    document.getSelection = function() {
        return {
            getRangeAt: function() {
            }
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
    const html = getHTML(quill, document, window);

    const filteredArr: string[] =
        html
            .toLowerCase()
            .replace(/<(.+?)>/g, " ") // Remove all HTML tags
            .replace(/[^a-zA-Z -]/g, " ") // Remove all non letters (but keep streepjes)
            .replace(/\b[a-zA-Z]{1,3}\b/g, " ") // Remove all words smaller than 3 chars
            .replace(/\s+/g, "\n") // Replace all whitespace by newlines
            .split("\n");


    // @ts-ignore
    const unique = [...new Set(filteredArr)];
    const htmlFiltered = unique.join("");

    const response = new delta2htmlResponse(html, htmlFiltered);
    res.send(response);
});



app.listen(Settings.PORT, () => {
    console.log(JSON.stringify({
        "message": `Started server on port ${Settings.PORT}`,
        "type": "info"
    }))
});
