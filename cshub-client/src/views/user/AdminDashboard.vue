<template>
    <div>
        <!-- Badly aligned :( -->
        <!-- see https://github.com/vuetifyjs/vuetify/issues/8294 -->
        <v-tabs icons-and-text vertical>
            <v-tab v-if="userAdminComputed" class="ml-0">
                Users
                <v-icon>fas fa-users</v-icon>
            </v-tab>

            <v-tab v-if="userAdminComputed" class="ml-0">
                Studies
                <v-icon>fas fa-graduation-cap</v-icon>
            </v-tab>

            <v-tab v-if="userStudyAdminComputed" class="ml-0">
                Topics
                <v-icon>fas fa-book-open</v-icon>
            </v-tab>

            <v-tab-item v-if="userAdminComputed">
                <UserTable class="mt-2"></UserTable>
            </v-tab-item>
            <v-tab-item v-if="userAdminComputed">
                <StudyTable class="mt-2"></StudyTable>
            </v-tab-item>
            <v-tab-item v-if="userStudyAdminComputed">
                <TopicView class="mt-2"></TopicView>
            </v-tab-item>
        </v-tabs>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import UserTable from "../../components/admin/UserTable.vue";
import StudyTable from "../../components/admin/StudyTable.vue";
import TopicView from "../../components/admin/TopicView.vue";
import { userState } from "../../store";
import { EventBus, STUDY_CHANGED } from "../../utilities/EventBus";
import { Routes } from "../../../../cshub-shared/src/Routes";

@Component({
    name: "AdminDashboard",
    components: { TopicView, UserTable, StudyTable }
})
export default class AdminDashboard extends Vue {
    private tabs = null;

    get userAdminComputed(): boolean {
        return userState.isAdmin;
    }

    get userStudyAdminComputed(): boolean {
        return userState.isStudyAdmin;
    }

    private mounted() {
        EventBus.$on(STUDY_CHANGED, () => {
            if (!this.userStudyAdminComputed) {
                this.$router.push(Routes.INDEX);
            }
        });
    }

    private destroyed() {
        EventBus.$off(STUDY_CHANGED);
    }

    public metaInfo(): any {
        return {
            title: "Admin - CSHub"
        };
    }
}
</script>

<style scoped></style>
