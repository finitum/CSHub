<template>
    <div>
        <!-- replace by vuetify variant if it every gets implemented -->
        <sl-vue-tree ref="slVueTree" v-model="nodes" >
            <template slot="title" slot-scope="{ node }">
                <div v-if="isEditingName !== node.data.id" class="d-inline-block" @click="editingStart(node.data)">
                    {{ node.title }}
                </div>
                <v-text-field
                    v-else
                    v-model="node.data.name"
                    class="pt-0 d-inline-block"
                    single-line
                    hide-details
                    autofocus
                    append-icon="fas fa-check"
                    :counter="maxTopicNameLength"
                    :rules="[topicNameRule(node.data.name)]"
                    @keyup.enter="editingDone(node.data); node.title = node.data.name;"
                    @click:append="editingDone(node.data); node.title = node.data.name;"
                ></v-text-field>
            </template>

            <template slot="toggle" slot-scope="{ node }">
                <span v-if="!node.isLeaf">
                    <v-icon v-if="node.isExpanded">fas fa-chevron-down</v-icon>
                    <v-icon v-if="!node.isExpanded">fas fa-chevron-right</v-icon>
                </span>
            </template>
        </sl-vue-tree>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { cloneDeep } from "lodash";

import SlVueTree, { ISlTreeNodeModel } from "sl-vue-tree";
import "sl-vue-tree/dist/sl-vue-tree-minimal.css";

import { ITopic } from "../../../../cshub-shared/src/entities/topic";
import { RenameTopic } from "../../../../cshub-shared/src/api-calls/endpoints/topics/EditTopics";
import { dataState, uiState} from "../../store";
import { ApiWrapper } from "../../utilities";
import { getTopTopic } from "../../views/router/guards/setupRequiredDataGuard";


@Component({
    name: "TopicView",
    components: { SlVueTree }
})
export default class TopicView extends Vue {
    private updatedNodes: ISlTreeNodeModel<ITopic>[] = [];

    private isEditingName: false | number = false;

    private oldTopicName: string = "";

    private readonly maxTopicNameLength: number = 20;
    private readonly minTopicNameLength: number = 3;

    get nodes(): ISlTreeNodeModel<ITopic>[] {
        const topTopic = dataState.topTopic;
        if (topTopic) {
            return topTopic.children.map(child => this.createTreeViewFragment(child));
        } else {
            return [];
        }
    }

    set nodes(nodes: ISlTreeNodeModel<ITopic>[]) {
        this.updatedNodes = nodes;
    }

    private topicNameRule(name: string) {
        return name.length >= this.minTopicNameLength ? true : `Length must be more than ${this.minTopicNameLength}`;
    }

    private editingStart(item: ITopic) {
        this.oldTopicName = item.name;
        this.isEditingName = item.id;
    }

    private editingDone(item: ITopic) {
        if (this.topicNameRule(item.name) !== true) {
            item.name = this.oldTopicName;
        }

        this.isEditingName = false;
        this.rename(item);
    }

    private async rename(item: ITopic) {
        await ApiWrapper.put(new RenameTopic(item.id, item.name));

        const study = uiState.studyNr;
        if (study) {
            const topic = await getTopTopic(study, true);
            dataState.setTopics(topic);
        }
    }

    private createTreeViewFragment(topic: ITopic): ISlTreeNodeModel<ITopic> {
        const clonedTopic = cloneDeep(topic);

        const childFragments: ISlTreeNodeModel<ITopic>[] = [];

        for (const child of clonedTopic.children) {
            childFragments.push(this.createTreeViewFragment(child));
        }

        const isLeaf = clonedTopic.children.length === 0;

        delete clonedTopic.children;
        delete clonedTopic.parent;

        return {
            title: clonedTopic.name,
            isLeaf,
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
