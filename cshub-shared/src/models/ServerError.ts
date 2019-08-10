export const INPUTINVALID =
    "Your input was invalid. This shouldn't have happened as all validation is also done client side, you cheatin there ;)? If not, we're sorry, something is wrong";

export class ServerError {
    constructor(public message: string, public showRefresh = false) {}
}
