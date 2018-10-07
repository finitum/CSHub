<template>
  <v-card>
    <v-card-title>
      <span>Editor</span>
    </v-card-title>

    <v-card-text id="editor">

    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import Vue from "vue";

  import JQuery from "jquery";

  import "quill/dist/quill.core.css";
  import "quill/dist/quill.snow.css";
  import "quill/dist/quill.bubble.css";
  import Quill from "quill";
  import {mathquill} from "../plugins/quill/mathquill";
  import "../plugins/quill/mathquill.css";
  import "katex/dist/katex.min.css";
  // @ts-ignore
  import katex from "katex/dist/katex.min";
  import {mathquill4quill} from "../plugins/quill/mathquill4quill";

  export default Vue.extend({
      name: "Quill",
      data() {
          return {
              editor: {},
              content: "Type here...",
              _options: {},
              defaultOptions: {
                  theme: "snow",
                  modules: {
                      formula: true,
                      toolbar: [
                          ["bold", "italic", "underline", "strike"],
                          ["blockquote", "code-block"],
                          [{ header: 1 }, { header: 2 }],
                          [{ list: "ordered" }, { list: "bullet" }],
                          [{ script: "sub" }, { script: "super" }],
                          [{ indent: "-1" }, { indent: "+1" }],
                          [{ direction: "rtl" }],
                          [{ size: ["small", false, "large", "huge"] }],
                          [{ header: [1, 2, 3, 4, 5, 6, false] }],
                          [{ color: [] }, { background: [] }],
                          [{ font: [] }],
                          [{ align: [] }],
                          ["clean"],
                          ["link", "image"],
                          ["formula"]
                      ]
                  }
              }
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
          this.initRequirements();
          this.initQuill();
      },
      methods: {
          initRequirements() {
              (window as any).jQuery = JQuery;
              (window as any).katex = katex;

              mathquill();
              mathquill4quill((Quill as any), (window as any).MathQuill);
          },
          initQuill() {
              // Options
              this._options = Object.assign({}, this.defaultOptions, this.options);

              this.editor = new Quill("#editor", this._options);
              (this.editor as any).enableMathQuillFormulaAuthoring();

              (this.editor as any).enable(false);

              // Set content
              if (this.value || this.content) {
                  (this.editor as any).pasteHTML(this.value || this.content);
              }

              if (!this.disabled) {
                  (this.editor as any).enable(true);
              }
          }
      }
  });
</script>

<style scoped>
</style>