export const isValidEmail = (input: string) => {
    const regex = new RegExp(/^[a-zA-Z.]+[^.](-\d*)*$/);
    return regex.test(input) && input.includes(".") && !input.endsWith(".") && !input.endsWith("-");
};
