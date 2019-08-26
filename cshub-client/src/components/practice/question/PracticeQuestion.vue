<template>
    <v-card class="ma-5 pa-5">
        <transition name="questionTransition">
            <router-view></router-view>
        </transition>

        <v-pagination v-model="paginationPageState" class="mt-3" :length="paginationLength"></v-pagination>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Routes } from "../../../../../cshub-shared/src/Routes";
import { practiceState } from "../../../store";

@Component({
    name: PracticeQuestion.name
})
export default class PracticeQuestion extends Vue {
    get paginationLength(): number {
        return practiceState.currentQuestions ? practiceState.currentQuestions.length : 1;
    }

    get paginationPageState(): number {
        return +this.$route.params.index + 1;
    }

    set paginationPageState(page: number) {
        this.$router.push(`${Routes.QUESTION}/${(page - 1).toString()}`);
    }
}
</script>

<style scoped>
.questionTransition-enter-active,
.questionTransition-leave-active {
    transition: opacity 0.5s;
}
.questionTransition-enter,
.questionTransition-leave-to {
    opacity: 0;
}
</style>
