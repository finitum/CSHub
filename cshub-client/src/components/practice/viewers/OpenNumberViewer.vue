<template>
    <div>
        <b>Question:</b>
        <p v-html="renderMarkdown(question)"></p>
        <b>Explanation:</b>
        <p v-html="renderMarkdown(explanation)"></p>
        <b>Answer:</b>
        <p>{{ answer }}</p>
        <b>Precision:</b>
        <p>{{ precision }}</p>
    </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";

import { mixins } from "vue-class-component";
import ViewerMixin from "./ViewerMixin";

@Component({
    name: OpenNumberViewer.name,
})
export default class OpenNumberViewer extends mixins(ViewerMixin) {
    @Prop({
        required: true,
    })
    private question!: string;

    @Prop({
        required: true,
    })
    private explanation!: string;

    @Prop({
        required: true,
    })
    private answer!: number;

    @Prop({
        required: true,
    })
    private precision!: number;
}
</script>

<style></style>
