<template>
    <div>
        <v-btn color="primary" dark class="mb-2 mr-2" @click="save">Save</v-btn>
        <v-btn color="primary" dark class="mb-2 mr-2" @click="getNodes">Refresh</v-btn>
        <v-btn color="primary" dark class="mb-2 mr-2" @click="create">Create topic</v-btn>
        <v-btn color="primary" dark class="mb-2" @click="deleteNode">Delete selected topic</v-btn>

        <!-- replace by vuetify variant if it ever gets implemented -->
        <sl-vue-tree ref="slVueTree" v-model="nodes" :allow-multiselect="false">
            <template slot="title" slot-scope="{ node }">
                <div v-if="isEditingName !== node.data.id" class="d-inline-block" @click="startEditing(node)">
                    {{ node.title }}
                </div>
                <v-text-field
                    v-else
                    v-model="currentlyEditedTitle"
                    v-validate="'required|min:3|max:40'"
                    minlength="3"
                    maxlength="40"
                    class="pt-0 d-inline-block"
                    single-line
                    :error-messages="errors.collect('nodename')"
                    name="nodename"
                    hide-details
                    append-icon="fas fa-check"
                    @keyup.enter="stopEditing(node)"
                    @click:append="stopEditing(node)"
                ></v-text-field>
            </template>

            <template slot="toggle" slot-scope="{ node }">
                <span v-if="node.children.length > 0">
                    <v-icon v-if="node.isExpanded">fas fa-chevron-down</v-icon>
                    <v-icon v-if="!node.isExpanded">fas fa-chevron-right</v-icon>
                </span>
                <span v-else></span>
            </template>
        </sl-vue-tree>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { cloneDeep, clone } from "lodash";

import SlVueTree, { ICursorPosition, ISlTreeNode, ISlTreeNodeModel } from "sl-vue-tree";
import "sl-vue-tree/dist/sl-vue-tree-minimal.css";

import { ITopic } from "../../../../cshub-shared/src/entities/topic";
import { RestructureTopics, TopicOrNew } from "../../../../cshub-shared/src/api-calls/endpoints/topics";
import { dataState, uiState } from "../../store";
import { ApiWrapper } from "../../utilities";
import { getTopTopic, parseTopTopic } from "../../views/router/guards/setupRequiredDataGuard";
import { EventBus, STUDY_CHANGED } from "../../utilities/EventBus";

@Component({
    name: "TopicView",
    components: { SlVueTree }
})
export default class TopicView extends Vue {
    private nodes: ISlTreeNodeModel<ITopic>[] = [];

    private isEditingName: false | number = false;
    private currentlyEditedTitle = "";

    private oldTopicName: string = "";

    private readonly maxTopicNameLength: number = 40;
    private readonly minTopicNameLength: number = 3;

    get tree(): SlVueTree<ITopic> {
        return this.$refs.slVueTree as SlVueTree<ITopic>;
    }

    private mounted() {
        this.getNodes();
    }

    private create() {
        const firstNode = this.tree.getFirstNode();
        const insertPosition: ICursorPosition<ITopic> = {
            node: firstNode,
            placement: "before"
        };

        const newNode: ISlTreeNodeModel<ITopic> = {
            title: "New topic"
        };
        (this.tree as any).insert(insertPosition, newNode);
    }

    private deleteNode() {
        const selected = this.tree.getSelected();
        selected.forEach(currSelected => (this.tree as any).remove([currSelected.path]));
    }

    private startEditing(node: ISlTreeNode<ITopic>) {
        this.isEditingName = node.data ? node.data.id : false;
        this.currentlyEditedTitle = node.title;
    }

    private stopEditing(node: ISlTreeNode<ITopic>) {
        const data = node.data;

        if (data) {
            data.name = this.currentlyEditedTitle;
        }

        // Types of lib are bad, so we can do te cast (node.path as any)
        this.tree.updateNode(node.path as any, {
            title: this.currentlyEditedTitle,
            data
        });

        this.isEditingName = false;
    }

