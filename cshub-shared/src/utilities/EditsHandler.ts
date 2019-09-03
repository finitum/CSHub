import { getMarkdownParser, MarkdownLatexQuill } from "./MarkdownLatexQuill";

export const getHTML = (quillEditor: any, document: Document) => {
    const node = quillEditor.container.firstChild.cloneNode(true);

    // Converts the classes of all the code blocks so that hljs can highlight them properly
    const allNodes = [...node.getElementsByTagName("*")];

    let prevElement: {
        isMarkdownBlock: boolean;
        lang?: string;
        containerNode?: HTMLElement;
        currString?: string;
    } = {
        isMarkdownBlock: false
    };

    const finalizeMarkdownBlock = (doc: Document) => {
        if (prevElement.isMarkdownBlock) {
            const currString = prevElement.currString || "";

            prevElement.currString = currString
                .split("<")
                .join("&lt;")
                .split(">")
                .join("&gt;");

            const newNode = doc.createElement("div");
            // To not have a break at the end
            newNode.style.whiteSpace = "normal";
            newNode.classList.add("markdown-body");
            newNode.innerHTML = getMarkdownParser()
                .render(prevElement.currString)
                .split("&amp;lt;") // unescape ampersand
                .join("&lt;")
                .split("&amp;gt;")
                .join("&gt;");

            if (prevElement.containerNode) {
                prevElement.containerNode.before(newNode);
            }

            prevElement = {
                isMarkdownBlock: false
            };
        }
    };

    const toBeDeletedNodes: HTMLElement[] = [];

    for (const domNode of allNodes) {
        if (domNode.tagName === "PRE" && domNode.classList.contains(MarkdownLatexQuill.blotName)) {
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
                finalizeMarkdownBlock(document);
            }
        } else {
            finalizeMarkdownBlock(document);
        }
    }

    finalizeMarkdownBlock(document);

    toBeDeletedNodes.forEach((domNode: HTMLElement) => {
        domNode.remove();
    });

    const newAllNodes: any[] = [...node.getElementsByTagName("*")];

    for (const domNode of newAllNodes) {
        const tagName = domNode.tagName;
        if (tagName === "H1" || tagName === "H2" || tagName === "H3") {
            const innerText = (domNode.innerText || domNode.textContent) as string;
            domNode.id = innerText
                .split(" ")
                .join("-")
                .split("\n")
                .join("-")
                .toLowerCase();
        }
    }

    // fixes the not equal latex
    return node.innerHTML
        .split("\u0338") // Gets the unusable unicode character
        .join("\uE020"); // And replaces it by the correct one
};
