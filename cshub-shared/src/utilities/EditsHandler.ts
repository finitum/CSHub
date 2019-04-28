import {getMarkdownParser, MarkdownLatexQuill} from "./MarkdownLatexQuill";

export const getHTML = (quillEditor: any, document: Document, window: Window) => {
    const node = quillEditor.container.firstChild;

    // Converts the classes of all the code blocks so that hljs can highlight them properly
    const allNodes: any[] = [...node.getElementsByTagName("*")];

    let prevElement: {
        isMarkdownBlock: boolean,
        lang?: string,
        containerNode?: HTMLElement,
        currString?: string
    } = {
        isMarkdownBlock: false
    };

    const finalizeMarkdownBlock = (document: Document, window: Window) => {
        if (prevElement.isMarkdownBlock) {
            prevElement.currString = prevElement.currString.substr(0, prevElement.currString.length - 1);
            prevElement.currString = prevElement.currString.split("<").join("&lt;");
            prevElement.currString = prevElement.currString.split(">").join("&gt;");
            const newNode = document.createElement("div");
            // To not have a break at the end
            newNode.style.whiteSpace = "normal";
            newNode.classList.add("markdown-body");
            newNode.innerHTML = getMarkdownParser()
                .render(prevElement.currString)
                .split("&amp;lt;") // unescape ampersand
                .join("&lt;")
                .split("&amp;gt;")
                .join("&gt;");

            prevElement.containerNode.before(newNode);

            prevElement = {
                isMarkdownBlock: false
            };
        }
    };

    const toBeDeletedNodes: HTMLElement[] = [];

    for (const domNode of allNodes) {
        if ((domNode.tagName === "PRE" && domNode.classList.contains(MarkdownLatexQuill.blotName))) {
            toBeDeletedNodes.push(domNode);
            if (prevElement.isMarkdownBlock) {
                if (domNode.textContent !== "\n") {
                    prevElement.currString += domNode.textContent;
                }
                prevElement.currString += "\n";
            } else {
                prevElement = {
                    isMarkdownBlock: true,
                    containerNode: domNode,
                    currString: `${domNode.textContent}\n`
                };
            }
        } else if (domNode.tagName === "P" && domNode.innerHTML === "") {
            const br = document.createElement("br");
            domNode.parentNode.replaceChild(br, domNode);

            if (!domNode.classList.contains(MarkdownLatexQuill.blotName)) {
                finalizeMarkdownBlock(document, window);
            }
        } else {
            finalizeMarkdownBlock(document, window);
        }
    }

    finalizeMarkdownBlock(document, window);

    toBeDeletedNodes.forEach((domNode: HTMLElement) => {
        domNode.remove();
    });

    // fixes the not equal latex
    return node.innerHTML
        .split("\u0338") // Gets the unusable unicode character
        .join("\uE020"); // And replaces it by the correct one
};
