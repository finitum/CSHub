<template>
    <div>
        <v-container style="max-width: inherit">
            <v-layout>
                <v-flex xs12 style="padding-left: 20px">
                    <p v-html="output" class="markdown-body" id="htmlOutput"></p>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script lang='ts'>
    import Vue from "vue";
    import {Prop, Component, Watch} from "vue-property-decorator";

    import CodeMirror from "codemirror";

    import "katex/dist/katex.min.css";

    import uiState from "../../store/ui";
    import {markdownDialogType} from "../../store/ui/state";
    import {getMarkdownParser} from "../../../../cshub-shared/src/utilities/MarkdownLatexQuill";
    import {colorize} from "../../utilities/codemirror-colorize";

    @Component({
        name: "MarkdownEditor"
    })
    export default class MarkdownEditor extends Vue {

        /**
         * Data
         */
        @Prop(Array) private initialValue: object[];

        private output = "";

        /**
         * Computed properties
         */
        get markdownDialogState(): markdownDialogType {
            return uiState.mardownDialogState;
        }

        set markdownDialogState(state: markdownDialogType) {
            uiState.setMarkdownDialogState(state);
        }

        /**
         * Watchers
         */
        @Watch("markdownDialogState")
        private markdownDialogStateChanged() {
            if (this.markdownDialogState.open) {
                let input = "";
                for (let i = 0; i < this.markdownDialogState.blots.length; i++) {
                    const currBlot = this.markdownDialogState.blots[i];

                    const currText = (currBlot.domNode as any).innerText;
                    if (currText !== "") {
                        input += currText;
                        if (currText !== "\n" && i !== this.markdownDialogState.blots.length - 1) {
                            input += "\n";
                        }
                    }
                }
                this.output = getMarkdownParser().render(input);
                const node = document.getElementById("htmlOutput");
                const pres: Node[] = [];

                Vue.nextTick(() => {
                    for (const child of node.childNodes) {
                        if ((child as any).tagName === "PRE") {
                            pres.push(child);
                        }
                    }

                    colorize(pres, CodeMirror);
                });
            }
        }
    }
</script>

<style scoped>
</style>
