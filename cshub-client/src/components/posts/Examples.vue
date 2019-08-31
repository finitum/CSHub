<template>
    <div>
        <v-container>
            <v-row>
                <v-col v-for="postHash of postHashesProp" :key="postHash" md="4" sm="6" cols="12" class="example pa-0 mb-4">
                    <Post :post-hash="postHash"></Post>
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
}
</script>

<style scoped lang="scss">
.example {
    height: 300px;
}
</style>
