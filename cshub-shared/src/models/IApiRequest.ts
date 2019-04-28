export interface IApiRequest {
    URL: string;
    headers?: any; // Can the type be narrowed down? Just copied it from the axios d.ts file.
}
