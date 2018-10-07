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
              content: "Hello",
              editorOptions: {
                  theme: "snow",
                  modules: {
                      formula: true,
                      toolbar: [['formula']]
                  }
              }
          };
      },
      props: {
        options: {
            type: Object,
            required: false,
            default: () => ({})
        }
      },

      mounted() {
          window["jQuery"] = JQuery;
          window["katex"] = katex;

          mathquill();
          mathquill4quill(Quill, window["MathQuill"]);

          this.editor = new Quill("#editor", this.editorOptions);

          this.editor.enableMathQuillFormulaAuthoring();
      }
  });
</script>

<style scoped>
</style>