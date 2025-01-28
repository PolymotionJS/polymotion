import { Easing } from ".";

export type InterpolationOptions = {
    easing?: (t: number) => number;
}

export function interpolate(input: number, inputRange: number[], outputRange: number[], options: InterpolationOptions = {}) {
    const { easing = Easing.linear } = options;

    if (inputRange.length !== outputRange.length) throw new Error("inputRange and outputRange must have the same length.");
    if (inputRange.length < 2 || outputRange.length < 2) throw new Error("inputRange and outputRange must have at least two elements.");

    // Check if inputRange is valid
    for (let i = 0; i < inputRange.length - 1; i++) {
        if (inputRange[i] === undefined || inputRange[i + 1] === undefined) throw new Error("inputRange must not contain undefined values.");
        if (inputRange[i]! > inputRange[i + 1]!) throw new Error("inputRange must be sorted in ascending order.");
    }

    let result = input;
    const [start, end] = inputRange;
    const [startOutput, endOutput] = outputRange;

    if (startOutput === endOutput) return startOutput;

    result = (result - start!) / (end! - start!);
    result = easing(result);
    result = result * (endOutput! - startOutput!) + startOutput!;

    return result;
}