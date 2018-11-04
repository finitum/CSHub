<template>
    <!-- Shamelessly stolen from the quilljs homepage -->
    <div class="snow-wrapper" style="height: 100%">
        <div class="snow-container" :id="quillId" style="height: 100%">
            <div class="toolbar" v-show="editorSetup.showToolbar" style="border: none; padding: 1%;">
                <span class="ql-formats">
                      <select class="ql-header" title="Header">
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
                      <select class="ql-color">
                            <option value="rgb(0, 0, 0)"/>
                            <option value="rgb(230, 0, 0)"/>
                            <option value="rgb(255, 153, 0)"/>
                            <option value="rgb(255, 255, 0)"/>
                            <option value="rgb(0, 138, 0)"/>
                            <option value="rgb(0, 102, 204)"/>
                            <option value="rgb(153, 51, 255)"/>
                            <option value="rgb(255, 255, 255)"/>
                            <option value="rgb(250, 204, 204)"/>
                            <option value="rgb(255, 235, 204)"/>
                            <option value="rgb(204, 224, 245)"/>
                            <option value="rgb(235, 214, 255)"/>
                            <option value="rgb(187, 187, 187)"/>
                            <option value="rgb(102, 185, 102)"/>
                      </select>
                      <select class="ql-background">
                            <option value="rgb(0, 0, 0)"/>
                            <option value="rgb(230, 0, 0)"/>
                            <option value="rgb(255, 153, 0)"/>
                            <option value="rgb(255, 255, 0)"/>
                            <option value="rgb(0, 138, 0)"/>
                            <option value="rgb(0, 102, 204)"/>
                            <option value="rgb(153, 51, 255)"/>
                            <option value="rgb(255, 255, 255)"/>
                            <option value="rgb(250, 204, 204)"/>
                            <option value="rgb(255, 235, 204)"/>
                            <option value="rgb(204, 224, 245)"/>
                            <option value="rgb(235, 214, 255)"/>
                            <option value="rgb(187, 187, 187)"/>
                            <option value="rgb(102, 185, 102)"/>
                      </select>
                </span>
                <span class="ql-formats">
                      <button class="ql-list" value="ordered"></button>
                      <button class="ql-list" value="bullet"></button>
                      <select class="ql-align" title="Alignment">
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
</template>

<script>
    import Vue from "vue";

    import dataState from "../../store/data";
    import JQuery from "jquery";

    import "../../plugins/quill/highlight.pack.min"; // Needs to be loaded before quill
    import hljs from "highlight.js";
    import "../../plugins/quill/gruvbox-dark.min.css"; // Highlight.js style sheet
    import "../../plugins/quill/Sailec-Light.otf"; // Font file
    import "../../plugins/quill/Symbola.ttf";
    import "../../plugins/quill/quill2.min";
    import "../../plugins/quill/quill2.min.css";
    import defaultOptions from "./options";
    import {mathquill} from "../../plugins/quill/mathquill.min";
    import "../../plugins/quill/mathquill.min.css";
    import katex from "katex/dist/katex.min";
    import "katex/dist/katex.min.css";
    import {mathquill4quill} from "../../plugins/quill/mathquill4quill.min";
    import {ImageResize} from "../../plugins/quill/ImageResize.min";
    import {LogStringConsole} from "../../utilities";
    import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

    const Quill = window.Quill;
    Quill.register("modules/resize", ImageResize);

    const TableActions = Object.freeze({
        CREATETABLE: 1,
        CREATENEWROWUP: 2,
        CREATENEWROWDOWN: 3,
        CREATENEWCOLUMNLEFT: 4,
        CREATENEWCOLUMNRIGHT: 5,
        REMOVEROW: 6,
        REMOVECOLUMN: 7,
        REMOVETABLE: 8
    });

    export default {
        name: "Quill",
        data() {
            return {
                editor: {},
                _options: {},
                tableMenuOpen: false,
                tableActions: TableActions,
                quillId: "",
                stuff: "",
                defaultOptions
            };
        },
        props: {
            value: {
                type: Object,
                required: false,
                default: () => ({})
            },
            options: {
                type: Object,
                required: false,
                default: () => ({})
            },
            editorSetup: {
                type: null,
                default: {allowEdit: true, showToolbar: true}
            }
        },

        mounted() {
            LogStringConsole("Mounted quill with edit: " + this.editorSetup.allowEdit);

            let id = "";
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

            for (let i = 0; i < 5; i++) {
                id += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            this.quillId = id;

            this.initRequirements(); // Init quill dependencies (mathquill4quillMin)

            // setTimeout without timeout magically works, gotta love JS (though with 0 does wait for the next "JS clock tick", so probably a Vue thing that hasn"t been synchronized yet with the DOM and so quill will error)
            setTimeout(() => {
                LogStringConsole("Initializing quill with edit: " + this.editorSetup.allowEdit);
                this.initQuill(); // Actually init quill itself
            });
        },
        beforeDestroy() {
            // Remove the editor on destroy
            this.editor = null;
            delete this.editor;
        },
        methods: {
            getHTML() {
                const node = this.editor.container.firstChild;
                const codes = node.getElementsByClassName("ql-code-block");
                for(const code of codes){
                    let lang = code.attributes.getNamedItem("data-language") ? code.attributes.getNamedItem("data-language").value : "";
                    code.className += " hljs " + lang;
                }

                return node.innerHTML; // Doesn't have images replaced
            },
            getDelta() {
                return this.editor.getContents();
            },
            performTableAction(type) {
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
                // Assign jquery and katex for use by mathquill
                window.jQuery = JQuery;
                window.katex = katex;

                mathquill(); // Load mathquillMin after jquery and katex were defined
                mathquill4quill(Quill, window.MathQuill); // Load mathquill4quill after all its dependencies are accounted for
            },
            initQuill() {
                // Set options and override the default with the user specified ones (Order of importance if right to left)
                this._options = Object.assign({}, this.defaultOptions, this.options);

                // Create the editor
                this._options.bounds = `#${this.quillId} .editor`;
                this._options.modules.toolbar = `#${this.quillId} .toolbar`;

                if (!this.editorSetup.allowEdit) {
                    this._options.placeholder = "";
                }
                this.editor = new Quill(`#${this.quillId} .editor`, this._options);

                // @ts-ignore
                this.editor.enableMathQuillFormulaAuthoring(); // Enable mathquill4quill
                this.editor.enable(false); // Hide it before we set the content

                // Set the content (with input a quill delta object)
                if (this.value) {
                    this.editor.setContents(this.value);
                }

                // Show the editor again
                if (this.editorSetup.allowEdit) {
                    this.editor.enable(true);
                }

                this.editor.focus();

                // Specify function to be called on change
                this.editor.on("text-change", this.textChanged);
            },
            textChanged(delta, oldContents, source) {
                // Delta is the single changed made that triggered this function
                // OldDelta is everything that was typed previous to the edit
                this.$emit("textChanged");
                this.getHTML();
            }
        }
    };
</script>

<style scoped>
    @font-face {
        font-family: "SailecLight";
        src: url("../../plugins/quill/Sailec-Light.otf");
    }

    #snow-wrapper, .editor {
        border: none;
        font-family: "SailecLight", sans-serif;
    }

    .editor {
        /* Specify a sane default height and width */
        min-height: 100px;
        height: 100%;
        /*width: 70vw;*/
    }

    td {
        border: 1px solid rgba(0, 0, 0, 0.12) !important;
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
