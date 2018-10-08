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
            <!-- TODO: Find out their css and steal it as well -->
            <div id="snow-wrapper">
              <div id="snow-container">
                <div class="toolbar">
                <span class="ql-formats">
                  <select class="ql-header">
                    <option value="1">Heading</option>
                    <option value="2">Subheading</option>
                    <option selected>Normal</option>
                  </select>
                  <!--
                  <select class="ql-font">
                    <option selected>Sailec Light</option>
                    <option value="sofia">Sofia Pro</option>
                    <option value="slabo">Slabo 27px</option>
                    <option value="roboto">Roboto Slab</option>
                    <option value="inconsolata">Inconsolata</option>
                    <option value="ubuntu">Ubuntu Mono</option>
                  </select>
                  -->
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
              <br />
              <v-btn color="error" @click="cancelEditor">Cancel</v-btn>
              <v-btn class="confirm" color="success" @click="saveEditor">Confirm</v-btn>
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

  import "../../plugins/quill/highlight.pack"; // Needs to be loaded before quill
  import "../../plugins/quill/gruvbox-dark.css"; // Highlight.js style sheet
  import "quill/dist/quill.core.css";
  import "quill/dist/quill.snow.css";
  import Quill from "quill";
  import defaultOptions from "./options";
  // @ts-ignore
  import {mathquill} from "../../plugins/quill/mathquill";
  import "../../plugins/quill/mathquill.css";
  // @ts-ignore
  import katex from "katex/dist/katex.min";
  import "katex/dist/katex.min.css";
  // @ts-ignore
  import {mathquill4quill} from "../../plugins/quill/mathquill4quill";

  export default Vue.extend({
      name: "Quill",
      data() {
          return {
              editor: {},
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
          this.initRequirements(); // Init quill dependencies (mathquill4quill)
          this.initQuill(); // Actually init quill itself
      },
      beforeDestroy() {
          // Remove the editor on destroy
          this.editor = null;
          delete this.editor;
      },
      methods: {
          initRequirements() {
              // Assign jquery and katex for use by mathquill
              (window as any).jQuery = JQuery;
              (window as any).katex = katex;

              mathquill(); // Load mathquill after jquery and katex were defined
              mathquill4quill((Quill as any), (window as any).MathQuill); // Load mathquill4quill after all its dependencies are accounted for
          },
          initQuill() {
              // Overide user-specified options with default options
              this._options = Object.assign({}, this.defaultOptions, this.options);

              // Create the editor
              this.editor = new Quill("#snow-container .editor", this._options);
              (this.editor as any).enableMathQuillFormulaAuthoring(); // Enable mathquill4quill

              (this.editor as Quill).enable(false); // Hide it before we set the content

              // Set the content (with input a quill delta object)
              if (this.value || this.content) {
                  (this.editor as Quill).setContents(this.content || this.value);
              }

              // Show the editor again
              if (!this.disabled) {
                  (this.editor as Quill).enable(true);
              }

              // Specify function to be called on change
              (this.editor as Quill).on("text-change", this.textChanged);
          },
          saveEditor() {
              // Stores delta type object into the store
              // Documentation: https://quilljs.com/docs/delta/

              const content = (this.editor as Quill).getContents();
              // @ts-ignore
              dataState.setQuillContents(content);

              this.$emit("saved");
          },
          cancelEditor() {
              this.$emit("canceled");
          },
          textChanged(delta: object, oldDelta: object, source: string) {
              // Delta is the single changed made that triggered this function
              // OldDelta is everything that was typed previous to the edit
              this.$emit("textChanged");
          }
      }
  });
</script>

<style scoped>
.confirm {
  float: right; /* Push confirm button to the right (can this be done cleaner with vuetify? */
}
.toolbar, .editor {
  border: none;
}

.editor {
  /* Specify a sane default height */
  min-height: 100px;
  height: 60vh;
}
</style>