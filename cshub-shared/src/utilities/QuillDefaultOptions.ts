export default {
    theme: "snow",
    placeholder: "Type here ...",
    modules: {
        cursors: true,
        resize:  {},
        keyboard: {
            bindings: {
                "list autofill": {
                    prefix: /^\s*?(\d+\.|-|\[ ?]|\[x])$/
                }
            }
        }
    }
};
