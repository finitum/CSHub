import { computed, SetupContext } from "@vue/composition-api";

export interface VModelProps<T> {
    value: T;
}

// Wrapped in a function to be able to use generics
export const vmodelProps = {
    value: { required: true },
};

export const useVModel = <T>(props: VModelProps<T>, context: SetupContext) => {
    const vmodel = computed({
        get: () => props.value,
        set: (val) => context.emit("input", val),
    });

    return {
        vmodel,
    };
};
