import {Request, Response} from "express";

import {app, logger} from "../../";

import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";
import {EditPost, EditPostCallback, EditPostReturnTypes} from "../../../../cshub-shared/src/api-calls/pages/EditPost";
import {hasAccessToPost, postAccessType} from "../../auth/validateRights/PostAccess";
import {validateMultipleInputs} from "../../utilities/StringUtils";
import {JSDOM} from "jsdom";
import Delta from "quill-delta/dist/Delta";

import {MarkdownLatexQuill, getMarkdownParser} from "../../../../cshub-shared/src/utilities/MarkdownLatexQuill";
import QuillDefaultOptions from "../../../../cshub-shared/src/utilities/QuillDefaultOptions";

app.post(EditPost.getURL, (req: Request, res: Response) => {

    const editPostRequest: EditPost = req.body as EditPost;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({input: editPostRequest.postHash}, {input: editPostRequest.postTitle}, {input: editPostRequest.postTopicHash});

    if (inputsValidation.valid && userObj.valid) {
        hasAccessToPost(editPostRequest.postHash, req.cookies["token"])
            .then((approved: postAccessType) => {
                if (approved.access) {
                    const userIsAdmin = userObj.tokenObj.user.admin;

                    if (userIsAdmin) {
                        return query(`
                          UPDATE posts
                          SET title       = ?,
                              topic       = (SELECT id
                                             FROM topics
                                             WHERE hash = ?),
                              postVersion = postVersion + 1
                          WHERE id = (SELECT id FROM posts WHERE hash = ?)
                        `, editPostRequest.postTitle, editPostRequest.postTopicHash, editPostRequest.postHash)
                            .then(() => {
                                return query(`
                                  SELECT content, approved
                                  FROM edits
                                  WHERE post = (
                                    SELECT id
                                    FROM posts
                                    WHERE hash = ?
                                  )
                                  ORDER BY datetime ASC
                                `, editPostRequest.postHash)
                            })
                            .then((edits: DatabaseResultSet) => {
                                const rows = edits.convertRowsToResultObjects();
                                const lastRow = rows[rows.length - 1];
                                if (lastRow.getNumberFromDB("approved") !== 0) {
                                    res.json(new EditPostCallback(EditPostReturnTypes.NOTHINGTOUPDATE));
                                } else {
                                    res.json(new EditPostCallback(EditPostReturnTypes.SUCCESS));

                                    let delta = new Delta(JSON.parse(rows[0].getStringFromDB("content")));

                                    for (let i = 1; i < rows.length; i++) {
                                        const currRow = rows[i];
                                        delta = delta.compose(JSON.parse(currRow.getStringFromDB("content")));
                                    }

                                    const jsdom = new JSDOM(`
                                        <!DOCTYPE html>
                                        <head>
                                            <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.22/MutationObserver.js"></script>
                                            <script src="https://unpkg.com/highlight.js@9.12.0/lib/highlight.js"></script>
                                            <script src="https://unpkg.com/quill@2.0.0-dev.3/dist/quill.min.js"></script>
                                            <script src="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.js"></script>
                                        </head>
                                        <body><div id="editor-container"></div></body>`, {
                                        runScripts: "dangerously",
                                        resources: "usable"
                                    });

                                    const window = jsdom.window;

                                    window.onload = () => {
                                        const document = window.document;
                                        const container = document.getElementById("editor-container");

                                        // @ts-ignore
                                        document.getSelection = function () {
                                            return {
                                                getRangeAt: function () {
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

                                        query(`
                                          UPDATE edits
                                          SET approved    = 1,
                                              approvedBy  = ?,
                                              htmlContent = ?
                                          WHERE post = (
                                            SELECT id
                                            FROM posts
                                            WHERE hash = ?
                                          )
                                            AND approved = 0
                                          ORDER BY datetime DESC
                                          LIMIT 1
                                        `, userObj.tokenObj.user.id, getHTML(quill, document, window), editPostRequest.postHash)
                                    };

                                }
                            })
                            .catch(err => {
                                logger.error(`Editing failed`);
                                logger.error(err);
                                res.status(500).send();
                            });
                    } else {
                        res.status(401).send();
                    }
                }
            });
    } else {
        res.status(401).send();
    }

});

const getHTML = (quillEditor: any, document: Document, window: Window) => {
    const node = quillEditor.container.firstChild;

    // Converts the classes of all the code blocks so that hljs can highlight them properly
    const allNodes: any[] = [...node.getElementsByTagName("*")];

    let prevElement: {
        isCodeBlock: boolean,
        isMarkdownBlock: boolean,
        lang?: string,
        containerNode?: HTMLElement,
        currString?: string
    } = {
        isCodeBlock: false,
        isMarkdownBlock: false
    };

    const finalizeCodeBlock = () => {
        if (prevElement.isCodeBlock) {
            const newNode = document.createElement("pre");
            newNode.innerHTML = `<code class="${prevElement.lang} hljsBlock">${prevElement.currString}</code>`;

            prevElement.containerNode.after(newNode);

            prevElement = {
                isCodeBlock: false,
                isMarkdownBlock: false
            };
        }
    };

    const finalizeMarkdownBlock = (document: Document, window: Window) => {
        if (prevElement.isMarkdownBlock) {
            prevElement.currString = prevElement.currString.substr(0, prevElement.currString.length - 1);
            const newNode = document.createElement("div");
            // To not have a break at the end
            newNode.style.whiteSpace = "normal";
            newNode.classList.add("markdown-body");
            newNode.innerHTML = getMarkdownParser(window).render(prevElement.currString);

            prevElement.containerNode.before(newNode);

            prevElement = {
                isCodeBlock: false,
                isMarkdownBlock: false
            };
        }
    };

    const toBeDeletedNodes: HTMLElement[] = [];

    for (const domNode of allNodes) {
        if (domNode.tagName === "DIV") {
            finalizeMarkdownBlock(document, window);
            if (domNode.classList.contains("ql-code-block")) {
                toBeDeletedNodes.push(domNode);

                if (prevElement.containerNode === undefined || prevElement.containerNode === null) {
                    prevElement.containerNode = domNode;
                }

                if (!prevElement.isCodeBlock) {
                    const lang = domNode.attributes.getNamedItem("data-language") ? domNode.attributes.getNamedItem("data-language").value : "";
                    prevElement = {
                        ...prevElement,
                        isCodeBlock: true,
                        lang,
                        currString: domNode.textContent
                    };
                } else {
                    prevElement = {
                        ...prevElement,
                        currString: prevElement.currString + "\n" + domNode.textContent
                    };
                }
            } else {
                finalizeCodeBlock();
            }
        } else if (domNode.tagName === "SELECT" || domNode.tagName === "OPTION") {
            finalizeMarkdownBlock(document, window);
            finalizeCodeBlock();
            toBeDeletedNodes.push(domNode);
        } else if ((domNode.tagName === "PRE" && domNode.classList.contains(MarkdownLatexQuill.blotName))) {
            finalizeCodeBlock();
            toBeDeletedNodes.push(domNode);
            if (prevElement.isMarkdownBlock) {
                if (domNode.innerText !== "\n") {
                    prevElement.currString += domNode.textContent;
                }
                prevElement.currString += "\n";
            } else {
                prevElement = {
                    isMarkdownBlock: true,
                    isCodeBlock: false,
                    containerNode: domNode,
                    currString: `${domNode.innerText}\n`
                };
            }
        } else if (domNode.tagName === "P" && domNode.innerHTML === "") {
            const br = document.createElement("br");
            domNode.parentNode.replaceChild(br, domNode);

            if (!domNode.classList.contains(MarkdownLatexQuill.blotName)) {
                finalizeMarkdownBlock(document, window);
            }
            finalizeCodeBlock();
        }
    }

    finalizeMarkdownBlock(document, window);
    finalizeCodeBlock();

    toBeDeletedNodes.forEach((domNode: HTMLElement) => {
        domNode.remove();
    });

    return node.innerHTML; // Doesn't have images replaced
};
