import Vue from "vue";
import VeeValidate from "vee-validate";

export const emailValidator = {
    getMessage() {
        return "Use your e-mail, not NetID (e.g. C.S.Hub@student.tudelft.nl)";
    },
    validate(value: string) {
        const regex = new RegExp("^[a-zA-Z.]*$");
        if (regex.test(value) && value.includes(".")) {
            return true;
        } else {
            return false;
        }
    }
};

Vue.use(VeeValidate, { inject: false, delay: 1 });

