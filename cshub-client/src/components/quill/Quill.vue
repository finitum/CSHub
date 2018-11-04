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
                            <option value="rgba(0, 0, 0, 0)"/>
                            <option value="rgb(230, 0, 0)"/>
                            <option value="rgb(255, 153, 0)"/>
                            <option value="rgb(255, 255, 0)"/>
                            <option value="rgb(0, 138, 0)"/>
                            <option value="rgb(0, 102, 204)"/>
                            <option value="rgb(153, 51, 255)"/>
                            <option value="rgb(0, 0, 0)"/>
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
        <v-dialog v-model="loadDraftDialog" persistent max-width="290">
            <v-card>
                <v-card-title class="headline">Open draft?</v-card-title>
                <v-card-text>A draft of this post was saved. Load this draft? If you don't load the draft, it will be discarded once you type.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click="loadDraft(true)">Load</v-btn>
                    <v-btn color="green darken-1" flat @click="loadDraft(false)">Discard</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>

</template>

<script lang="ts">
    import Vue from "vue";
    import JQuery from "jquery";
    import localForage from "localforage";
    import Delta from "quill-delta/dist/Delta";
    import {Component, Prop} from "vue-property-decorator";

    // @ts-ignore
    import katex from "katex/dist/katex.min";
    import "katex/dist/katex.min.css";

    import "../../plugins/quill/highlight.pack.min"; // Needs to be loaded before quill
    import "../../plugins/quill/gruvbox-dark.min.css"; // Highlight.js style sheet
    import "../../plugins/quill/Sailec-Light.otf"; // Font file
    import "../../plugins/quill/Symbola.ttf";
    import "../../plugins/quill/quill2.min";
    import "../../plugins/quill/quill2.min.css";
    import {mathquill} from "../../plugins/quill/mathquill.min";
    import {mathquill4quill} from "../../plugins/quill/mathquill4quill.min";
    import {ImageResize} from "../../plugins/quill/ImageResize.min";
    import "../../plugins/quill/mathquill.min.css";
    import {QuillOptionsStatic, Sources} from "../../plugins/quill/quill";

    import defaultOptions from "./QuillDefaultOptions";
    import {IQuillEditSetup} from "./IQuillEditSetup";

    import {logStringConsole} from "../../utilities";

    const QuillWindow = (window as any).Quill;
    QuillWindow.register("modules/resize", ImageResize);

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

    @Component({
        name: "QuillEditor"
    })
    export default class QuillEditor extends Vue {

        /**
         * Data
         */
        @Prop(Object) private initialValue: Delta;
        @Prop({type: null, required: true, default: {allowEdit: true, showToolbar: true, postHash: -1}}) private editorSetup: IQuillEditSetup;

        private editor: any = null;
        private editorOptions: QuillOptionsStatic = defaultOptions;

        private typingTimeout: number = null;
        private draftValue: Delta = null;
        private loadDraftDialog = false;
        private tableMenuOpen = false;
        private tableActions = TableActions;
        private postHashCacheItemID = "";
        private quillId = "";

        /**
         * Lifecycle hooks
         */
        private mounted() {

            if (this.editorSetup.allowEdit) {
                this.postHashCacheItemID = `POSTDRAFT_${this.editorSetup.postHash === -1 ? "def" : this.editorSetup.postHash}`;
                localForage.getItem<Delta>(this.postHashCacheItemID)
                    .then((cachedDraft: Delta) => {
                        if (cachedDraft !== null) {
                            this.loadDraftDialog = true;
                            this.draftValue = cachedDraft;
                        }
                    });
            }

            logStringConsole("Mounted quill with edit: " + this.editorSetup.allowEdit);

            let id = "";
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

            for (let i = 0; i < 5; i++) {
                id += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            this.quillId = id;

            // Assign jquery and katex for use by mathquillMin
            (window as any).jQuery = JQuery;
            (window as any).katex = katex;

            mathquill(); // Load mathquillMin after jquery and katex were defined
            mathquill4quill(QuillWindow, (window as any).MathQuill); // Load mathquill4quillMin after all its dependencies are accounted for

            // setTimeout without timeout magically works, gotta love JS (though with 0 does wait for the next 'JS clock tick', so probably a Vue thing that hasn't been synchronized yet with the DOM and so quill will error)
            setTimeout(() => {
                logStringConsole("Initializing quill with edit: " + this.editorSetup.allowEdit);
                this.initQuill(); // Actually init quill itself
            });
        }

        private beforeDestroy() {
            // Remove the editor on destroy
            this.editor = null;
        }

        /**
         * Methods
         */
        private getHTML() {
            const node = this.editor.container.firstChild;

            // Converts the classes of all the code blocks so that hljs can highlight them properly
            const codes = node.getElementsByClassName("ql-code-block");
            for (const code of codes) {
                const lang = code.attributes.getNamedItem("data-language") ? code.attributes.getNamedItem("data-language").value : "";
                code.className += " hljs " + lang;
            }

            // Removes all select tags as they are not needed in viewing the post
            const selects = document.getElementsByTagName("select");
            for (let i = 0, len = selects.length; i !== len; ++i) {
                selects[0].parentNode.removeChild(selects[0]);
            }

            return node.innerHTML; // Doesn't have images replaced
        }

        private loadDraft(load: boolean) {
            if (load) {
                this.editor.setContents(this.draftValue);
            } else {
                this.draftValue = null;
            }

            this.loadDraftDialog = false;
        }

        private getDelta() {
            return this.editor.getContents();
        }

        private performTableAction(type: TableActions) {
            const table = this.editor.getModule("table");
            if (typeof table !== "undefined") {
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
        }

        private initQuill() {
            // Create the editor
            this.editorOptions.bounds = `#${this.quillId} .editor`;
            this.editorOptions.modules.toolbar = `#${this.quillId} .toolbar`;

            if (!this.editorSetup.allowEdit) {
                this.editorOptions.placeholder = "";
            }
            this.editor = new QuillWindow(`#${this.quillId} .editor`, this.editorOptions);

            (this.editor as any).enableMathQuillFormulaAuthoring(); // Enable mathquill4quillMin
            this.editor.enable(false); // Hide it before we set the content

            // Set the content (with input a quill delta object)
            if (this.initialValue) {
                this.editor.setContents(this.initialValue);
            }

            // Show the editor again
            if (this.editorSetup.allowEdit) {
                this.editor.enable(true);
            }

            this.editor.focus();

            // Specify function to be called on change
            this.editor.on("text-change", this.textChanged);
        }

        private textChanged(delta: Delta, oldContents: Delta, source: Sources) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                localForage.setItem<Delta>(this.postHashCacheItemID, this.getDelta())
                    .then(() => {
                        logStringConsole("Drafted current post", "textchanged quill");
                    });
            }, 1000);
        }
    }
</script>

<style scoped>
    .editor {
        /* Specify a sane default height and width */
        min-height: 100px;
        height: 100%;
        /*width: 70vw;*/
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