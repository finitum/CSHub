import Delta = require("quill-delta/dist/Delta");

export class delta2htmlRequest {
    constructor(public delta: Delta) {

    }
}

export class delta2htmlResponse {
    constructor(public html: any, public htmlFiltered: string) { }
}