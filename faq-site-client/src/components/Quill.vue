<template>
  <v-card>
    <v-card-title>
      <span>Editor</span>
    </v-card-title>

    <v-card-text>
      <quill-editor
              ref="editor"
              :options="editorOptions"
              v-model="content">

      </quill-editor>

    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import Vue from "vue";

  // require styles for quill
  import "quill/dist/quill.core.css";
  import "quill/dist/quill.snow.css";
  import "quill/dist/quill.bubble.css";

  import katex from "katex";
  //TODO: Get KaTeX working : https://github.com/surmon-china/vue-quill-editor/issues/280
  import { quillEditor, Quill } from "vue-quill-editor";

  //import "mathquill";
  //import "../plugins/mathquill4quill/mathquill4quill";


  export default Vue.extend({
      name: "Quill",
      data() {
          return {
              content: "Hello",
              editorOptions: {
                  modules: {
                      //toolbar: [['formula']]
                  },
                  theme: "snow",
                  toolbar: true
              }
          };
      },
      props: {

      },
      components: {
          quillEditor
      },
      mounted() {
      }
  });
</script>

<style scoped>
</style>