export const getRandomNumberLarge = (): number => {
    return Math.floor(Math.random() * (999999999 - 100000001)) + 100000000;
};
