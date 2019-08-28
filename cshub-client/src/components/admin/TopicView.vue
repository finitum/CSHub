<template>
    <div>
        <v-btn color="primary" dark class="mb-2 mr-2" @click="save">Save</v-btn>
        <v-btn color="primary" dark class="mb-2 mr-2" @click="getNodes">Refresh</v-btn>
        <v-btn color="primary" dark class="mb-2" @click="create">Create topic</v-btn>

        <!-- replace by vuetify variant if it ever gets implemented -->
        <sl-vue-tree ref="slVueTree" v-model="nodes">
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
                <span v-else> </span>
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
import { NewTopicData, RestructureTopics } from "../../../../cshub-shared/src/api-calls/endpoints/topics";
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
        parent: ITopic,
        node: ISlTreeNodeModel<ITopic>,
        isSaving: false | NewTopicData[] = false
    ): Promise<ITopic | undefined> {
        if (node.data === undefined) {
            return;
        }

        if (node.data.id === undefined && isSaving) {
            const newTopic: NewTopicData = {
                name: node.title,
                parentHash: parent.hash
            };

            isSaving.push(newTopic);
        } else {
            const newnode: ITopic = {
                id: node.data.id,
                name: node.data.name,
                children: [],
                hash: node.data.hash,
                parent: parent
            };

            if (node.children) {
                for (const child of node.children) {
                    const currentChildren = await this.collectNodes(newnode, child, isSaving);
                    if (currentChildren) {
                        newnode.children.push(currentChildren);
                    }
                }
            }

            return newnode;
        }
    }

    private async save() {
        const topTopic = clone(dataState.topTopic);

        if (!topTopic) {
            uiState.setNotificationDialog({
                header: "Something's gone terribly wrong :(",
                text: "Please tell the devs you saw this message",
                on: true
            });
            return;
        }

        const newTopics: NewTopicData[] = [];
        topTopic.children = [];

        for (const node of this.nodes) {
            const topicTree = await this.collectNodes(topTopic, node, newTopics);
            if (topicTree) {
                topTopic.children.push(topicTree);
            }
        }

        try {
            if (uiState.studyNr) {
                const fullCopy = cloneDeep(topTopic);
                this.makeJsonifiable(fullCopy);

                await ApiWrapper.put(new RestructureTopics(uiState.studyNr, fullCopy, newTopics));

                getTopTopic(uiState.studyNr, true).then(topTopic => {
                    parseTopTopic(topTopic);
                    dataState.setTopics(topTopic);
                    EventBus.$emit(STUDY_CHANGED);
                });
            } else {
                this.getNodes();
            }
        } catch (err) {
            this.getNodes();
        }
    }

    private makeJsonifiable(topic: ITopic) {
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
    height: 800px;
}

.sl-vue-tree {
    position: relative;
    cursor: default;
    user-select: none;
}

.sl-vue-tree.sl-vue-tree-root {
    background-color: transparent;
    color: black;
    border-radius: 3px;
}

.sl-vue-tree-root > .sl-vue-tree-nodes-list {
    overflow: hidden;
    position: relative;
    padding-bottom: 4px;
}

.sl-vue-tree-selected > .sl-vue-tree-node-item {
    background-color: rgba(0, 0, 0, 0.12);
    color: #1976d2;
}

.sl-vue-tree-node-item:hover {
    background: rgba(0, 0, 0, 0.12);
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
    background-color: black;
    opacity: 0.5;
    margin-left: 20px;
    margin-bottom: 20px;
    padding: 5px 10px;
}
</style>
