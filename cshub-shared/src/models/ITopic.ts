export interface ITopic {
    children?: ITopic[];
    name: string;
    hash: number;
    id: number;
    study?: number;
}
