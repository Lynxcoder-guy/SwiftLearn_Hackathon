export function ClynxCalculations(U, T, AW) {
    const N = 5; // bobot untuk kalkulasi

    const calculateX = (U, T, N) => {
        const Xvalue = T + (U * N) * 100;
        return Xvalue;
    };

    const calculateV = (U, T, N) => {
        const Vvalue = T + (U * N) * 3;
        return Vvalue;
    };

    const adjustedV = AW === 0 ? calculateV(U, T, N) : calculateV(U, T, N) / AW;

    const X = calculateX(U, T, N);
    const V = adjustedV;

    return { X, V };
}
