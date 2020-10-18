<template>
    <div class="post-header-button">
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn
                    min-width="88"
                    :color="color"
                    depressed
                    class="my-1 mr-4 d-inline-block"
                    small
                    v-on="on"
                    @click="$emit('click', $event)"
                >
                    <v-icon>{{ icon }}</v-icon>
                </v-btn>
            </template>
            <span>{{ tooltip }}</span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "@vue/composition-api";

export default defineComponent({
    props: {
        color: { required: true, type: String },
        icon: { required: true, type: String },
        tooltip: { required: true, type: String },
    },
    setup(props) {},
});
</script>

<style scoped></style>
