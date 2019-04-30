<template>
    <v-container grid-list-xl style="max-width: 100%;">
        <v-layout row wrap>
            <v-flex :xs6="showMarkdownPreview">
                <!-- Shamelessly stolen from the quilljs homepage -->
                <div class="snow-wrapper" style="height: 100%">
                    <div class="snow-container" :id="editorId" style="height: 100%">
                        <div class="toolbar" v-show="editorSetup.showToolbar" style="border: none; padding: 1%;">
                            <span class="ql-formats">
                                <select class="ql-header" title="Header">
                                    <option value="1">Heading</option>
                                    <option value="2">Subheading</option>
                                    <option value="3">Subsubheading</option>
                                    <option selected>Normal</option>
                                </select>
                            </span>
                            <span class="ql-formats">
                                <button class="ql-bold"></button>
                                <button class="ql-italic"></button>
                                <button class="ql-underline"></button>
                                <button class="ql-clean"></button>
                                <select class="ql-color">
                                    <option value="inherit"/>
                                    <option value="rgb(230, 0, 0)"/>
                                    <option value="rgb(255, 153, 0)"/>
                                    <option value="rgb(255, 255, 0)"/>
                                    <option value="rgb(0, 138, 0)"/>
                                    <option value="rgb(0, 102, 204)"/>
                                    <option value="rgb(153, 51, 255)"/>
                                    <option value="rgb(250, 204, 204)"/>
                                    <option value="rgb(255, 235, 204)"/>
                                    <option value="rgb(204, 224, 245)"/>
                                    <option value="rgb(235, 214, 255)"/>
                                    <option value="rgb(187, 187, 187)"/>
                                    <option value="rgb(102, 185, 102)"/>
                                </select>
                                <select class="ql-background">
                                    <option value="rgba(0, 0, 0, 0)"/>
                                    <option value="rgb(230, 0, 0)"/>
                                    <option value="rgb(255, 153, 0)"/>
                                    <option value="rgb(255, 255, 0)"/>
                                    <option value="rgb(0, 138, 0)"/>
                                    <option value="rgb(0, 102, 204)"/>
                                    <option value="rgb(153, 51, 255)"/>
                                    <option value="rgb(250, 204, 204)"/>
                                    <option value="rgb(255, 235, 204)"/>
                                    <option value="rgb(204, 224, 245)"/>
                                    <option value="rgb(235, 214, 255)"/>
                                    <option value="rgb(187, 187, 187)"/>
                                    <option value="rgb(102, 185, 102)"/>
                                </select>
                            </span>
                            <span class="ql-formats">
                                <button class="ql-list" value="ordered"></button>
                                <button class="ql-list" value="bullet"></button>
                                <select class="ql-align" title="Alignment">
                                    <option label="left" selected></option>
                                    <option label="center" value="center"></option>
                                    <option label="right" value="right"></option>
                                    <option label="justify" value="justify"></option>
                                </select>
                            </span>
                            <span class="ql-formats">
                            <button class="ql-link"></button>
                            <button class="ql-image" style="display: none"></button>
                            <button class="ql-video"></button>
                            </span>
                            <span class="ql-formats">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{on}">
                                        <button v-on="on" class="ql-formula"></button>
                                    </template>
                                    <span>Add latex (ctrl + shift + a)</span>
                                </v-tooltip>


                                <v-tooltip bottom>
                                    <template v-slot:activator="{on}">
                                        <v-menu
                                                v-model="otherPeoplesMenu"
                                                :close-on-content-click="false"
                                                :nudge-width="200"
                                                offset-x
                                        >
                                            <v-btn
                                                v-on="on"
                                                slot="activator"
                                                dark
                                                flat
                                                :ripple="false"
                                                small
                                                class="quillIcon"
                                                style="margin: 0">
                                                <v-icon :color="darkMode ? 'white' : 'black'">fas fa-users</v-icon>
                                            </v-btn>
                                            <v-card>
                                                <v-list>
                                                    <v-list-tile avatar :key="user[1].id"
                                                                 v-for="user in Array.from(otherPeoples)">
                                                        <v-list-tile-avatar>
                                                            <img :src="getAvatarURL(user[1].id)">
                                                        </v-list-tile-avatar>

                                                        <v-list-tile-content>
                                                            <v-list-tile-title>{{user[1].firstname}} {{user[1].lastname}}</v-list-tile-title>
                                                        </v-list-tile-content>
                                                    </v-list-tile>
                                                    <v-list-tile v-if="otherPeoples.size === 0">You are alone here :(</v-list-tile>
                                              </v-list>
                                            </v-card>
                                        </v-menu>
                                    </template>
                                    <span>View current users</span>
                                </v-tooltip>
                            </span>
                            <span class="ql-formats">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{on}">
                                        <v-btn
                                            v-on="on"
                                            slot="activator"
                                            dark
                                            flat
                                            :ripple="false"
                                            small
                                            class="quillIcon"
                                            @click="setMarkDown"
                                            style="margin: 0"
                                        >
                                            <v-icon :color="darkMode ? 'white' : 'black'">fas fa-marker</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Edit markdown (ctrl + m)</span>
                                </v-tooltip>

                                <v-tooltip bottom>
                                    <template v-slot:activator="{on}">
                                        <v-btn
                                            v-on="on"
                                            slot="activator"
                                            dark
                                            flat
                                            :ripple="false"
                                            small
                                            class="quillIcon"
                                            @click="setMarkdownPreview"
                                            style="margin: 0"
                                        >
                                            <v-icon :color="darkMode ? 'white' : 'black'">fas fa-desktop</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Show markdown preview</span>
                                </v-tooltip>
                            </span>
                        </div>
                        <div class="editor" style="overflow: hidden;">
                        </div>
                    </div>
                </div>
            </v-flex>
            <v-flex xs6 v-show="showMarkdownPreview">
                <div v-html="markdownHTMLPreview" style="margin-top: 10px; overflow-y: auto" id="htmlOutput"></div>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
    import Vue from "vue";
    import Delta from "quill-delta/dist/Delta";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import dayjs from "dayjs";
    import katex from "katex";
    import "katex/dist/katex.min.css";

    import {debounce} from "lodash";

    // @ts-ignore
    import QuillCursors from "quill-cursors";

    import CodeMirror from "codemirror";

    import Quill, {RangeStatic, Sources} from "quill";
    import "quill/dist/quill.core.css";
    import "quill/dist/quill.snow.css";

    import {mathquill4quill} from "../../plugins/quill/mathquill4quill.min";
    import {ImageResize} from "../../plugins/quill/ImageResize.min";

    import defaultOptions from "../../../../cshub-shared/src/utilities/QuillDefaultOptions";
    import {IQuillEditSetup} from "./IQuillEditSetup";

    import {logStringConsole} from "../../utilities";
    import {idGenerator} from "../../utilities/id-generator";

    import {MarkdownLatexQuill} from "../../../../cshub-shared/src/utilities/MarkdownLatexQuill";

    import uiState from "../../store/ui";
    import {
        ClientCursorUpdated,
        ClientDataUpdated,
        IRealtimeEdit,
        IRealtimeSelect,
        ServerCursorUpdated,
        ServerDataUpdated,
        TogglePostJoin
    } from "../../../../cshub-shared/src/api-calls/realtime-edit";
    import {SocketWrapper} from "../../utilities/socket-wrapper";
    import {Routes} from "../../../../cshub-shared/src/Routes";
    import userState from "../../store/user";
    import {getRandomNumberLarge} from "../../../../cshub-shared/src/utilities/Random";
    import {transformFromArray} from "../../../../cshub-shared/src/utilities/DeltaHandler";
    import {IUserCensored} from "../../../../cshub-shared/src/models";
    import {Requests} from "../../../../cshub-shared/src/api-calls";
    import {getHTML} from "../../../../cshub-shared/src/utilities/EditsHandler";
    import {colorize} from "../../utilities/codemirror-colorize";

    (window as any).Quill = Quill;
    (window as any).Quill.register("modules/resize", ImageResize);
    (window as any).Quill.register("modules/cursors", QuillCursors);

    @Component({
        name: "QuillEditor"
    })
    export default class QuillEditor extends Vue {


        /**
         * Data
         */
        @Prop({
            type: null,
            required: true,
            default: {allowEdit: true, showToolbar: true, postHash: -1}
        }) private editorSetup: IQuillEditSetup;
        @Prop(null) private initialValueProp: Delta;

        // Editor related options
        private editor: Quill = null;
        private editorOptions: any = defaultOptions;
        private editorId = "";
        private initialValue: Delta;

        // Realtime edit related variables
        private lastFewEdits: IRealtimeEdit[] = [];
        private myCursor: IRealtimeSelect;
        private otherPeoples: Map<number, IUserCensored> = new Map();
        private otherPeoplesMenu = false;

        private checkingInterval: number = -1;
        private awaitingIds: Set<number> = new Set();
        private previousAwaitingIds: Set<number> = new Set();

        // Markdown editor related variables
        private currentlySelectedDomNodes: object[] = [];
        private showMarkdownPreview = false;
        private markdownHTMLPreview = "";
        private refreshDebounce = debounce(this.refreshHTML, 500);


        /**
         * Lifecycle hooks
         */
        private mounted() {

            if (this.editorSetup.allowEdit) {

                // Check every 10 seconds if the edits are arriving
                this.checkingInterval = setInterval(() => {
                    const oldNewIntersect = new Set([...this.awaitingIds].filter((x) => this.previousAwaitingIds.has(x)));
                    if (oldNewIntersect.size !== 0 && this.awaitingIds.size !== 0) {
                        this.$router.push(Routes.INDEX);
                        uiState.setNotificationDialogState({
                            header: "Edit error!",
                            text: "It seems like the server is not receiving our edits... Try again but refresh often to check whether the edits actually arrive at the server side",
                            on: true
                        });
                    } else {
                        this.previousAwaitingIds = new Set(this.awaitingIds);
                    }
                }, 10000);

                this.sockets.subscribe(ServerDataUpdated.getURL, (data: ServerDataUpdated) => {

                    if (data.error) {
                        this.$router.push(Routes.INDEX);
                        uiState.setNotificationDialogState({
                            header: "Edit error!",
                            text: data.error,
                            on: true
                        });
                    } else {
                        const lastEdit = this.lastFewEdits[this.lastFewEdits.length - 1];

                        if (lastEdit && userState.userModel.id !== data.edit.userId) {
                            if (lastEdit.serverGeneratedId === data.edit.prevServerGeneratedId) {
                                this.lastFewEdits.push(data.edit);
                                this.editor.updateContents(data.edit.delta);
                            } else {
                                const delta = transformFromArray(this.lastFewEdits, data.edit, true);
                                data.edit.delta = delta;
                                this.lastFewEdits.push(data.edit);

                                this.editor.updateContents(delta);
                            }
                        } else {
                            const index = this.lastFewEdits.findIndex((x) => x.userGeneratedId === data.edit.userGeneratedId);

                            if (index !== -1) {
                                this.lastFewEdits.splice(index, 1);
                                this.lastFewEdits.push(data.edit);
                            }

                            if (this.awaitingIds.has(data.edit.userGeneratedId)) {
                                this.awaitingIds.delete(data.edit.userGeneratedId);
                            }
                        }
                    }
                });

                this.sockets.subscribe(ServerCursorUpdated.getURL, (data: ServerCursorUpdated) => {

                    if (userState.userModel.id !== data.select.user.id) {
                        if (!data.select.active) {
                            this.otherPeoples.delete(data.select.user.id);
                            this.$forceUpdate();
                            this.editor.getModule("cursors").removeCursor(data.select.user.id);
                        } else {
                            if (!this.otherPeoples.has(data.select.user.id)) {
                                this.otherPeoples.set(data.select.user.id, data.select.user);
                                this.$forceUpdate();
                                const cursor = this.editor.getModule("cursors").createCursor(data.select.user.id, data.select.userName, data.select.color);
                                cursor.range = data.select.selection;
                            } else {
                                this.editor.getModule("cursors").moveCursor(data.select.user.id, data.select.selection);
                            }
                        }
                    }
                });

                this.myCursor = {
                    color: null,
                    user: userState.userModel,
                    userName: null,
                    postHash: this.editorSetup.postHash,
                    selection: null,
                    active: true
                };

                SocketWrapper.emitSocket(new TogglePostJoin(
                    this.editorSetup.postHash,
                    true,
                    (serverData: IRealtimeEdit, selects: IRealtimeSelect[]) => {

                        this.lastFewEdits.push({
                            postHash: this.editorSetup.postHash,
                            delta: serverData.delta,
                            timestamp: serverData.timestamp,
                            serverGeneratedId: serverData.serverGeneratedId,
                            userGeneratedId: serverData.userGeneratedId
                        });

                        this.setupQuill(serverData.delta, selects);

                    }), this.$socket);
            } else {
                this.setupQuill(this.initialValueProp, null);
            }
        }

        private getAvatarURL(id: number) {
            const profileurl = Requests.PROFILE.replace(/:userId/, id.toString());
            return `${process.env.VUE_APP_API_URL || (window as any).appConfig.VUE_APP_API_URL}${profileurl}`;
        }

        private setupQuill(delta: Delta, selects: IRealtimeSelect[]) {
            if (delta === null) {
                this.$router.push(Routes.INDEX);
            } else {
                this.initialValue = delta;

                (window as any).katex = katex;

                logStringConsole("Mounted quillInstance with edit: " + this.editorSetup.allowEdit);

                this.editorId = idGenerator();

                mathquill4quill(Quill, (window as any).MathQuill); // Load mathquill4quillMin after all its dependencies are accounted for

                // setTimeout without timeout magically works, gotta love JS (though with 0 does wait for the next 'JS clock tick', so probably a Vue thing that hasn't been synchronized yet with the DOM and so quillInstance will error)
                setTimeout(() => {
                    logStringConsole("Initializing quillInstance with edit: " + this.editorSetup.allowEdit);
                    this.initQuill(selects); // Actually init quillInstance itself
                });
            }
        }

        private beforeDestroy() {
            // Remove the editor on destroy
            this.editor = null;
            clearInterval(this.checkingInterval);
            SocketWrapper.emitSocket(new ClientCursorUpdated({...this.myCursor, active: false}), this.$socket);
            SocketWrapper.emitSocket(new TogglePostJoin(this.editorSetup.postHash,
                false,
                () => {
                    this.sockets.unsubscribe(ServerDataUpdated.getURL);
                    this.sockets.unsubscribe(ServerCursorUpdated.getURL);
                }), this.$socket);
        }

        @Watch("initialValueProp")
        private checkForContentUpdate(newValue: Delta) {
            if (!this.editorSetup.allowEdit) {
                this.editor.setContents(newValue);
            }
        }

        /**
         * Computed properties
         */
        get userId(): number {
            return userState.userModel.id;
        }

        get darkMode(): boolean {
            return uiState.darkMode;
        }

        /**
         * Methods
         */
        private setMarkDown(): void {
            const sel = this.editor.getSelection();
            if (sel !== null) {
                const obKeys = Object.keys(this.editor.getFormat(sel));
                if (obKeys.length === 0) {
                    this.editor.format(MarkdownLatexQuill.blotName, true, "user");
                } else if (obKeys[0] === MarkdownLatexQuill.blotName) {
                    this.editor.removeFormat(sel.index, sel.length, "user");
                } else {
                    this.editor.format(MarkdownLatexQuill.blotName, true, "user");
                }
            }

        }

        private setMarkdownPreview(): void {
            this.showMarkdownPreview = !this.showMarkdownPreview;

            this.$emit("markdownPreviewToggle", this.showMarkdownPreview);

            if (this.showMarkdownPreview) {
                this.markdownHTMLPreview = getHTML(this.editor, document, window);
            }
        }

        private getDelta() {
            return this.editor.getContents();
        }

        private initQuill(selects: IRealtimeSelect[]) {
            // Create the editor
            this.editorOptions.bounds = `#${this.editorId} .editor`;
            this.editorOptions.modules.toolbar = `#${this.editorId} .toolbar`;

            if (!this.editorSetup.allowEdit) {
                this.editorOptions.placeholder = "";
            }
            this.editor = new Quill(`#${this.editorId} .editor`, this.editorOptions);

            (this.editor as any).enableMathQuillFormulaAuthoring(); // Enable mathquill4quillMin
            this.editor.enable(false); // Hide it before we set the content

            // @ts-ignore
            this.editor.keyboard.addBinding({key: "m", ctrlKey: true}, (range: RangeStatic, context: any) => {
                this.setMarkDown();
            });

            const callback = (range: RangeStatic, context: any) => {
                // @ts-ignore
                this.editor.theme.tooltip.edit("formula");
                const textArea = document.querySelector(`#${this.editorId} .editor .ql-editing .mq-editable-field .mq-textarea textarea`);

                // @ts-ignore
                textArea.focus();
                const listener = (evt: Event) => {
                    // @ts-ignore
                    if (evt.keyCode === 13) {
                        const saveButton = document.querySelector(`#${this.editorId} .editor .ql-editing .ql-action`);

                        // @ts-ignore
                        saveButton.click();

                        textArea.removeEventListener("keyup", listener);
                    }
                };

                textArea.addEventListener("keyup", listener);
            };

            // @ts-ignore
            this.editor.keyboard.addBinding({key: "a", ctrlKey: true, altKey: true}, callback);

            // @ts-ignore
            this.editor.keyboard.addBinding({key: "a", ctrlKey: true, shiftKey: true}, callback);

            const markdownLatexQuill = new MarkdownLatexQuill(Quill);
            markdownLatexQuill.registerQuill();

            // Set the content (with input a quillInstance delta object)
            if (this.initialValue) {
                this.editor.setContents(this.initialValue);
            }

            this.$emit("markdownPreviewToggle", this.showMarkdownPreview);

            // Show the editor again
            if (this.editorSetup.allowEdit) {
                this.editor.enable(true);

                if (selects !== null) {
                    for (const select of selects) {
                        if (select.user.id !== userState.userModel.id) {

                            if (!this.otherPeoples.has(select.user.id)) {
                                this.otherPeoples.set(select.user.id, select.user);
                                this.$forceUpdate();
                            }
                            const cursor = this.editor.getModule("cursors").createCursor(select.user.id, select.userName, select.color);
                            cursor.range = select.selection;
                        }
                    }
                }

                // Specify function to be called on change
                this.editor.on("text-change", this.textChanged);
                this.editor.on("selection-change", this.selectionChanged);

                this.editor.focus();
            }
        }

        private textChanged(delta: Delta, oldContents: Delta, source: Sources) {
            if (source === "user" && this.editor !== null) {

                const lastEdit = this.lastFewEdits[this.lastFewEdits.length - 1];
                let prevServerId: number = -1;
                let prevUserId: number = -1;
                if (lastEdit) {
                    prevServerId = lastEdit.serverGeneratedId;
                    prevUserId = lastEdit.userGeneratedId;
                }

                const randomNumberLarge = getRandomNumberLarge();
                const userEdit: IRealtimeEdit = {
                    postHash: this.editorSetup.postHash,
                    delta,
                    timestamp: dayjs(),
                    userId: this.userId,
                    prevServerGeneratedId: prevServerId,
                    userGeneratedId: randomNumberLarge,
                    prevUserGeneratedId: prevUserId
                };

                this.lastFewEdits.push(userEdit);
                if (this.lastFewEdits.length > 20) {
                    this.lastFewEdits.splice(0, this.lastFewEdits.length - 21);
                }

                this.awaitingIds.add(randomNumberLarge);
                SocketWrapper.emitSocket(new ClientDataUpdated(userEdit), this.$socket);
            }

            if (this.editor !== null && this.showMarkdownPreview) {
                this.refreshDebounce();
            }

        }

        private refreshHTML() {
            this.markdownHTMLPreview = getHTML(this.editor, document, window);

            Vue.nextTick(() => {
                colorize(null, CodeMirror);
            });
        }

        private selectionChanged(range: RangeStatic, oldRange: RangeStatic, source: any) {
            SocketWrapper.emitSocket(new ClientCursorUpdated({
                ...this.myCursor,
                selection: range
            }), this.$socket);

            if (range !== null && range.length !== 0) {
                const selection = this.editor.getFormat(range);
                const obKeys = Object.keys(selection);
                if (obKeys[0] === MarkdownLatexQuill.blotName) {

                    const bounds = this.editor.getBounds(range.index, range.length);

                    const currentLineArray = this.editor.getLines(range);

                    if (currentLineArray.length > 0) {

                        const newLineArray = [];

                        let prev = currentLineArray[0];

                        while (true) {
                            if (prev.domNode.className === MarkdownLatexQuill.blotName) {
                                if (prev.prev !== null && prev.prev.domNode.className === MarkdownLatexQuill.blotName) {
                                    prev = prev.prev;
                                } else {
                                    break;
                                }
                            } else {
                                break;
                            }
                        }

                        while (true) {
                            if (prev !== null && prev.domNode.className === MarkdownLatexQuill.blotName) {
                                newLineArray.push(prev);
                                prev = prev.next;
                            } else {
                                break;
                            }
                        }

                        this.currentlySelectedDomNodes = newLineArray;
                    }

                }
            }
        }
    }
</script>

<style lang="scss">
    @import "../../styling/vars";

    .theme--dark {
        svg > {
            .ql-fill {
                fill: $fg-dark;
            }

            .ql-stroke {
                stroke: $fg-dark;
            }
        }

        .ql-picker-label {
            color: $fg-dark;
        }

        .ql-picker-options {
            background: $bg-dark;
        }

        .ql-picker-item {
            color: $fg-dark;
        }
    }

    .editor {
        min-height: 100px;
        height: 90%;
        border: none !important;
    }

    .quillIcon {
        min-width: 10px;
        padding: 0;
    }

    #htmlOutput {
        height: 100%;

        p {
            margin-bottom: 0;
        }
    }


    .editor > > > .mklqx {
        white-space: pre-wrap;
        background-color: rgba(182, 182, 182, 0.13);
    }
</style>
