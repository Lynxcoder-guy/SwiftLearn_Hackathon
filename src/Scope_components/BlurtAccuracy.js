import { pipeline } from "@huggingface/transformers";

let extractorInstance = null;
let extractorLoading = null;

// Compare two embedding vectors. The resulting similarity score estimates how
// closely the learner's recalled idea matches the original concept.
function cosineSimilarity(vecA, vecB) {
  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function splitIntoConcepts(text) {
  return text
    .split(/\n+|(?<=[.!?])\s+|(?<=[.!?])(?=\d+\s*[.)-])/)
    .map(cleanConcept)
    .filter((part) => part.length > 2 && !/^\d+$/.test(part));
}

// Remove list numbering from the beginning without changing numbers inside a concept.
function cleanConcept(part) {
  return part.replace(/^\s*\d+\s*[.)-]?\s*/, "").trim();
}

export async function AccuracyBlurtML(masterNotes, rewriteBlurt, threshold = 0.65) {
  console.log("[BlurtAccuracy] Starting accuracy check", {
    masterNotesLength: masterNotes?.length ?? 0,
    rewriteLength: rewriteBlurt?.length ?? 0,
    threshold,
  });

  if (!masterNotes?.trim() || !rewriteBlurt?.trim()) {
    throw new Error("Both the original material and rewrite are required.");
  }

  // Load one quantized browser model and reuse it on later checks to avoid a
  // costly model download for every accuracy request.
  if (!extractorInstance) {
    if (!extractorLoading) {
      console.log("[BlurtAccuracy] Loading quantized multilingual embedding model...");
      extractorLoading = pipeline(
        "feature-extraction",
        "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
        { dtype: "q8" },
      );
    }
    extractorInstance = await extractorLoading;
    console.log("[BlurtAccuracy] Embedding model loaded");
  }

  // Split both note sets into comparable concepts before generating embeddings.
  const concepts = Array.isArray(masterNotes)
    ? masterNotes.map(cleanConcept).filter((concept) => concept.length > 2)
    : splitIntoConcepts(masterNotes);
  const recallParts = Array.isArray(rewriteBlurt)
    ? rewriteBlurt.filter((part) => part?.trim())
    : splitIntoConcepts(rewriteBlurt);
  console.log("[BlurtAccuracy] Concepts found:", concepts.length);
  console.log("[BlurtAccuracy] Recall parts found:", recallParts.length);

  // Embed recalled concepts once; every original concept can then compare
  // against the complete set of learner responses.
  const recallEmbeddings = [];
  for (const part of recallParts) {
    recallEmbeddings.push(await extractorInstance(part, {
      pooling: "mean",
      normalize: true,
    }));
  }

  const results = [];

  // Mark a concept as covered when its closest recalled meaning reaches the
  // configured similarity threshold.
  for (const sentence of concepts) {
    const sentenceEmbedding = await extractorInstance(sentence, {
      pooling: "mean",
      normalize: true,
    });

    const similarity = Math.max(
      ...recallEmbeddings.map((recallEmbedding) =>
        cosineSimilarity(sentenceEmbedding.data, recallEmbedding.data),
      ),
    );
    const isCovered = similarity >= threshold;

    results.push({
      concept: sentence,
      similarityScore: parseFloat((similarity * 100).toFixed(1)),
      status: isCovered ? "COVERED" : "MISSING",
    });
    console.log("[BlurtAccuracy] Concept result:", {
      concept: sentence,
      similarityScore: parseFloat((similarity * 100).toFixed(1)),
      status: isCovered ? "COVERED" : "MISSING",
    });
  }

  console.log("[BlurtAccuracy] Accuracy check complete", { resultCount: results.length });
  console.group("[BlurtAccuracy] Structured result");
  console.table(results);
  console.log("Covered concepts:", results.filter((item) => item.status === "COVERED"));
  console.log("Missing concepts:", results.filter((item) => item.status === "MISSING"));
  console.groupEnd();
  return results;
}
