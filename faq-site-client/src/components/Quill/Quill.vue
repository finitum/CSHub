<template>
  <v-card>
    <v-card-title class="title font-weight-regular justify-space-between">
      <span>Editor</span>
    </v-card-title>

    <v-card-text>
        <div id="editor"></div>
        <br />
        <v-btn color="error" @click="cancelEditor">Cancel</v-btn>
        <v-btn class="confirm" color="success" @click="saveEditor">Confirm</v-btn>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import Vue from "vue";

  import JQuery from "jquery";

  import "../../plugins/quill/highlight.pack"; // Needs to be loaded before quill
  import "../../plugins/quill/gruvbox-dark.css"; // Highlight.js style sheet
  import "quill/dist/quill.core.css";
  import "quill/dist/quill.snow.css";
  import Quill from "quill";
  import defaultOptions from "./options";
  import {mathquill} from "../../plugins/quill/mathquill";
  import "../../plugins/quill/mathquill.css";
  // @ts-ignore
  import katex from "katex/dist/katex.min";
  import "katex/dist/katex.min.css";
  import {mathquill4quill} from "../../plugins/quill/mathquill4quill";

  export default Vue.extend({
      name: "Quill",
      data() {
          return {
              editor: {},
              content: "",
              _options: {},
              defaultOptions
          };
      },
      props: {
          value: String,
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
              this.editor = new Quill("#editor", this._options);
              (this.editor as any).enableMathQuillFormulaAuthoring(); // Enable mathquill4quill

              (this.editor as any).enable(false); //Hide it before we set the content

              // Set the content
              if (this.value || this.content) {
                  (this.editor as any).pasteHTML(this.value || this.content);
              }

              // Show the editor again
              if (!this.disabled) {
                  (this.editor as any).enable(true);
              }

              // Specify function to be called on change
              this.editor.on('text-change', this.textChanged)
          },
          saveEditor() {
              this.$emit("saved");
          },
          cancelEditor() {
              this.$emit("canceled");
          },
          textChanged(delta, oldDelta, source) {
              // Documentation: https://quilljs.com/docs/delta/#changes
              console.log("Delta: " + JSON.stringify(delta)); // Delta is the single changed made that triggered this function
              console.log("OldDelta: " + JSON.stringify(oldDelta)); // OldDelta is everything that was typed previous to the edit
              // TODO: Store Contents or Deltas in the store

              this.$emit("textChanged");
          }
      }
  });
</script>

<style scoped>
.confirm {
  float: right; /* Push confirm button to the right (can this be done cleaner with vuetify? */
}
#editor {
  /* Specify a sane default height */
  min-height: 100px;
  height: 60vh;
  /* and width */
  min-width: 700px;
  width: 70vw;
}
</style>