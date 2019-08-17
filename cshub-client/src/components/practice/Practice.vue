<template>
    <div>
        <v-card class="mx-auto my-4" max-width="420">
            <v-card-text>
                <p class="display-1 text--primary">Practice questions</p>
                <p>Practice a bunch of questions</p>
            </v-card-text>
            <v-card-actions>
                <v-btn text color="deep-purple accent-4">Learn More</v-btn>
            </v-card-actions>
        </v-card>

        <v-card class="mx-auto my-4" max-width="420">
            <v-card-text>
                <p class="display-1 text--primary">Add questions</p>
                <p>Add questions for this exact topic</p>
            </v-card-text>
            <v-card-actions>
                <v-btn text color="deep-purple accent-4">Learn More</v-btn>
            </v-card-actions>
        </v-card>

        <v-card class="mx-auto my-4" max-width="420">
            <v-card-text>
                <p class="display-1 text--primary">Edit questions</p>
                <p>Edit questions</p>
            </v-card-text>
            <v-card-actions>
                <v-btn text color="deep-purple accent-4">Learn More</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component({
    name: "Practice"
})
export default class Practice extends Vue {}
</script>

<style scoped></style>
