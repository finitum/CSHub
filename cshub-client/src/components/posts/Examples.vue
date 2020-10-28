<template>
    <div>
        <v-row>
            <v-col v-for="postHash of postHashesProp" :key="postHash" class="post-col" xl="4" md="6" cols="12">
                <Post :post-hash="postHash" class="example pa-0"></Post>
            </v-col>
        </v-row>
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

<style lang="scss">
.example {
    max-height: 300px;
    overflow-y: auto;

    .previewCard:hover {
        transform: none !important;
    }
}

@media print {
    .example {
        max-height: none;
        overflow-y: auto;
    }

    .post-col {
        max-width: 100%;
    }
}
</style>
