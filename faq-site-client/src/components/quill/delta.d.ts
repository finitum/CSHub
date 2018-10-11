// Thanks to https://github.com/maximkornilov/types-quill-delta/blob/master/index.d.ts

export type DeltaOperation = ({ insert: any } | { delete: number } | { retain: number }) & OptionalAttributes;

export interface StringMap {
    [key: string]: any;
}

export interface OptionalAttributes {
    attributes?: StringMap;
}

export interface DeltaStatic {
    ops?: DeltaOperation[];
    retain(length: number, attributes?: StringMap): DeltaStatic;
    delete(length: number): DeltaStatic;
    filter(predicate: (op: DeltaOperation) => boolean): DeltaOperation[];
    forEach(predicate: (op: DeltaOperation) => void): void;
    insert(text: any, attributes?: StringMap): DeltaStatic;
    map<T>(predicate: (op: DeltaOperation) => T): T[];
    partition(predicate: (op: DeltaOperation) => boolean): [DeltaOperation[], DeltaOperation[]];
    reduce<T>(predicate: (acc: T, curr: DeltaOperation, idx: number, arr: DeltaOperation[]) => T, initial: T): T;
    chop(): DeltaStatic;
    length(): number;
    slice(start?: number, end?: number): DeltaStatic;
    compose(other: DeltaStatic): DeltaStatic;
    concat(other: DeltaStatic): DeltaStatic;
    diff(other: DeltaStatic, index?: number): DeltaStatic;
    eachLine(predicate: (line: DeltaStatic, attributes: StringMap, idx: number) => any, newline?: string): DeltaStatic;
    transform(index: number): number;
    transform(other: DeltaStatic, priority: boolean): DeltaStatic;
    transformPosition(index: number): number;
}

declare namespace QuillDelta {
    export class Delta implements DeltaStatic {
        constructor(ops?: DeltaOperation[] | { ops: DeltaOperation[] });
        ops?: DeltaOperation[];
        retain(length: number, attributes?: StringMap): DeltaStatic;
        delete(length: number): DeltaStatic;
        filter(predicate: (op: DeltaOperation) => boolean): DeltaOperation[];
        forEach(predicate: (op: DeltaOperation) => void): void;
        insert(text: any, attributes?: StringMap): DeltaStatic;
        map<T>(predicate: (op: DeltaOperation) => T): T[];
        partition(predicate: (op: DeltaOperation) => boolean): [DeltaOperation[], DeltaOperation[]];
        reduce<T>(predicate: (acc: T, curr: DeltaOperation, idx: number, arr: DeltaOperation[]) => T, initial: T): T;
        chop(): DeltaStatic;
        length(): number;
        slice(start?: number, end?: number): DeltaStatic;
        compose(other: DeltaStatic): DeltaStatic;
        concat(other: DeltaStatic): DeltaStatic;
        diff(other: DeltaStatic, index?: number): DeltaStatic;
        eachLine(predicate: (line: DeltaStatic, attributes: StringMap, idx: number) => any, newline?: string): DeltaStatic;
        transform(index: number): number;
        transform(other: DeltaStatic, priority: boolean): DeltaStatic;
        transformPosition(index: number): number;
    }
}

export default QuillDelta.Delta;