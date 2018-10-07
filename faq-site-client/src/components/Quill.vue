<template>
  <v-card>
    <v-card-title>
      <span>Editor</span>
    </v-card-title>

    <v-card-text>
      <div id="editor"></div>

    </v-card-text>
    <v-card-actions>
      <v-btn color="success" >Confirm</v-btn>
      <v-btn color="error">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
  import Vue from "vue";

  // require styles for quill
  import "quill/dist/quill.core.css";
  import "quill/dist/quill.snow.css";
  import "quill/dist/quill.bubble.css";

  import JQuery from "jquery";

  import Quill from "quill";

  import {mathquill} from "../plugins/mathquill4quill/mathquill"
  import "../plugins/mathquill4quill/mathquill.css"


  import "katex/dist/katex.min.css"
  import katex from "katex/dist/katex.min.js"

  import {mathquill4quill} from "../plugins/mathquill4quill/mathquill4quill"

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
                          [{ "header": 1 }, { "header": 2 }],
                          [{ "list": "ordered" }, { "list": "bullet" }],
                          [{ "script": "sub" }, { "script": "super" }],
                          [{ "indent": "-1" }, { "indent": "+1" }],
                          [{ "direction": "rtl" }],
                          [{ "size": ["small", false, "large", "huge"] }],
                          [{ "header": [1, 2, 3, 4, 5, 6, false] }],
                          [{ "color": [] }, { "background": [] }],
                          [{ "font": [] }],
                          [{ "align": [] }],
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
          initRequirements(){
              (window as any)["jQuery"] = JQuery;
              (window as any)["katex"] = katex;

              mathquill();
              mathquill4quill((Quill as any), (window as any)["MathQuill"]);
          },
          initQuill(){
              // Options
              this._options = Object.assign({}, this.defaultOptions, this.options);

              this.editor = new Quill("#editor", this._options);
              this.editor.enableMathQuillFormulaAuthoring();

              this.editor.enable(false);

              // Set content
              if (this.value || this.content) {
                  this.editor.pasteHTML(this.value || this.content)
              }

              if(!this.disabled){
                  this.editor.enable(true)
              }


          }
      }
  });
</script>

<style scoped>
</style>