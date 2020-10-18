import { uiState } from "../store";

const isBlock = /^(p|li|div|h\\d|pre|blockquote|td)$/;

const textContent = (node: Node, out: string[]) => {
    if (node.nodeType === 3) {
        const nodeValue = node.nodeValue;
        if (nodeValue) {
            return out.push(nodeValue);
        }
    }
    for (let ch = node.firstChild; ch; ch = ch.nextSibling) {
        textContent(ch, out);
        if (isBlock.test(node.nodeType.toString())) {
            out.push("\n");
        }
    }
};

export const colorize = (collection: any, codemirror: any) => {
    if (!collection) {
        collection = document.body.getElementsByTagName("pre");
    }

    const theme = uiState.darkMode ? "darcula" : "default";

    for (const node of collection) {
        let mode = node.getAttribute("data-lang");
        if (!mode) {
            if (node.children.length > 0 && node.children[0].tagName === "CODE") {
                mode = "null";
            } else {
                continue;
            }
        }

        const text: string[] = [];
        textContent(node, text);
        node.innerHTML = "";
        codemirror.runMode(text.join(""), mode, node, {
            theme,
        });

        node.className = `cm-s-${theme}`;
    }
};
