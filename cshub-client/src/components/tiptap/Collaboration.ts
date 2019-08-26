import { Extension } from "tiptap";
import { ISendable } from "./Sendable";
import * as Automerge from "automerge";
import { Message } from "automerge";
import { Map } from "immutable";

interface IOptions {
    debounce: number;
    docId: number;
    onSendable(sendable: ISendable): void;
    update(msg: Message): void;
}

export class Collaboration extends Extension {
    // is set by the Extension javascript superclass
    // @ts-ignore
    private options: IOptions;

    // @ts-ignore
    private editor: any;

    // Set in init()
    // @ts-ignore
    private getSendableSteps: (state: any) => void;

    private readonly doc: Automerge.Doc<any>;
    private readonly docSet: Automerge.DocSet<any>;
    private readonly connection: Automerge.Connection<any>;

    constructor(options: any) {
        super(options);

        this.doc = Automerge.init();
        this.docSet = new Automerge.DocSet();
        // options *is* assigned
        // @ts-ignore
        this.connection = new Automerge.Connection(this.docSet, this.options.update);
    }

    get name() {
        return "collaboration";
    }

    init() {
        this.connection.open();
        this.docSet.setDoc(String(this.options.docId), this.doc);
        this.options.onSendable({
            docId: this.options.docId,
            clock: Map()
        });

        this.getSendableSteps = this.debounce((state: any) => {
            console.log("state", state);

            // const sendable = sendableSteps(state);
            //
            // if (sendable) {
            //     this.options.onSendable({
            //         editor: this.editor,
            //         sendable: {
            //             version: sendable.version,
            //             steps: sendable.steps.map(step => step.toJSON()),
            //             clientID: sendable.clientID
            //         }
            //     });
            // }
        }, this.options.debounce);

        this.editor.on("transaction", ({ state }: any) => {
            this.getSendableSteps(state);
        });
    }

    get defaultOptions() {
        return {
            debounce: 250,
            onSendable: () => {},
            docId: -1,
            update: (msg: Message) => {
                const { state, view, schema } = this.editor;

                //     view.dispatch(
                //         receiveTransaction(
                //             state,
                //             steps.map(item => Step.fromJSON(schema, item.step)),
                //             steps.map(item => item.clientID)
                //         )
                //     );
            }
        };
    }

    get plugins() {
        return [];
    }

    debounce(fn: (...params: any[]) => any, delay: number): (...params: any[]) => any {
        let timeout: number | null;
        return function(...args: any[]) {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                fn(...args);
                timeout = null;
            }, delay);
        };
    }
}
