export interface ISocketCall {
    socketCallName: string;
    callbackFn?: (...args: any[]) => void;
}
