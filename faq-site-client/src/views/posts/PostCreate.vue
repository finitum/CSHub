<template>
    <v-container fluid fill-height class="grey lighten-4">
        <v-layout justify-center align-center>
            <v-flex>
                <v-card>
                    <v-card-title class="title font-weight-regular justify-space-between">
                        <span>Create post</span>
                    </v-card-title>
                    <v-card-text>
                        <Quill ref="quillEdit" :editorSetup="{allowEdit: true, showToolbar: true}"></Quill>
                        <v-divider></v-divider>
                        <v-btn @click="getPostDelta">HOI</v-btn>
                        <Quill ref="quillView" :editorSetup="{allowEdit: false, showToolbar: false}"></Quill>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
    import Vue from "vue";
    import Quill from "../../components/quill/Quill.vue";

    export default Vue.extend({
        name: "PostCreate",
        components: {Quill},
        data() {
            return {
            }
        },
        methods: {
            getPostDelta() {
                this.$refs.quillView.setDelta(this.$refs.quillEdit.getDelta());
            }
        }
    });
</script>

<style scoped>

</style>