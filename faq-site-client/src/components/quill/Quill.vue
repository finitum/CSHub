<template>
    <v-container fluid fill-height class="grey lighten-4">
        <v-layout justify-center align-center>
            <v-flex shrink>
                <v-card>
                    <v-card-title class="title font-weight-regular justify-space-between">
                        <span>Editor</span>
                    </v-card-title>
                    <v-card-text>
                        <!-- Shamelessly stolen from the quilljs homepage -->
                        <div id="snow-wrapper">
                            <div id="snow-container">
                                <div class="toolbar">
                                    <span class="ql-formats">
                                          <select class="ql-header">
                                                <option value="1">Heading</option>
                                                <option value="2">Subheading</option>
                                                <option selected>Normal</option>
                                          </select>
                                    </span>
                                    <span class="ql-formats">
                                          <button class="ql-bold"></button>
                                          <button class="ql-italic"></button>
                                          <button class="ql-underline"></button>
                                    </span>
                                    <span class="ql-formats">
                                          <button class="ql-list" value="ordered"></button>
                                          <button class="ql-list" value="bullet"></button>
                                          <select class="ql-align">
                                            <option label="left" selected></option>
                                            <option label="center" value="center"></option>
                                            <option label="right" value="right"></option>
                                            <option label="justify" value="justify"></option>
                                          </select>
                                    </span>
                                    <span class="ql-formats">
                                          <button class="ql-link"></button>
                                          <button class="ql-image"></button>
                                          <button class="ql-video"></button>
                                    </span>
                                    <span class="ql-formats">
                                          <button class="ql-formula"></button>
                                          <button class="ql-code-block"></button>
                                    </span>
                                    <span class="ql-formats">
                                        <button class="ql-clean"></button>
                                    </span>
                                </div>
                                <div class="editor">
                                </div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
    import Vue from "vue";

    import dataState from "../../store/data";
    import JQuery from "jquery";

    import "../../plugins/quill/highlight.pack.min"; // Needs to be loaded before quill
    import "../../plugins/quill/gruvbox-dark.min.css"; // Highlight.js style sheet
    import "../../plugins/quill/Sailec-Light.otf"; // Font file
    import "quill/dist/quill.core.css";
    import "quill/dist/quill.snow.css";
    import Quill, {Sources} from "quill";
    import defaultOptions from "./options";
    // @ts-ignore
    import {mathquill} from "../../plugins/quill/mathquill.min";
    import "../../plugins/quill/mathquill.min.css";
    // @ts-ignore
    import katex from "katex/dist/katex.min";
    import "katex/dist/katex.min.css";
    // @ts-ignore
    import {mathquill4quill} from "../../plugins/quill/mathquill4quill.min";
    import {ImgurUpload} from "../../utilities/imgur";
    import Delta from "quill-delta/dist/Delta";
    import {ImageResize} from "../../plugins/quill/ImageResize.min";
    Quill.register("modules/imageResize", ImageResize);

    export default Vue.extend({
        name: "Quill",
        data() {
            return {
                editor: {} as Quill,
                content: {},
                _options: {},
                defaultOptions
            };
        },
        props: {
            value: {
                type: Object,
                required: false,
                default: () => ({})
            },
            disabled: {
                type: Boolean,
                default: false
            },
            options: {
                type: Object,
                required: false,
                default: () => ({})
            }
        },

        mounted() {
            this.initRequirements(); // Init quill dependencies (mathquill4quillMin)
            this.initQuill(); // Actually init quill itself
        },
        beforeDestroy() {
            // Remove the editor on destroy
            this.editor = null;
            delete this.editor;
        },
        methods: {
            initRequirements() {
                // Assign jquery and katex for use by mathquillMin
                (window as any).jQuery = JQuery;
                (window as any).katex = katex;

                mathquill(); // Load mathquillMin after jquery and katex were defined
                mathquill4quill((Quill as any), (window as any).MathQuill); // Load mathquill4quillMin after all its dependencies are accounted for
            },
            initQuill() {
                // Overide user-specified options with default options
                this._options = Object.assign({}, this.defaultOptions, this.options);

                // Create the editor
                this.editor = new Quill("#snow-container .editor", this._options);
                // @ts-ignore
                this.editor.enableMathQuillFormulaAuthoring(); // Enable mathquill4quillMin
                this.editor.enable(false); // Hide it before we set the content

                // Set the content (with input a quill delta object)
                if (this.value || this.content) {
                    this.editor.setContents(this.content || this.value);
                }

                // Show the editor again
                if (!this.disabled) {
                    this.editor.enable(true);
                }

                // Specify function to be called on change
                this.editor.on("text-change", this.textChanged);
            },
            saveEditor() {
                // Stores delta type object into the store
                // Documentation: https://quilljs.com/docs/delta/

                const content = this.editor.getContents();
                // @ts-ignore
                dataState.setQuillContents(content);
            },
            textChanged(delta: Delta, oldContents: Delta, source: Sources) {
                // Delta is the single changed made that triggered this function
                // OldDelta is everything that was typed previous to the edit
                this.$emit("textChanged");
            }
        }
    });
</script>

<style scoped>
    @font-face {
        font-family: 'SailecLight';
        src: url("../../plugins/quill/Sailec-Light.otf");
    }

    .confirm {
        float: right; /* Push confirm button to the right (can this be done cleaner with vuetify? */
    }

    #snow-wrapper .toolbar {
        border: none;
        padding: 1%;
    }

    #snow-wrapper, .editor {
        border: none;
        font-family: 'SailecLight', sans-serif;
    }

    .editor {
        /* Specify a sane default height and width */
        min-height: 100px;
        height: 60vh;
        width: 70vw;
    }
</style>
