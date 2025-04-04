export function camelCaseToNormalText(text: string): string {
    const upperCased = text.split('-').map((word) => `${word[0].toUpperCase()}${word.slice(1)}`);
    return upperCased.join(' ');
}

export function selectRandomFrom(array: any[], amount: number): any[] {
    if (amount > array.length) return [];

    const randomValues = [];
    let copy = [...array];

    for (let i = 0; i < amount; i++) {
        const random = Math.floor(Math.random() * copy.length);
        randomValues.push(copy[random]);

        copy[random] = copy[copy.length - 1];
        copy.pop();
    }
    return randomValues;
}
