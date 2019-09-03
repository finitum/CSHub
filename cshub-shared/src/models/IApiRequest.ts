export interface IApiRequest<RESPONSETYPE> {
    URL: string;
    headers?: { [key: string]: string };
    params?: { [key: string]: string };

    /**
     * Doesn't need to be set: see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-type-inference-work-on-this-interface-interface-foot---
     * Typescript limitation :(
     * This might fix it https://github.com/microsoft/TypeScript/issues/30134
     */
    response?: RESPONSETYPE;
}
