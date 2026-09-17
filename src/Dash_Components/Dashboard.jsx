import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ClynxCalculations } from "../JavaScript calculations/Clynx";
import { ClynxCalculationsBlurt } from "../JavaScript calculations/ClynxBlurt";
import { ScoreGamify } from "../JavaScript calculations/ScoreGamify";
import "./Dashboard.css";

function getScoreProgress(score) {
  // Convert the learner's score into progress between the next achievement
  // milestones shown on the dashboard.
  const goals = [100, 200, 400];
  if (score >= 400) {
    return { nextGoal: 400, progress: 100 };
  }

  const nextGoal = goals.find((goal) => score < goal) ?? 400;
  const previousGoal = goals.findLast((goal) => score >= goal) ?? 0;
  const progress = Math.min(
    100,
    Math.round(((score - previousGoal) / (nextGoal - previousGoal)) * 100),
  );

  return { nextGoal, progress };
}

export default function Dashboard() {
  const NEED_TO_LEARN_AW = 0;
  const NEED_TO_BLURT_AW = 2;
  const [displayName, setDisplayName] = useState("");
  const [docId, setDocId] = useState("");
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState("D");
  const [clynxlist, setClynxlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();
  const scoreProgress = getScoreProgress(score);
    const Quotes = [
    "\"Education is the most powerful weapon which you can use to change the world.\" – Nelson Mandela",
    "\"The more that you read, the more things you will know. The more that you learn, the more places you’ll go.\" – Dr. Seuss",
    "\"Live as if you were to die tomorrow. Learn as if you were to live forever.\" – Mahatma Gandhi",
    "\"An investment in knowledge pays the best interest.\" – Benjamin Franklin",
    "\"The beautiful thing about learning is that nobody can take it away from you.\" – B.B. King",
    "\"Tell me and I forget. Teach me and I remember. Involve me and I learn.\" – Benjamin Franklin",
    "\"Wisdom is not a product of schooling but of the lifelong attempt to acquire it.\" – Albert Einstein",
    "\"Learning never exhausts the mind.\" – Leonardo da Vinci",
    "\"Develop a passion for learning. If you do, you will never cease to grow.\" – Anthony J. D’Angelo",
    "\"The expert in anything was once a beginner.\" – Helen Hayes"
  ];

  // A fresh quote is selected when the dashboard mounts without updating state
  // during render, which keeps React's render cycle stable.
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * Quotes.length);
    return Quotes[randomIndex];
  };
  const [quote] = useState(getRandomQuote);

  // Normalize feature paths so buttons can pass either "scopecontents" or
  // "/scopecontents" without producing malformed dashboard URLs.
  const handleClick = useCallback(
    (route) => {
      const normalizedRoute = route?.startsWith("/") ? route : `/${route}`;
      navigate(`/dashboard/${userId}${normalizedRoute}`);
    },
    [navigate, userId]
  );

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    const fetchClynxInfo = async (userDocumentId) => {
      try {
        // Rebuild priorities from the latest learning data, then preserve only
        // completion metadata from the previously saved dashboard list.
        const userSnapshot = await getDoc(doc(db, "Users", userDocumentId));
        if (!mounted) return;

        const userData = userSnapshot.exists() ? userSnapshot.data() : {};
        const currentScore = Math.max(0, Number(userData.score) || 0);
        const currentAchievement = await ScoreGamify(
          currentScore,
          userDocumentId,
        );
        if (mounted) {
          setScore(currentScore);
          setRank(currentAchievement.rank);
        }
        const needToLearn = userData.needToLearn ?? [];
        const needToBlurt = userData.needToBlurt ?? [];
        const savedPriorities = userData.clynxlist ?? [];
        const factorTotals = needToLearn.reduce((totals, item) => {
          if (!item.factor) return totals;

          totals[item.factor] =
            (totals[item.factor] ?? 0) + Number(item.underValue ?? 1);
          return totals;
        }, {});
        const factorPriorities = Object.entries(factorTotals)
          .map(([factor, underValue]) => {
            const calculation = ClynxCalculations(
              underValue,
              0,
              NEED_TO_LEARN_AW,
            );

            return {
              type: "factor",
              factor,
              label: factor,
              underValue: Math.round(underValue),
              X: Math.round(calculation.X),
              V: Math.round(calculation.V),
              timeNeed: Math.max(1, Math.round(underValue * 5)),
            };
          });
        const blurtPriorities = needToBlurt
          .filter((item) => item && item.concept)
          .map((item) => {
            const timeNeed = Math.max(
              1,
              Math.min(
                15,
                Math.round(Number(item.neededTime ?? item.timeNeed ?? 5)),
              ),
            );
            const underValue = Math.max(1, Number(item.underValue ?? 1));
            const calculation = ClynxCalculationsBlurt(
              underValue,
              timeNeed,
              NEED_TO_BLURT_AW,
            );

            return {
              type: "blurt",
              concept: item.concept,
              label: item.concept,
              underValue: Math.round(underValue),
              X: Math.round(calculation.X),
              V: Math.round(calculation.V),
              timeNeed,
            };
          });
        const savedPriorityByKey = new Map(
          savedPriorities.map((item) => [
            item.checklistKey ?? `${item.type}-${item.label ?? item.factor ?? item.concept}`,
            item,
          ]),
        );
        const rankedClynxList = [...factorPriorities, ...blurtPriorities]
          .sort((firstItem, secondItem) => secondItem.X - firstItem.X)
          .map((item) => {
            const checklistKey = `${item.type}-${item.label}`;
            const savedItem = savedPriorityByKey.get(checklistKey);

            return {
              ...item,
              checklistKey,
              completed: savedItem?.completed === true,
              scoreReward: Math.round(item.V / 2),
            };
          });

        if (mounted) setClynxlist(rankedClynxList);

        await updateDoc(doc(db, "Users", userDocumentId), {
          clynxlist: rankedClynxList,
        });
      } catch (err) {
        console.error("Failed to load Clynx info:", err);
      }
    };

    const getUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersQuery = query(
          collection(db, "Users"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(usersQuery);

        if (!mounted) return;

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data() ?? {};
          setDisplayName(data.userName ?? "Guest");
          setDocId(docSnap.id);
          fetchClynxInfo(docSnap.id);
        } else {
          console.log("No profile found for userId:", userId);
          setDisplayName("Guest");
          setDocId("");
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getUser();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <>
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>
          {loading ? "Loading..." : `Welcome back ${displayName || "Guest"}`}
          <span> | Rank {rank} | Score {score}</span>
        </h1>
        <h3>{quote}</h3>
        <div className="score-progress" aria-label="Score progress">
          <p>
            Score goal: {score} / {scoreProgress.nextGoal}
          </p>
          <progress
            value={scoreProgress.progress}
            max="100"
            aria-label={`${scoreProgress.progress}% toward next score goal`}
          />
        </div>
        {error && <p className="error">Error loading profile: {error.message}</p>}
      </div>

      <div className="dashboard-features">
        <ul>
          <li>
            <h3>Swift</h3>
            <p>
              Learn our available materials with <strong>Swift</strong> for more
              interactive learning and use our <strong>Weakness Analisys</strong> and review
              system for more efficient lerning process.
            </p>
            <button
              className="dashboard-buttons"
              onClick={() => {
                handleClick("/swiftcontents");
              }}>
              Use Swift
            </button>
          </li>

          <li>
            <h3>Scope</h3>
            <p>
              Memorize materials with our <strong>Scope</strong>’s blurting study
              method also equiped with <strong>Missed Points Analisys</strong> to help
              you find mistake in your material review for more efficient memorizing.
            </p>
            <button
              className="dashboard-buttons"
              onClick={() => {
                handleClick("/scopecontents");
              }}
            >
              Use Scope
            </button>
          </li>
        </ul>

        <section className="clynx-dashboard">
          <h3>Clynx Study Priority</h3>
          {clynxlist.length === 0 ? (
            <p>No study priorities yet.</p>
          ) : (
            <ol>
              {clynxlist.map((priority) => (
                <li key={priority.checklistKey}>
                  <strong>
                      {priority.label.length > 25
                      ? priority.label.slice(0, 25) + "..."
                        : priority.label}
                  </strong>
                  <span>Study Time Estimation {priority.V} minutes</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/${userId}/dashtimer`, {
                      state: { priority },
                    })}
                  >
                    Start study timer
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section style={{ marginTop: 20 }}>
          <p>
            <strong>Firestore doc ID:</strong> {docId || "—"}
          </p>
        </section>
      </div>
    </div>
    </>
  );
}
