<template>
    <div class="editor">
        <v-container style="max-width: 100%;" class="fullHeight pa-0">
            <v-layout row wrap class="fullHeight">
                <v-flex class="fullHeight" @keydown="onKeyPress">
                    <editor-menu-bar v-slot="{ commands, isActive }" :editor="editor">
                        <div class="menubar">
                            <v-btn
                                :class="{ 'is-active': isActive.bold() }"
                                color="secondary"
                                class="ma-1"
                                @click="commands.bold"
                            >
                                <v-icon>
                                    fas fa-bold
                                </v-icon>
                            </v-btn>

                            <v-btn
                                :class="{ 'is-active': isActive.strike() }"
                                color="secondary"
                                class="ma-1"
                                @click="commands.strike"
                            >
                                <v-icon>
                                    fas fa-strikethrough
                                </v-icon>
                            </v-btn>

                            <v-btn
                                :class="{ 'is-active': isActive.italic() }"
                                color="secondary"
                                class="ma-1"
                                @click="commands.italic"
                            >
                                <v-icon>
                                    fas fa-italic
                                </v-icon>
                            </v-btn>

                            <v-btn
                                :class="{ 'is-active': isActive.underline() }"
                                color="secondary"
                                class="ma-1"
                                @click="commands.underline"
                            >
                                <v-icon>
                                    fas fa-underline
                                </v-icon>
                            </v-btn>

                            <v-btn
                                :class="{ 'is-active': isActive.heading({ level: 1 }) }"
                                color="secondary"
                                class="ma-1"
                                @click="commands.heading"
                            >
                                <v-icon>
                                    fas fa-heading
                                </v-icon>
                            </v-btn>

                            <v-btn
                                :class="{ 'is-active': isActive.bullet_list() }"
                                color="secondary"
                                class="ma-1"
                                @click="commands.bullet_list"
                            >
                                <v-icon>
                                    fas fa-list
                                </v-icon>
                            </v-btn>

                            <v-btn
                                :class="{ 'is-active': isActive.ordered_list() }"
                                color="secondary"
                                class="ma-1"
                                @click="commands.ordered_list"
                            >
                                <v-icon>
                                    fas fa-list-ol
                                </v-icon>
                            </v-btn>

                            <v-btn
                                :class="{ 'is-active': isActive.code_block() }"
                                color="secondary"
                                class="ma-1"
                                @click="commands.code_block"
                            >
                                <v-icon>
                                    fas fa-code
                                </v-icon>
                            </v-btn>

                            <v-btn
                                :class="{ 'is-active': isActive.blockquote() }"
                                color="secondary"
                                class="ma-1"
                                @click="commands.blockquote"
                            >
                                <v-icon>
                                    fas fa-quote-right
                                </v-icon>
                            </v-btn>
                        </div>
                    </editor-menu-bar>
                    <v-card class="pa-3">
                        <editor-content class="editor__content" :editor="editor"></editor-content>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";
import { Editor, EditorContent, EditorMenuBar, insertText } from "tiptap";
import {
    Blockquote,
    CodeBlock,
    HardBreak,
    Heading,
    OrderedList,
    BulletList,
    ListItem,
    TodoItem,
    TodoList,
    Bold,
    Strike,
    Underline,
    Code,
    Italic,
    Link,
    History,
    TrailingNode
} from "tiptap-extensions";
import { TogglePostJoin, AutomergeUpdatePackage } from "../../../../cshub-shared/src/api-calls/tiptap-realtime-edit";
import { SocketWrapper } from "../../utilities/socket-wrapper";
import { ITiptapEditSetup } from "./ITiptapEditSetup";
import { Collaboration } from "./Collaboration";
import { Message } from "automerge";

@Component({ name: "TiptapEditor", components: { EditorContent, EditorMenuBar } })
export default class TiptapEditor extends Vue {
    private editor: any = null;
    @Prop({
        required: true,
        default: { allowEdit: true, showToolbar: true, postHash: -1 }
    })
    private editorSetup!: ITiptapEditSetup;

