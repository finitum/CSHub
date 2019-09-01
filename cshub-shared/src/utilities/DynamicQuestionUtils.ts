export const checkDynamicQuestion = (
    answerExpression: string,
    seeds: number[],
    userAnswer: number | string
): {
    isCorrect: boolean;
    actualAnswer: number | string;
} => {
    return {
        isCorrect: false,
        actualAnswer: ""
    };
};

export const getAmountOfSeeds = (question: string, answer: string): number => {
    const seedIndexes = Array.from(
        new Set(
            (question + answer)
                .split(" ")
                .filter(word => word.startsWith("$seed"))
                .map(word => Number(word.replace("$seed", "")))
                .filter(index => !isNaN(index))
        )
    ).sort();

    if (seedIndexes.length === 0) return 0;

    let currSeedIndex = 0;
    seedIndexes.forEach(seedIndex => {
        if (seedIndex !== currSeedIndex) {
            throw new Error();
        }

        currSeedIndex++;
    });

    return seedIndexes.length;
};

export const hasRightAmountOfSeeds = (question: string, answer: string, amountOfSeeds: number): boolean => {
    const amountOfSeedsInQuestionAndAnswer = getAmountOfSeeds(question, answer);
    return amountOfSeedsInQuestionAndAnswer === amountOfSeeds;
};
