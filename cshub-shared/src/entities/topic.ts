export interface ITopic {
    id: number;

    parent: ITopic | null;

    children: ITopic[];

    name: string;

    hash: number;
}
