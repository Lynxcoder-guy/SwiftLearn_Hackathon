import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Ranks make progress visible while keeping the underlying score numeric.
export function getScoreRank(score) {
    if (score >= 400) return "A";
    if (score >= 200) return "B";
    if (score >= 100) return "C";
    return "D";
}

export async function ScoreGamify(score, userDocumentId) {
    // Normalize score input before calculating the rank and recording an
    // achievement, so malformed or negative values cannot corrupt progress.
    const scoreNumber = Math.max(0, Math.round(Number(score) || 0));
    const rank = getScoreRank(scoreNumber);
    const userDocument = doc(db, "Users", userDocumentId);

    await updateDoc(userDocument, {
        achievements: arrayUnion({ rank, scoreNumber }),
    });

    return { rank, scoreNumber };
}