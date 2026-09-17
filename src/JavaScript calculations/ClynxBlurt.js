// Blurt priorities use the same Clynx model as quiz weaknesses but a smaller
// weight because the learner has already identified the concept to recall.
export function ClynxCalculationsBlurt(U, T, AW) {
    const N = 2; // Weight for concepts identified during Scope review.

    const calculateX = (U, T, N) => {
        const Xvalue = T + (U * N) * 100;
        return Xvalue;
    };

    const calculateV = (U, T, N) => {
        const Vvalue = T + (U * N) * 3;
        return Vvalue;
    };

    // Keep the adjusted time estimate separate from X so ranking and duration
    // can be displayed independently on the dashboard.
    const adjustedV = AW === 0 ? calculateV(U, T, N) : calculateV(U, T, N) / AW;

    const X = calculateX(U, T, N);
    const V = adjustedV;

    return { X, V };
}