    private getNodes() {
        const topTopic = dataState.topTopic;
        if (topTopic) {
            this.nodes = topTopic.children.map(child => this.createTreeViewFragment(child));
        } else {
            this.nodes = [];
        }
    }

    private async collectNodes(
        parent: TopicOrNew,
        node: ISlTreeNodeModel<TopicOrNew>
    ): Promise<TopicOrNew | undefined> {
        if (node.data === undefined) {
            return;
        }

        const newnode: TopicOrNew = {
            id: node.data.id || null,
            name: node.data.name,
            children: [],
            hash: node.data.hash || null,
            parent: parent
        };

        if (node.children) {
            for (const child of node.children) {
                const currentChildren = await this.collectNodes(newnode, child);
                if (currentChildren) {
                    newnode.children.push(currentChildren);
                }
            }
        }

        return newnode;
    }

    private async save() {
        const topTopic: TopicOrNew | null = clone(dataState.topTopic);

        if (!topTopic) {
            uiState.setNotificationDialog({
                header: "Something's gone terribly wrong :(",
                text: "Please tell the devs you saw this message",
                on: true
            });
            return;
        }

        topTopic.children = [];

        for (const node of this.nodes) {
            const topicTree = await this.collectNodes(topTopic, node);
            if (topicTree) {
                topTopic.children.push(topicTree);
            }
        }

        try {
            if (uiState.studyNr) {
                const fullCopy = cloneDeep(topTopic);
                this.makeJsonifiable(fullCopy);

                await ApiWrapper.put(new RestructureTopics(uiState.studyNr, fullCopy));

                getTopTopic(uiState.studyNr, true).then(topTopic => {
                    parseTopTopic(topTopic);
                    dataState.setTopics(topTopic);
                    EventBus.$emit(STUDY_CHANGED);
                });

                uiState.setNotificationDialog({
                    header: "Saved",
                    text: "Saved!",
                    on: true
                });
                return;
            } else {
                this.getNodes();
            }
        } catch (err) {
            this.getNodes();
        }
    }

    private makeJsonifiable(topic: TopicOrNew) {
        delete topic.parent;

        for (const child of topic.children) {
            this.makeJsonifiable(child);
        }
    }

    private createTreeViewFragment(topic: ITopic): ISlTreeNodeModel<ITopic> {
        const clonedTopic = cloneDeep(topic);

        const childFragments: ISlTreeNodeModel<ITopic>[] = [];

        for (const child of clonedTopic.children) {
            childFragments.push(this.createTreeViewFragment(child));
        }

        delete clonedTopic.children;
        delete clonedTopic.parent;

        return {
            title: clonedTopic.name,
            children: childFragments,
            data: clonedTopic
        };
    }
}
</script>

<style>
.sl-vue-tree.sl-vue-tree-root {
    flex-grow: 1;
    overflow-x: hidden;
    overflow-y: auto;
}

.sl-vue-tree {
    position: relative;
    cursor: default;
    user-select: none;
}

.sl-vue-tree.sl-vue-tree-root {
    border-radius: 3px;
}

.sl-vue-tree-root > .sl-vue-tree-nodes-list {
    overflow: hidden;
    position: relative;
    padding-bottom: 4px;
}

.sl-vue-tree-node-item {
    position: relative;
    display: flex;
    flex-direction: row;

    padding-left: 10px;
    padding-right: 10px;
    line-height: 36px;
    font-size: 16px;
    border: 1px solid transparent;
}

.sl-vue-tree-node-item.sl-vue-tree-cursor-inside {
    border: 1px solid black;
}

.sl-vue-tree-gap {
    width: 40px;
    min-height: 1px;
}

.sl-vue-tree-toggle {
    display: inline-block;
    text-align: left;
    width: 20px;
}

.sl-vue-tree-sidebar {
    margin-left: auto;
}

.sl-vue-tree-cursor {
    position: absolute;
    border: 1px solid black;
    height: 1px;
    width: 100%;
}

.sl-vue-tree-drag-info {
    position: absolute;
    opacity: 0.5;
    margin-left: 20px;
    margin-bottom: 20px;
    padding: 5px 10px;
}
</style>
