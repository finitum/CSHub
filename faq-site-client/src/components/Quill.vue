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

  import Quill from "quill";

  import "../plugins/mathquill4quill/mathquill"

  import "katex/dist/katex.min.css"
  import "katex/dist/katex.min.js"

  import "../plugins/mathquill4quill/mathquill4quill"

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
          //window["katex"] = katex;

          this.editor = new Quill("#editor", this.editorOptions);
      }
  });
</script>

<style scoped>
</style>