// Helper untuk mengacak urutan array (Fisher-Yates Shuffle)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const QUIZ_FACTORS = {
  MULTIPLICATION_DIVISION: "multiplication_division",
  ALGEBRA_FORMULAS: "algebra_formulas",
  ADDITION_SUBTRACTION: "addition_subtraction",
};

const validFactors = new Set(Object.values(QUIZ_FACTORS));

export function normalizeFactor(factor) {
  return validFactors.has(factor)
    ? factor
    : QUIZ_FACTORS.ALGEBRA_FORMULAS;
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
 * Mengambil soal acak berdasarkan nama subjek dan nomor sub-exercise.
 * 
 * @param {Object} jsonData - Data JSON kamu
 * @param {string} subjectName - Contoh: "pre-algebra"
 * @param {number|string} subExerciseNum - Nomor sub-exercise (1 - 5)
 */
export function getSubExerciseQuestion(jsonData, subjectName, subExerciseNum) {
  const subjectData = jsonData[subjectName];
  if (!subjectData) return null;

  // 1. Pilih Exercise secara acak (exercise1, exercise2, dll)
  const exerciseKeys = Object.keys(subjectData);
  const randomExerciseKey = exerciseKeys[Math.floor(Math.random() * exerciseKeys.length)];
  const selectedExercise = subjectData[randomExerciseKey];

  // 2. Pilih Problem secara acak (problem1, problem2, dll)
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

  // 3. Ambil data sub-exercise sesuai nomor yang diminta
  const subKey = `sub-exercise${subExerciseNum}`;
  const rawSubEx = problem[subKey];
  if (!rawSubEx) return null;

  // Ambil teks pertanyaan (mendukung key "question1" atau "question")
  const questionText = rawSubEx[`question${subExerciseNum}`] || rawSubEx.question;

  // 4. Kumpulkan TEPAT 3 OPSI JAWABAN (A, B, C)
  const rawOptions = [
    { text: rawSubEx.answerA, isCorrect: rawSubEx.correctAnswer === 'answerA' },
    { text: rawSubEx.answerB, isCorrect: rawSubEx.correctAnswer === 'answerB' },
    { text: rawSubEx.answerC, isCorrect: rawSubEx.correctAnswer === 'answerC' }
  ];

  // 5. Acak posisi 3 opsi tersebut
  const shuffledOptions = shuffleArray(rawOptions);

  // 6. Return format siap pakai di React
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
      label: String.fromCharCode(65 + index), // "A", "B", atau "C"
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