    private mounted() {
        this.editor = new Editor({
            extensions: [
                new Blockquote(),
                new BulletList(),
                new CodeBlock(),
                new HardBreak(),
                new Heading({ levels: [1, 2, 3, 4, 5, 6] }),
                new ListItem(),
                new OrderedList(),
                new TodoItem(),
                new TodoList(),
                new Bold(),
                new Strike(),
                new Underline(),
                new Code(),
                new Italic(),
                new Link(),
                new History(),
                new TrailingNode({
                    node: "paragraph",
                    notAfter: ["paragraph"]
                }),
                new Collaboration({
                    debounce: 250,
                    docId: this.editorSetup.postHash,
                    update: this.onEditorUpdate
                })
            ],
            content: ""
        });

        // this.sockets.subscribe(ServerDataUpdated.getURL, (data: ServerDataUpdated) => {
        //     console.log(data);
        // });
        //
        // this.sockets.subscribe(ServerCursorUpdated.getURL, (data: ServerCursorUpdated) => {
        //     console.log(data);
        // });


        // is sent twice for some reason
        SocketWrapper.emitSocket(
            new TogglePostJoin(this.editorSetup.postHash, true, () => {
                console.log("loaded");
            }),
            this.$socket
        );
    }

    private onEditorUpdate(msg: Message) {
        console.log(msg);
        SocketWrapper.emitSocket(new AutomergeUpdatePackage(msg), this.$socket);
    }

    private onKeyPress(event: KeyboardEvent) {
        if (event.key === "Tab") {
            console.log("tab");

            event.preventDefault();
            return false;
        }
    }

    private beforeDestroy() {
        this.editor.destroy();
        SocketWrapper.emitSocket(
            new TogglePostJoin(this.editorSetup.postHash, false, () => {
                // this.sockets.unsubscribe(ServerDataUpdated.getURL);
                // this.sockets.unsubscribe(ServerCursorUpdated.getURL);
            }),
            this.$socket
        );
    }
}
</script>

<style lang="scss">
$color-black: #000000;
$color-white: #ffffff;
$color-grey: #dddddd;

.editor {
    margin: 0 auto 5rem auto;

    &__content {
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;

        * {
            caret-color: currentColor;
        }

        pre {
            padding: 0.7rem 1rem;
            border-radius: 5px;
            font-size: 0.8rem;
            overflow-x: auto;

            code {
                display: block;
            }
        }

        p code {
            display: inline-block;
            padding: 0 0.4rem;
            border-radius: 5px;
            font-size: 0.8rem;
            font-weight: bold;
        }

        ul,
        ol {
            padding-left: 1rem;
        }

        li > p,
        li > ol,
        li > ul {
            margin: 0;
        }

        a {
            color: inherit;
        }

        blockquote {
            padding-left: 0.8rem;
            font-style: italic;

            p {
                margin: 0;
            }
        }

        img {
            max-width: 100%;
            border-radius: 3px;
        }

        table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            margin: 0;
            overflow: hidden;

            td,
            th {
                min-width: 1em;
                border: 2px solid $color-grey;
                padding: 3px 5px;
                vertical-align: top;
                box-sizing: border-box;
                position: relative;
                > * {
                    margin-bottom: 0;
                }
            }

            th {
                font-weight: bold;
                text-align: left;
            }

            .selectedCell:after {
                z-index: 2;
                position: absolute;
                content: "";
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                background: rgba(200, 200, 255, 0.4);
                pointer-events: none;
            }

            .column-resize-handle {
                position: absolute;
                right: -2px;
                top: 0;
                bottom: 0;
                width: 4px;
                z-index: 20;
                background-color: #adf;
                pointer-events: none;
            }
        }

        .tableWrapper {
            margin: 1em 0;
            overflow-x: auto;
        }

        .resize-cursor {
            cursor: ew-resize;
            cursor: col-resize;
        }
    }
}

.menubar {
    margin-bottom: 1rem;
    transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;

    &.is-hidden {
        visibility: hidden;
        opacity: 0;
    }

    &.is-focused {
        visibility: visible;
        opacity: 1;
        transition: visibility 0.2s, opacity 0.2s;
    }

    &__button {
        font-weight: bold;
        display: inline-flex;
        background: transparent;
        border: 0;
        padding: 0.2rem 0.5rem;
        margin-right: 0.2rem;
        border-radius: 3px;
        cursor: pointer;

        &:hover {
            background-color: rgba($color-black, 0.05);
        }

        &.is-active {
            background-color: rgba($color-black, 0.1);
        }
    }

    span#{&}__button {
        font-size: 13.3333px;
    }
}
</style>
