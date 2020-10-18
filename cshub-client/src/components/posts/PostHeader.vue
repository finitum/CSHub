<template>
    <div class="post-header">
        <post-button color="primary" tooltip="Show button menu" icon="fas fa-chevron-left" @click="returnToPostMenu" />

        <v-breadcrumbs :items="topicNames" class="d-inline-block pa-0 mr-4 my-1">
            <template v-slot:item="props">
                <v-breadcrumbs-item v-if="props.item.topic" :to="props.item.to" :exact="true">
                    {{ props.item.text }}
                </v-breadcrumbs-item>
                <v-breadcrumbs-item v-else :disabled="!editModeComputed" :to="currentPostURLComputed" :exact="true">
                    {{ props.item.text }}
                </v-breadcrumbs-item>
            </template>
        </v-breadcrumbs>

        <post-button
            v-if="!isEditing && userIsAdmin"
            tooltip="Delete the post"
            color="red"
            icon="fas fa-trash"
            @click="hidePost"
        />

        <post-button
            v-if="!isEditing && userIsAdmin"
            color="purple"
            tooltip="Toggle WIP (dark = WIP)"
            :icon="post.wip ? 'fas fa-comments' : 'far fa-comments'"
            @click="wipPost"
        />

        <post-button
            v-if="!isEditing && userIsLoggedIn"
            color="orange"
            tooltip="Edit the post"
            icon="fas fa-edit"
            @click="enableEdit"
        />

        <post-button
            v-if="!isEditing && userIsAdmin"
            color="green"
            tooltip="Save the edit"
            icon="fas fa-save"
            @click="savePostDialog"
        />

        <post-button
            v-if="!isEditing && userIsAdmin"
            color="blue"
            tooltip="Force edit the post"
            icon="fas fa-gavel"
            @click="forceEditPost"
        />

        <post-button
            v-if="!isEditing"
            color="primary"
            tooltip="View edit history"
            icon="fas fa-history"
            @click="viewEditDialog"
        />

        <post-button color="secondary" tooltip="Hide this menu" icon="fas fa-angle-up" @click="showTopMenu = false" />
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "@vue/composition-api";
import PostButton from "./PostButton.vue";

export default defineComponent({
    components: { PostButton },
    setup(props) {},
});
</script>

<style scoped></style>
