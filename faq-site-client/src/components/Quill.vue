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

  import { quillEditor } from "vue-quill-editor";

  export default Vue.extend({
      name: "Quill",
      data() {
          return {
              content: "Hello",
              editorOptions: {
                  theme: "snow",
                  toolbar: true
              }
          };
      },
      components: {
          quillEditor
      }
  });
</script>

<style scoped>
</style>