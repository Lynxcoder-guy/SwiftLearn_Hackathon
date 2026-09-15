import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const factorExplanations = {
  multiplication_division: "Multiplication and division",
  algebra_formulas: "Algebra formulas",
  addition_subtraction: "Addition and subtraction",
};

function getFactorExplanation(factor) {
  return factorExplanations[factor] ?? factor;
}

function getDisplayedGrade(score) {
  if (score === 100) return "A+";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

export default function ReviewSwift() {
  const { userId } = useParams();
  const { state } = useLocation();
  const score = state?.score ?? 0;
  const navigate = useNavigate()
  const hintValue = state?.hintValue ?? "false";
  const displayedGrade = getDisplayedGrade(score);
  const [needToBlurt, setNeedToBlurt] = useState([]);

  const [struggles] = useState(() => {
    const reviewStruggles = state?.struggles ?? [];
    const mergedStruggles = new Map();

    reviewStruggles.forEach((struggle) => {
      const existingStruggle = mergedStruggles.get(struggle.factor);

      if (existingStruggle) {
        existingStruggle.underValue += 1;
        return;
      }

      mergedStruggles.set(struggle.factor, {
        ...struggle,
        underValue: struggle.underValue ?? 1,
      });
    });

    return [...mergedStruggles.values()];
  });

  const achievementText =
    hintValue === "false"
      ? "Congrats! You did it without hint"
      : "Congrats now do it without the hint";

  useEffect(() => {
    const fetchNeedToBlurt = async () => {
      try {
        const usersQuery = query(
          collection(db, "Users"),
          where("userId", "==", userId),
        );
        const querySnapshot = await getDocs(usersQuery);
        const userData = querySnapshot.empty
          ? {}
          : querySnapshot.docs[0].data();

        setNeedToBlurt(userData.needToBlurt ?? []);
      } catch (error) {
        console.error("Failed to load Scope review items:", error);
        setNeedToBlurt([]);
      }
    };

    if (userId) fetchNeedToBlurt();
  }, [userId]);

  return (
    <main>
      <h1>Swift Review</h1>
      <h3>Your score: {displayedGrade}</h3>
      <p>
        {achievementText}, now review and practice the topics shown below based
        on what you need to improve.
      </p>
      {struggles.length > 0 && (
        <section>
          <h2>Struggles to review</h2>
          <ul>
            {struggles.map((struggle, index) => (
              <li key={`${struggle.subExerciseNumber}-${index}`}>
                {getFactorExplanation(struggle.factor)} in {struggle.topic}
              </li>
            ))}
          </ul>
        </section>
      )}
      {needToBlurt.length > 0 && (
        <section>
          <h2>Scope topics to review</h2>
          <ul>
            {needToBlurt.map((item, index) => (
              <li key={`blurt-${item.concept ?? index}`}>
                {typeof item === "object" ? item.concept ?? JSON.stringify(item) : item}
              </li>
            ))}
          </ul>
        </section>
      )}
      <button type="button" onClick={() => navigate(`/dashboard/${userId}`)}>
        Back to dashboard
      </button>
    </main>
  );
}
