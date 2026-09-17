// Fisher-Yates shuffle keeps answer order unpredictable without mutating the
// source question-bank data.
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Factors are stored in their display form ("Algebra Formulas") so the quiz
// data, the Swift review screen and the dashboard checklist all read the same.
export const QUIZ_FACTORS = {
  MULTIPLICATION_DIVISION: "Multiplication Division",
  ALGEBRA_FORMULAS: "Algebra Formulas",
  ADDITION_SUBTRACTION: "Addition Subtraction",
};

// Weaknesses saved before the labels were renamed still carry the old
// snake_case keys, so translate them instead of dropping the factor.
const LEGACY_FACTORS = {
  multiplication_division: QUIZ_FACTORS.MULTIPLICATION_DIVISION,
  algebra_formulas: QUIZ_FACTORS.ALGEBRA_FORMULAS,
  addition_subtraction: QUIZ_FACTORS.ADDITION_SUBTRACTION,
};

const validFactors = new Set(Object.values(QUIZ_FACTORS));

export function normalizeFactor(factor) {
  if (validFactors.has(factor)) return factor;

  return LEGACY_FACTORS[factor] ?? QUIZ_FACTORS.ALGEBRA_FORMULAS;
}

const factorsByTopic = {
  "Equations with Variables on Both Sides": [
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
    QUIZ_FACTORS.ADDITION_SUBTRACTION,
    QUIZ_FACTORS.MULTIPLICATION_DIVISION,
  ],
  "Distributive Property Equations": [
    QUIZ_FACTORS.MULTIPLICATION_DIVISION,
    QUIZ_FACTORS.ADDITION_SUBTRACTION,
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
    QUIZ_FACTORS.ADDITION_SUBTRACTION,
    QUIZ_FACTORS.MULTIPLICATION_DIVISION,
  ],
  "Order of Operations": [
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
    QUIZ_FACTORS.MULTIPLICATION_DIVISION,
    QUIZ_FACTORS.ADDITION_SUBTRACTION,
    QUIZ_FACTORS.ADDITION_SUBTRACTION,
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
  ],
  "Percent Increase & Decrease": [
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
    QUIZ_FACTORS.MULTIPLICATION_DIVISION,
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
    QUIZ_FACTORS.MULTIPLICATION_DIVISION,
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
  ],
  "Fraction Equations": [
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
    QUIZ_FACTORS.ADDITION_SUBTRACTION,
    QUIZ_FACTORS.MULTIPLICATION_DIVISION,
    QUIZ_FACTORS.MULTIPLICATION_DIVISION,
    QUIZ_FACTORS.ALGEBRA_FORMULAS,
  ],
};

function getQuestionFactor(topic, subExerciseNumber) {
  return normalizeFactor(
    factorsByTopic[topic]?.[Number(subExerciseNumber) - 1],
  );
}

export function findQuizSubject(jsonData, subjectId, subjectCatalog = {}) {
  if (jsonData[subjectId]) return subjectId;

  const catalogId = subjectCatalog[subjectId]?.["material-id"];
  if (catalogId && jsonData[catalogId]) return catalogId;

  const normalize = (value) => value.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const normalizedIds = [subjectId, catalogId].filter(Boolean).map(normalize);

  return Object.keys(jsonData).find((quizSubject) => {
    const normalizedQuizSubject = normalize(quizSubject);
    return normalizedIds.some(
      (normalizedId) => normalizedId.startsWith(normalizedQuizSubject),
    );
  });
}

/**
 * Select and format one randomized question from a subject's question bank.
 * The formatter also normalizes the weakness factor used by Clynx.
 */
export function getSubExerciseQuestion(jsonData, subjectName, subExerciseNum) {
  const subjectData = jsonData[subjectName];
  if (!subjectData) return null;

  // Select an exercise and problem independently so repeated sessions vary.
  const exerciseKeys = Object.keys(subjectData);
  const randomExerciseKey = exerciseKeys[Math.floor(Math.random() * exerciseKeys.length)];
  const selectedExercise = subjectData[randomExerciseKey];

  const problemKeys = Object.keys(selectedExercise);
  const randomProblemKey = problemKeys[Math.floor(Math.random() * problemKeys.length)];
  const selectedProblem = selectedExercise[randomProblemKey];

  return formatQuestion(
    subjectName,
    randomExerciseKey,
    randomProblemKey,
    selectedProblem,
    subExerciseNum,
  );
}

function formatQuestion(subjectName, exerciseKey, problemKey, problem, subExerciseNum) {

  // Read the requested sub-exercise from the selected problem.
  const subKey = `sub-exercise${subExerciseNum}`;
  const rawSubEx = problem[subKey];
  if (!rawSubEx) return null;

  // Support both the numbered and legacy question-key formats in the JSON.
  const questionText = rawSubEx[`question${subExerciseNum}`] || rawSubEx.question;

  // Convert the source answers into the stable option shape used by React.
  const rawOptions = [
    { text: rawSubEx.answerA, isCorrect: rawSubEx.correctAnswer === 'answerA' },
    { text: rawSubEx.answerB, isCorrect: rawSubEx.correctAnswer === 'answerB' },
    { text: rawSubEx.answerC, isCorrect: rawSubEx.correctAnswer === 'answerC' }
  ];

  // Shuffle answer positions so the correct answer is not predictable.
  const shuffledOptions = shuffleArray(rawOptions);

  // Return a UI-ready question with normalized metadata for review tracking.
  return {
    subject: subjectName,
    exerciseId: exerciseKey,
    problemId: problemKey,
    subExerciseNumber: Number(subExerciseNum),
    topic: problem.topic,
    level: problem.level,
    factor: normalizeFactor(
      rawSubEx.factor ?? getQuestionFactor(problem.topic, subExerciseNum),
    ),
    question: questionText,
    hint: rawSubEx.hint,
    options: shuffledOptions.map((opt, index) => ({
      label: String.fromCharCode(65 + index),
      text: opt.text,
      isCorrect: opt.isCorrect
    }))
  };
}

/**
 * Build a complete quiz for a subject from the JSON question bank.
 * Each sub-exercise number is sampled independently, so the engine works
 * with subjects that contain different numbers of exercises or problems.
 */
export function getQuizQuestions(jsonData, subjectName, questionCount = 5) {
  const subjectData = jsonData[subjectName];
  if (!subjectData) return [];

  const exerciseKeys = Object.keys(subjectData);
  const exerciseKey = exerciseKeys[Math.floor(Math.random() * exerciseKeys.length)];
  const problemKeys = Object.keys(subjectData[exerciseKey]);
  const problemKey = problemKeys[Math.floor(Math.random() * problemKeys.length)];
  const selectedProblem = subjectData[exerciseKey][problemKey];

  return Object.keys(selectedProblem)
    .filter((key) => key.startsWith("sub-exercise"))
    .map((key) => key.replace("sub-exercise", ""))
    .sort((first, second) => Number(first) - Number(second))
    .slice(0, questionCount)
    .map((subExerciseNumber) =>
      formatQuestion(
        subjectName,
        exerciseKey,
        problemKey,
        selectedProblem,
        subExerciseNumber,
      ),
    )
    .filter(Boolean);
}