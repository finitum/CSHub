import Delta = require("quill-delta/dist/Delta");

export class delta2htmlRequest {
    constructor(public delta: Delta) {

    }
}

export class delta2htmlRespons {
    constructor(public html, public htmlFiltered: string) { }
}