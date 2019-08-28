import Vue from "vue";
import VeeValidate from "vee-validate";
import { isValidEmail } from "../../../cshub-shared/src/utilities/TUEmail";

export const emailValidator = {
    getMessage() {
        return "Use your e-mail, not NetID (e.g. C.S.Hub@student.tudelft.nl)";
    },
    validate(value: string) {
        return isValidEmail(value);
    }
};

Vue.use(VeeValidate, { inject: true, delay: 1 });
