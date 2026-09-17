import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  arrayUnion,
  where,
} from "firebase/firestore";
import quizData from "./SwiftMaterials/MathQuiz.json";
import subjects from "./SwiftMaterials/SwiftSubjects.json";
import {
  findQuizSubject,
  getQuizQuestions,
  normalizeFactor,
} from "./SwiftMaterials/QuizEngine";
import { ScoreGamify } from "../JavaScript calculations/ScoreGamify";
import "./Swift.css";

function getStruggleKey(struggle) {
  return `${struggle.topic}-${struggle.subExerciseNumber}`;
}

function addRepetitionValues(struggles) {
  const mergedStruggles = new Map();

  struggles.forEach((struggle) => {
    const existingStruggle = mergedStruggles.get(struggle.factor);

    if (existingStruggle) {
      existingStruggle.underValue += 1;
      return;
    }

    mergedStruggles.set(struggle.factor, {
      ...struggle,
      underValue: 1,
    });
  });

  return [...mergedStruggles.values()];
}

export default function SwiftQuiz() {
  const { userId, materialId } = useParams();
  const { search } = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [answeredWrong, setAnsweredWrong] = useState({})
  const [score, setScore] = useState(100);
  // Store the Firestore profile ID separately from the Firebase Auth user ID;
  // quiz results are written to the existing Users document.
  const [docId, setDocId] = useState("");
  const [, setStruggles] = useState([]);
  const navigate = useNavigate();
  const strugglesRef = useRef([]);

  const quizSubject = findQuizSubject(quizData, materialId, subjects);
  const quizQuestions = useMemo(
    () => (quizSubject ? getQuizQuestions(quizData, quizSubject) : []),
    [quizSubject],
  );
  const hintValue = new URLSearchParams(search).get("hint");
  const showHints = hintValue === "true";

  // Resolve the learner's Firestore document once when the quiz opens.
  useEffect(() => {
    const fetchDocId = async () => {
      try {
        const usersRef = collection(db, "Users");
        const userQuery = query(usersRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const foundDocId = querySnapshot.docs[0].id;
          console.log(`id collected ${foundDocId}`);
          setDocId(foundDocId);
        } else {
          console.warn("No profile found for userId:", userId);
        }
      } catch (error) {
        console.error("Error fetching docId:", error);
      }
    };

    fetchDocId();
  }, [userId]);

  const handleAnswer = async (option) => {
    if (!option.isCorrect) {
      const question = quizQuestions[currentQuestionIndex];
      const newStruggle = {
        factor: normalizeFactor(question.factor),
        topic: question.topic,
        subExerciseNumber: question.subExerciseNumber,
        selectedAnswer: option.label,
      };

      if (
        !strugglesRef.current.some(
          (struggle) => getStruggleKey(struggle) === getStruggleKey(newStruggle),
        )
      ) {
        setStruggles((prev) => [...prev, newStruggle]);
        strugglesRef.current = [...strugglesRef.current, newStruggle];
      }
      if (!answeredWrong[currentQuestionIndex]) {
        const nextScore = score - 20;
        // Penalize each question at most once even if the learner retries it.
        setScore((prev) => prev - 20);
        setAnsweredWrong((prev) => ({
          ...prev,
          [currentQuestionIndex]: true,
        }));
        console.log(`Current Score ${nextScore}`);
      }

      setFeedback("Not quite. Try again.");
      return;
    }

    setFeedback("");
    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex === quizQuestions.length) {
      const strugglesWithRepetition = addRepetitionValues(strugglesRef.current);

      if (docId) {
        const updates = {};

        if (strugglesWithRepetition.length > 0) {
          updates.needToLearn = arrayUnion(...strugglesWithRepetition);
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, "Users", docId), updates);
          console.log("Saved quiz results:", docId, updates);
        }

        await ScoreGamify(score, docId);
      }

      navigate(`/dashboard/${userId}/swiftcontents/${materialId}/review`, {
        state: {
          score,
          total: quizQuestions.length,
          struggles: strugglesWithRepetition,
          hintValue,
        },
      });
      return;
    }

    setCurrentQuestionIndex(nextQuestionIndex);
  };

  if (!quizQuestions.length) {
    return (
      <div className="swift-page">
        <main className="quiz-hero">
          <h1>Quiz unavailable</h1>
          <p>This topic does not have quiz questions yet.</p>
        </main>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <div className="swift-page">
      <main className="quiz-hero">
        <h1>{subjects[materialId]?.title ?? materialId}</h1>
        <p>
          Question {currentQuestionIndex + 1} of {quizQuestions.length}
        </p>
        <p>Score: {score}</p>
        <h2>{currentQuestion.question}</h2>
        {showHints && <p>Hint: {currentQuestion.hint}</p>}
        <div>
          {currentQuestion.options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleAnswer(option)}
            >
              {option.label}. {option.text}
            </button>
          ))}
        </div>
        {feedback && <p role="alert">{feedback}</p>}
      </main>
    </div>
  );
}
