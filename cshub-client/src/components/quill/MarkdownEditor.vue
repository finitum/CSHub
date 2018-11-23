<template>
    <div>
        <v-container style="max-width: inherit">
            <v-layout>
                <v-flex xs6>
                    <v-textarea
                            title="Input"
                            id="input"
                            auto-grow
                            autofocus
                            label="Your input"
                            spellcheck="false"
                            v-model="markdownDialogState.text"
                            @keyup="renderMarkdown"
                            @keydown.tab.prevent="tabHandler"
                            placeholder="Type here">
                    </v-textarea>
                </v-flex>
                <v-flex xs6>
                    <p v-html="output"></p>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script lang='ts'>
    import Vue from "vue";
    import {Prop, Component, Watch} from "vue-property-decorator";

    import MarkdownIt from "markdown-it";
    import "github-markdown-css";
    import "katex/dist/katex.min.css";

    // @ts-ignore
    import mk from "markdown-it-katex";
    import uiState from "../../store/ui";
    import {markdownDialogType} from "../../store/ui/state";

    @Component({
        name: "MarkdownEditor"
    })
    export default class MarkdownEditor extends Vue {

        /**
         * Data
         */
        @Prop(Array) private initialValue: object[];

        private output = "";
        private markdown = {md: new MarkdownIt({}).use(mk)};

        /**
         * Lifecycle hooks
         */
        private mounted() {
            this.renderMarkdown();
        }

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
                this.renderMarkdown();
            }
        }

        /**
         * Methods
         */
        private renderMarkdown() {
            this.output = this.markdown.md.render(this.markdownDialogState.text);
        }

        private tabHandler(event: Event) {
            const text = this.markdownDialogState.text;
            const originalSelectionStart = (event.target as any).selectionStart;
            const textStart = text.slice(0, originalSelectionStart);
            const textEnd =  text.slice(originalSelectionStart);

            this.markdownDialogState.text = `${textStart}\t${textEnd}`;
            (event.target as any).selectionEnd = (event.target as any).selectionStart = originalSelectionStart + 1;
        }
    }
</script>

<style scoped>
    .accent {
        background-color: transparent !important;
    }
</style>
