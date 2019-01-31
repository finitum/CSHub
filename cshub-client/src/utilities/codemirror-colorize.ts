import uiState from "../store/ui";

const isBlock = /^(p|li|div|h\\d|pre|blockquote|td)$/;

const textContent = (node: Node, out: string[]) => {
    if (node.nodeType === 3) {
        return out.push(node.nodeValue);
    }
    for (let ch: Node = node.firstChild; ch; ch = ch.nextSibling) {
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

    let theme = uiState.darkMode ? "darcula" : "default";

    for (const node of collection) {
        const mode = node.getAttribute("data-lang");
        if (!mode) {
            continue;
        }

        if (mode === "cypher") {
            theme = "neo";
        }

        const text: string[] = [];
        textContent(node, text);
        node.innerHTML = "";
        codemirror.runMode(text.join(""), mode, node, {
            theme
        });

        node.className = `cm-s-${theme}`;
    }
};
