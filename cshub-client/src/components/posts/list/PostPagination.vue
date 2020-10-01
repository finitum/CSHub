<template>
    <div class="text-xs-center">
        <v-container>
            <v-layout justify-center>
                <v-flex xs12>
                    <v-card style="background-color: transparent; border: none; box-shadow: none !important">
                        <v-card-text>
                            <v-pagination v-model="vmodel" :length="Math.ceil(elements / range)"></v-pagination>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

import { useVModel, vmodelProps } from "../../../composables/useVModel";

export default defineComponent({
    props: {
        range: { required: true, type: Number },
        elements: { required: true, type: Number },
        ...vmodelProps,
    },
    setup(props) {
        return {
            ...useVModel(props),
        };
    },
});
</script>

<style scoped></style>
