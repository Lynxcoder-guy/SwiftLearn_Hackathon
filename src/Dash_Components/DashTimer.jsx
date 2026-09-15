import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    arrayUnion,
    collection,
    doc,
    getDocs,
    increment,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase";
import { getScoreRank, ScoreGamify } from "../JavaScript calculations/ScoreGamify";

export default function DashTimer() {
    const { userId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const priority = state?.priority;
    const totalSeconds = Math.max(1, Math.round(Number(priority?.V ?? 1) * 60));
    const [seconds, setSeconds] = useState(totalSeconds);
    const [isRunning, setIsRunning] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [notification, setNotification] = useState("");

    useEffect(() => {
        if (!isRunning || seconds === 0) return undefined;

        const timer = window.setInterval(() => {
            setSeconds((currentSeconds) => {
                if (currentSeconds <= 1) {
                    setIsRunning(false);
                    return 0;
                }

                return currentSeconds - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [isRunning, seconds]);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = String(seconds % 60).padStart(2, "0");

    if (!priority) {
        return (
            <main>
                <h1>No study priority selected</h1>
                <button type="button" onClick={() => navigate(`/dashboard/${userId}`)}>
                    Back to dashboard
                </button>
            </main>
        );
    }

    const completePriority = async () => {
        setIsCompleting(true);

        try {
            const usersQuery = query(
                collection(db, "Users"),
                where("userId", "==", userId),
            );
            const querySnapshot = await getDocs(usersQuery);
            if (querySnapshot.empty) throw new Error("User profile not found.");

            const userDocument = querySnapshot.docs[0];
            const userData = userDocument.data();
            const currentPriorities = userData.clynxlist ?? [];
            const nextScore = (Number(userData.score) || 0) + priority.scoreReward;
            const updatedNeedToLearn = (userData.needToLearn ?? []).filter(
                (item) => priority.type !== "factor" || item.factor !== priority.factor,
            );
            const updatedNeedToBlurt = (userData.needToBlurt ?? []).filter(
                (item) => priority.type !== "blurt" || item.concept !== priority.concept,
            );

            await updateDoc(doc(db, "Users", userDocument.id), {
                clynxlist: currentPriorities.filter(
                    (item) => item.checklistKey !== priority.checklistKey,
                ),
                needToLearn: updatedNeedToLearn,
                needToBlurt: updatedNeedToBlurt,
                completedClynxPriorities: arrayUnion(priority.checklistKey),
                score: increment(priority.scoreReward),
            });
            await ScoreGamify(nextScore, userDocument.id);
            setNotification(
                `${priority.label} completed. +${priority.scoreReward} points added. Rank ${getScoreRank(nextScore)}.`,
                
            );
            navigate()
        } catch (error) {
            setNotification(`Could not complete priority: ${error.message}`);
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <main className="dash-timer">
            <h1>{priority.label}</h1>
            <h3 aria-live="polite">
                {minutes}:{remainingSeconds}
            </h3>
            <p>V: {priority.V} minutes | +{priority.scoreReward} points</p>
            {notification && <p role="status">{notification}</p>}
            <div>
                <button type="button" onClick={() => navigate(`/dashboard/${userId}`)}>
                    Back
                </button>
                <button type="button" onClick={completePriority} disabled={isCompleting}>
                    {isCompleting ? "Saving..." : "Checklist it"}
                </button>
            </div>
        </main>
    );
}