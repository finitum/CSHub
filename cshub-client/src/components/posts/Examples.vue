<template>
    <div>
        <v-container>
            <v-row>
                <v-col v-for="postHash of postHashesProp" :key="postHash" cols="4">
                    <v-card>
                        <Post :post-hash="postHash"></Post>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Post from "./Post.vue";

@Component({
    name: Examples.name,
    components: { Post }
})
export default class Examples extends Vue {
    /**
     * Data
     */
    @Prop({ required: true }) private postHashesProp!: number[];

    private mounted() {}
}
</script>

<style scoped></style>
