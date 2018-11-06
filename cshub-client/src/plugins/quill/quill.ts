// Type definitions for Quill 2.0
// Project: https://github.com/quilljs/quill/
// Definitions by: Sumit <https://github.com/sumitkm>
//                 Guillaume <https://github.com/guillaume-ro-fr>
//                 James Garbutt <https://github.com/43081j>
//                 Aniello Falcone <https://github.com/AnielloFalcone>
//                 Mohammad Hossein Amri <https://github.com/mhamri>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.9

import Delta from "quill-delta";

/**
 * A stricter type definition would be:
 *
 *   type DeltaOperation ({ insert: any } | { delete: number } | { retain: number }) & OptionalAttributes;
 *
 *  But this would break a lot of existing code as it would require manual discrimination of the union types.
 */
export type Sources = "api" | "user" | "silent";

export interface StringMap {
    [key: string]: any;
}

export interface OptionalAttributes {
    attributes?: StringMap;
}

export type TextChangeHandler = (delta: Delta, oldContents: Delta, source: Sources) => any;
export type SelectionChangeHandler = (range: RangeStatic, oldRange: RangeStatic, source: Sources) => any;
export type EditorChangeHandler = ((name: "text-change", delta: Delta, oldContents: Delta, source: Sources) => any)
    | ((name: "selection-change", range: RangeStatic, oldRange: RangeStatic, source: Sources) => any);

export interface QuillOptionsStatic {
    debug?: string | boolean;
    modules?: StringMap;
    placeholder?: string;
    readOnly?: boolean;
    theme?: string;
    formats?: string[];
    bounds?: HTMLElement | string;
    scrollingContainer?: HTMLElement | string;
    strict?: boolean;
}

export interface RangeStatic {
    index: number;
    length: number;
}

export class RangeStatic implements RangeStatic {


    public index: number;
    public length: number;
    constructor() {}}

export interface EventEmitter {
    on(eventName: "text-change", handler: TextChangeHandler): EventEmitter;

    on(eventName: "selection-change", handler: SelectionChangeHandler): EventEmitter;

    on(eventName: "editor-change", handler: EditorChangeHandler): EventEmitter;

    once(eventName: "text-change", handler: TextChangeHandler): EventEmitter;

    once(eventName: "selection-change", handler: SelectionChangeHandler): EventEmitter;

    once(eventName: "editor-change", handler: EditorChangeHandler): EventEmitter;

    off(eventName: "text-change", handler: TextChangeHandler): EventEmitter;

    off(eventName: "selection-change", handler: SelectionChangeHandler): EventEmitter;

    off(eventName: "editor-change", handler: EditorChangeHandler): EventEmitter;
}
