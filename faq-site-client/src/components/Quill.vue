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
              content: "",
              _options: {},
              defaultOptions: {
                  theme: "snow",
                  placeholder: "Type here ...",
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

              // Make Image Handler
              (this.editor as any).getModule("toolbar").addHandler("image", this.imgHandler);

              if (!this.disabled) {
                  (this.editor as any).enable(true);
              }
          },
          imgHandler() {
              console.log("Image handler called");
          },
          saveEditor() {
              this.$emit("saved");
          },
          cancelEditor() {
              this.$emit("canceled");
          }
      }
  });
</script>

<style scoped>
.confirm {
  float: right;
}
#editor {
  min-height: 100px;
  height: 60vh;

  min-width: 700px;
  width: 70vw;
}
</style>