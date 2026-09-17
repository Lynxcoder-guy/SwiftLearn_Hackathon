// Calculate study priority for quiz-based weaknesses. Higher X values are
// ranked first, while V estimates the time required to address the weakness.
export function ClynxCalculations(U, T, AW) {
    const N = 3; // Weight for weaknesses found through Swift quizzes.

    const calculateX = (U, T, N) => {
        const Xvalue = T + (U * N) * 100;
        return Xvalue;
    };

    const calculateV = (U, T, N) => {
        const Vvalue = T + (U * N) * 3;
        return Vvalue;
    };

    // AW lets each workflow tune the time estimate without changing the base
    // calculation used to rank the learner's priorities.
    const adjustedV = AW === 0 ? calculateV(U, T, N) : calculateV(U, T, N) / AW;

    const X = calculateX(U, T, N);
    const V = adjustedV;

    return { X, V };
}
