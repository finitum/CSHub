<template>
    <div class="post-header">
        <v-list two-line style="width: 100%" class="pt-0">
            <v-list-item class="pa-0 postTile">
                <v-list-item-content class="pt-2 pb-0 d-inline">
                    <v-list-item-subtitle class="whitespaceInit post-title">
                        <span>
                            {{ post.title }}
                            {{ post.isIndex ? "(index)" : "" }}
                            {{ post.isExample ? "(example)" : "" }}
                        </span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="whitespaceInit">
                        {{ formatDate(post.datetime) }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "@vue/composition-api";
import { IPost } from "../../../../../cshub-shared/src/entities/post";
import { CacheTypes } from "../../../utilities/cache-types";
import { ApiWrapper } from "../../../utilities";
import { GetPostCallBack, PostData } from "../../../../../cshub-shared/src/api-calls/endpoints/post";
import { useLocalStorage } from "vue-composable";
import { useFormatting } from "../../../composables/useFormatting";

export default defineComponent({
    props: {
        postHash: { required: true, type: Number },
    },
    setup(props) {
        const post = ref<IPost>();
        onMounted(() => {
            const { storage } = useLocalStorage<IPost | null>(CacheTypes.POSTS + props.postHash, null);

            if (storage.value === null) {
                ApiWrapper.get(new PostData(this.postHash)).then((callbackData: GetPostCallBack) => {
                    storage.value = callbackData.post;
                    post.value = callbackData.post;
                });
            } else {
                post.value = storage.value;
            }
        });

        return {
            post,
            ...useFormatting(),
        };
    },
});
</script>

<style scoped></style>
