<template>
    <div>
        <QuestionList :unpublished="true" class="ma-4"></QuestionList>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import QuestionList from "../components/practice/QuestionList.vue";
import { MetaInfo } from "vue-meta";

@Component({
    name: UnsavedQuestions.name,
    components: { QuestionList }
})
export default class UnsavedQuestions extends Vue {
    /**
     * Lifecycle hooks
     */
    public metaInfo(): MetaInfo {
        return {
            title: "Unsaved questions - CSHub"
        };
    }
}
</script>

<style scoped></style>
