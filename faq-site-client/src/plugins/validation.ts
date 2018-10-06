import Vue from "vue";
import VeeValidate from "vee-validate";

export const emailValidator = {
    getMessage() {
        return "No correct email format.";
    },
    validate(value: string) {
        const regex = new RegExp("^[a-zA-Z.]*$");
        return regex.test(value);
    }
};

Vue.use(VeeValidate, { inject: false, delay: 1 });

