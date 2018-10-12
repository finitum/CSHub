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
                                          <button class="ql-clean"></button>
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
                                        <v-menu
                                                v-model="tableMenuOpen"
                                                :close-on-content-click="false"
                                                :nudge-width="100"
                                                offset-x
                                        >
                                              <v-btn
                                                  slot="activator"
                                                  dark
                                                  flat
                                                  small
                                                  id="tableButton"
                                              >
                                                  <v-icon color="black" id="tableIcon">mdi-table</v-icon>
                                              </v-btn>

                                              <v-card>
                                                    <v-card-title primary-title style="padding-bottom: 0">
                                                        <h3>
                                                            Table options
                                                        </h3>
                                                    </v-card-title>
                                                    <v-card-text style="padding-top: 0">
                                                        <v-list>
                                                            <v-list-tile>
                                                                <button @click="performTableAction(tableActions.CREATETABLE)"><v-icon>mdi-table</v-icon></button>
                                                                <button @click="performTableAction(tableActions.REMOVETABLE)"><v-icon>mdi-table-remove</v-icon></button>
                                                            </v-list-tile>
                                                            <v-list-tile>
                                                                <button @click="performTableAction(tableActions.CREATENEWCOLUMNLEFT)"><v-icon>mdi-table-column-plus-before</v-icon></button>
                                                                <button @click="performTableAction(tableActions.CREATENEWCOLUMNRIGHT)"><v-icon>mdi-table-column-plus-after</v-icon></button>
                                                            </v-list-tile>
                                                            <v-list-tile>
                                                                <button @click="performTableAction(tableActions.CREATENEWROWUP)"><v-icon>mdi-table-row-plus-before</v-icon></button>
                                                                <button @click="performTableAction(tableActions.CREATENEWROWDOWN)"><v-icon>mdi-table-row-plus-after</v-icon></button>
                                                            </v-list-tile>
                                                            <v-list-tile>
                                                                <button @click="performTableAction(tableActions.REMOVEROW)"><v-icon>mdi-table-row-remove</v-icon></button>
                                                                <button @click="performTableAction(tableActions.REMOVECOLUMN)"><v-icon>mdi-table-column-remove</v-icon></button>
                                                            </v-list-tile>
                                                        </v-list>
                                                    </v-card-text>
                                              </v-card>
                                            </v-menu>
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
    import "../../plugins/quill/quill2.min";
    import "../../plugins/quill/quill2.min.css";
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

    const Quill: any = (window as any).Quill;

    Quill.register("modules/resize", ImageResize);

    enum TableActions {
        CREATETABLE,
        CREATENEWROWUP,
        CREATENEWROWDOWN,
        CREATENEWCOLUMNLEFT,
        CREATENEWCOLUMNRIGHT,
        REMOVEROW,
        REMOVECOLUMN,
        REMOVETABLE
    }

    export default Vue.extend({
        name: "Quill",
        data() {
            return {
                editor: {} as any,
                content: {},
                _options: {},
                tableMenuOpen: false as boolean,
                tableActions: TableActions,
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
            performTableAction(type: TableActions) {
                const table = this.editor.getModule("table");
                if (table !== undefined) {
                    switch (type) {
                        case TableActions.CREATETABLE:
                            table.insertTable(2, 2);
                            break;
                        case TableActions.REMOVETABLE:
                            table.deleteTable();
                            break;
                        case TableActions.CREATENEWCOLUMNLEFT:
                            table.insertColumnLeft();
                            break;
                        case TableActions.CREATENEWCOLUMNRIGHT:
                            table.insertColumnRight();
                            break;
                        case TableActions.CREATENEWROWUP:
                            table.insertRowAbove();
                            break;
                        case TableActions.CREATENEWROWDOWN:
                            table.insertRowBelow();
                            break;
                        case TableActions.REMOVECOLUMN:
                            table.deleteColumn();
                            break;
                        case TableActions.REMOVEROW:
                            table.deleteRow();
                            break;
                    }
                }
            },
            initRequirements() {
                // Assign jquery and katex for use by mathquillMin
                (window as any).jQuery = JQuery;
                (window as any).katex = katex;

                mathquill(); // Load mathquillMin after jquery and katex were defined
                mathquill4quill(Quill, (window as any).MathQuill); // Load mathquill4quillMin after all its dependencies are accounted for
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

                this.editor.focus();

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
            textChanged(delta: Delta, oldContents: Delta, source: string) {
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

    td {
        border: 1px solid rgba(0,0,0,0.12) !important;
    }

    #tableButton {
        min-width: 10px;
    }

    #tableButton:focus,
    #tableButton:hover {
        color: white;
    }

    #tableIcon:hover {
        caret-color: #00A6D8 !important;
        color: #00A6D8 !important;
    }
</style>
