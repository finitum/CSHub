export const getRandomNumberLarge = () => {
    return Math.floor(Math.random() * (9999999999 - 1000000001)) + 1000000000;
};
