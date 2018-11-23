<template>
    <div class="wrapper">
        <div class="input">
            <textarea
                  title="Input"
                  id="input"
                  spellcheck="false"
                  v-model="input"
                  @keyup="renderMarkdown"
                  @keydown.tab.prevent="tabHandler"
                  placeholder="Type here">
            </textarea>
        </div>
        <div class="output">
            <p v-html="output" class="markdown-body"></p>
        </div>
    </div>
</template>

<script lang='ts'>
    import Vue from 'vue';
    import {Prop, Component} from "vue-property-decorator";

    import MarkdownIt from 'markdown-it';
    import 'github-markdown-css';
    import 'katex/dist/katex.min.css';

    // @ts-ignore
    import mk from 'markdown-it-katex';

    @Component({
        name: "MarkdownEditor"
    })
    export default class MarkdownEditor extends Vue {

        /**
         * Data
         */
        @Prop(Array) private initialValue: Object[];

        private input = "";
        private output = "";
        private markdown = {md: new MarkdownIt({}).use(mk)};

        /**
         * Lifecycle hooks
         */
        private mounted() {
            this.renderMarkdown();
        }

        /**
         * Methods
         */
        private renderMarkdown() {
            this.output = this.markdown.md.render(this.input);
        }

        private tabHandler(event: Event) {
            const text = this.input;
            const originalSelectionStart = (event.target as any).selectionStart;
            const textStart = text.slice(0, originalSelectionStart);
            const textEnd =  text.slice(originalSelectionStart);

            this.input = `${textStart}\t${textEnd}`;
            (event.target as any).selectionEnd = (event.target as any).selectionStart = originalSelectionStart + 1;
        }
    }
</script>

<style scoped>
    @media print {
        .input {
            display: none;
        }
        .output > .markdown-body{
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
        }

    }

    input[type="file"] {
        display: none;
    }

    .button {
        background-color: #434343;
        border: none;
        border-radius: 4px;
        color: white;
        padding: 1px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin-right: 5px;
        cursor: pointer;
    }

    .button:hover {

        background-color: #373737;
    }

    #menu {
        grid-row: 1;
        grid-column-start: 1;
        grid-column-end: 2;

        display: flex;
        flex-direction: row;

        justify-content: left;
        padding: 5px 0 0 25px;
    }

    #menu > button {
        margin-right: 5px;
    }

    .wrapper {
        display: grid;
        grid-template-rows: 30px auto;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: calc(100vh - 30px);


        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
    }

    .input {
        grid-row: 2;
        padding: 15px;
        margin: 5px;
        grid-column: 1;
        font-family: inherit;
    }

    .output {
        grid-row: 2;
        grid-column: 2;
        text-align: left;
        width: 30vw;
    }

    textarea {
        padding: 5px;
        resize: none;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        border: 1px solid black;
        font-size: 1rem;
        font-family: inherit;
    }
</style>
