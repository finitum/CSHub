<template>
    <v-navigation-drawer
            v-model="drawerComputed"
            fixed
            clipped
            class="grey lighten-4"
            app>
        <v-list
                dense
                class="grey lighten-4">

            <NavDrawerItem icon="mdi-account" text="User dashboard"></NavDrawerItem>
            <router-link :to="navigationLocations.LOGIN"><NavDrawerItem icon="mdi-login" text="Login"></NavDrawerItem></router-link>
            <v-divider dark class="my-3"></v-divider>
            <v-layout
                    row
                    align-center>
                <v-flex xs6>
                    <v-subheader>
                        Topics
                    </v-subheader>
                </v-flex>
            </v-layout>
            <v-treeview
                :active.sync="activeTopicHash"
                :items="topics"
                item-key="hash"
                activatable
                active-class="primary--text"
                transition>
            </v-treeview>
            <v-divider dark class="my-3"></v-divider>
        </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts">
    import Vue from "vue";
    import {ITopic} from "../../../../faq-site-shared/models";
    import {ApiWrapper, LogObjectConsole} from "../../utilities";
    import {TopicsCallBack, TopicsRequest} from "../../../../faq-site-shared/api-calls/pages";

    import NavDrawerItem from "./NavDrawerItem.vue";
    import uiState from "../../store/ui";
    import dataState from "../../store/data";
    import {Routes} from "../../views/router";
    import {getTopicFromHash} from "../../../../faq-site-shared/utilities/topics";
    import {Route} from "vue-router";

    export default Vue.extend({
        name: "NavDrawer",
        components: {NavDrawerItem},
        data() {
            return {
                activeTopicHash: [],
                topics: [] as ITopic[],
                items: [],
                navigationLocations: Routes
            };
        },
        computed: {
            drawerComputed: {
                get(): boolean {
                    return uiState.drawerState;
                },
                set(newValue: boolean) {
                    uiState.setDrawerState(newValue);
                }
            }
        },
        watch: {
            $route(to: Route, from: Route) {
                if (to.fullPath.includes(Routes.TOPIC)) {
                    this.activeTopicHash = [+(to.params as any).hash]; // Perhaps do not use this later on, but doing this through the store
                }
            },
            activeTopicHash(hash: number[]) {
                if (hash.length) {
                    const topicObj = getTopicFromHash(hash[0], this.topics);
                    if (!this.$router.currentRoute.fullPath.includes(Routes.TOPIC) || topicObj.hash !== +this.$router.currentRoute.params.hash) {
                        this.$router.push(`${Routes.TOPIC}/${topicObj.hash}`);
                    }
                }
            }
        },
        mounted() {
            // Sends a get request to the server, and sets the correct store value after receiving the topics in the TopicsCallBack
            ApiWrapper.sendGetRequest(new TopicsRequest(), (callbackData: TopicsCallBack) => {
                LogObjectConsole(callbackData.topics, "NavDrawer mounted");
                this.topics = callbackData.topics;
                dataState.setTopics(callbackData.topics);
            });
        }
    });
</script>

<style scoped>
</style>