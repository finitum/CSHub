export const checkForEmtpyOrSmallerThan = (input: string, length?: number): boolean => {

    if (input !== null || input !== undefined || input !== "") {
        if (!length) { length = 0; }
        return input.length >= length;
    } else {
        return false;
    }

};
