import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
    collection,
    deleteField,
    doc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore"
import { db } from "../firebase"
import { AccuracyBlurtML } from "./BlurtAccuracy.js"
import "./Scope.css"

export default function ReviewBlurt() {
    const { userId } = useParams()
    const [notes, setNotes] = useState({ blurtMaterials: "", rewriteMaterials: "" })
    const [accuracyFeedback, setAccuracyFeedback] = useState([])
    const [needToBlurt, setNeedToBlurt] = useState([])
    const [needToBlurtInput, setNeedToBlurtInput] = useState("")
    const [isCheckingAccuracy, setIsCheckingAccuracy] = useState(false)
    const [accuracyError, setAccuracyError] = useState("")
    const [hasCheckedAccuracy, setHasCheckedAccuracy] = useState(false)
    const navigate = useNavigate()

    // Run semantic comparison locally in the browser so the learner's notes are
    // not sent to a separate scoring service.
    const handleAccuracyCheck = async () => {
        console.log("[ReviewBlurt] Accuracy check requested")
        setIsCheckingAccuracy(true)
        setAccuracyError("")

        try {
            const result = await AccuracyBlurtML(
                notes.blurtMaterials,
                notes.rewriteMaterials,
            )
            const missingMaterials = result.filter((item) => item.status === "MISSING")
            const coveredMaterials = result.filter((item) => item.status === "COVERED")

            setAccuracyFeedback(missingMaterials)
            setHasCheckedAccuracy(true)
            console.log("[ReviewBlurt] Accuracy result summary", {
                totalConcepts: result.length,
                coveredConcepts: coveredMaterials,
                missingConcepts: missingMaterials,
            })
        } catch (error) {
            console.error("Error checking blurt accuracy:", error)
            setAccuracyError(`Accuracy check could not be completed: ${error.message}`)
        } finally {
            setIsCheckingAccuracy(false)
        }
    }

    const handleNeedToBlurt = (event) => {
        event.preventDefault()
        const concept = needToBlurtInput.trim()

        if (!concept) {
            return
        }

        setNeedToBlurt((currentItems) => [
            ...currentItems,
            {
                concept,
                timeNeed: 5,
                underValue: 1,
            },
        ])
        setNeedToBlurtInput("")
    }

    const updateUnderValue = (index, change) => {
        setNeedToBlurt((currentItems) => currentItems.map((item, itemIndex) => {
            if (itemIndex !== index) return item

            return {
                ...item,
                underValue: Math.max(1, (Number(item.underValue) || 1) + change),
            }
        }))
    }

    const deleteNeedToBlurt = (index) => {
        setNeedToBlurt((currentItems) => currentItems.filter((_, itemIndex) => itemIndex !== index))
    }

    // Remove temporary session notes while preserving the learner's missed
    // concepts as future dashboard priorities.
    const handleClick = async () => {
        console.log("[ReviewBlurt] Clearing Scope notes for user:", userId)
        try {
            const usersQuery = query(
                collection(db, "Users"),
                where("userId", "==", userId),
            )
            const querySnapshot = await getDocs(usersQuery)

            if (querySnapshot.empty) {
                console.warn("No profile found for userId:", userId)
                return
            }

            const userDocument = querySnapshot.docs[0]

            await setDoc(doc(db, "Users", userDocument.id), {
                needToBlurt,
                blurtMaterials: deleteField(),
                rewriteMaterials: deleteField(),
            }, { merge: true })
            navigate(`/dashboard/${userId}`)
        } catch (error) {
            console.error("Error deleting blurt materials:", error)
        }
    }

    // Restore the active Scope session so a refresh does not lose its review
    // context or previously recorded concepts.
    useEffect(() => {
        const loadNotes = async () => {
            console.log("[ReviewBlurt] Loading notes for user:", userId)
            try {
                const usersQuery = query(
                    collection(db, "Users"),
                    where("userId", "==", userId),
                )
                const querySnapshot = await getDocs(usersQuery)

                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data()
                    setNotes({
                        blurtMaterials: userData.blurtMaterials ?? "",
                        rewriteMaterials: userData.rewriteMaterials ?? "",
                    })
                    setNeedToBlurt((userData.needToBlurt ?? []).map((item) => (
                        typeof item === "object"
                            ? { ...item, underValue: Math.max(1, Number(item.underValue) || 1) }
                            : { concept: item, timeNeed: 5, underValue: 1 }
                    )))
                    console.log("[ReviewBlurt] Notes loaded", {
                        originalLength: userData.blurtMaterials?.length ?? 0,
                        rewriteLength: userData.rewriteMaterials?.length ?? 0,
                    })
                }
            } catch (error) {
                console.error("Error loading notes:", error)
            }
        }

        loadNotes()
    }, [userId])

    return (
        <div className="scope-page">
        <main className="blurt-review-hero">
            <h1>Compare your notes</h1>
            <p>Compare the materials youre trying to learn with the one you remember to know how good your 
                understanding of the materials are then do it again to get a better understanding of the materials</p>
            <section className="blurt-original-materials">
                <h2>Original material</h2>
                <p className="notes-content">{notes.blurtMaterials || "No original material found."}</p>
            </section>
			<section className="blurt-rewrite-review"> 
                <h2>What you remembered</h2>
                <p className="notes-content">{notes.rewriteMaterials || "-"}</p>
                <button onClick={handleAccuracyCheck} disabled={isCheckingAccuracy || !notes.blurtMaterials || !notes.rewriteMaterials}>
                    {isCheckingAccuracy ? "Checking accuracy..." : "Check blurting accuracy"}
                </button>
                {accuracyError && <p role="alert">{accuracyError}</p>}
                {hasCheckedAccuracy && (
                    <section className="accuracy-results" aria-live="polite">
                        {accuracyFeedback.length < 2 && (
                            <p className="mastery-message">
                                You&apos;re doing great. Still need Some review though.
                            </p>
                        )}
                        <div className="accuracy-heading">
                            <h2>Focus your next review</h2>
                            <p>These ideas are the best place to continue strengthening your memory.</p>
                        </div>
                        {accuracyFeedback.length > 0 && <div className="accuracy-list">
                            {accuracyFeedback.map((item) => {
                                const cleanedConcept = item.concept
                                    .replace(/^\s*\d+\s*[.)-]?\s*/, "")
                                    .replace(/(?<=[.!?])\s*\d+\s*[.)-]?\s*$/, "")
                                    .trim()

                                return (
                                    <article className="accuracy-item missing" key={cleanedConcept}>
                                        <p>{cleanedConcept} needs review</p>
                                    </article>
                                )
                            })}
                        </div>}
                    </section> */}
			
                )}
            </section>
            <section className="blurt-listings">
				<h3>List the parts you missed here</h3>
                <form onSubmit={handleNeedToBlurt}>
                    <input
                        value={needToBlurtInput}
                        onChange={(event) => setNeedToBlurtInput(event.target.value)}
                        placeholder="Add something you need to blurt..."
                        aria-label="Add something you need to blurt"
                    />
                    <button type="submit" disabled={!needToBlurtInput.trim()}>
                        Add As Notes
                    </button>
                </form>
                {needToBlurt.length > 0 && (
                    <ul>
                        {needToBlurt.map((item, index) => (
                            <li key={`${item.concept}-${index}`}>
                                <span> {item.concept.length > 25
                                        ? item.concept.slice(0, 25) + "..."
                                        : item.concept}</span>
                                <span>Under value: {item.underValue}</span>
                                <button
                                    type="button"
                                    onClick={() => updateUnderValue(index, -1)}
                                    disabled={item.underValue <= 1}
                                    aria-label={`Decrease under value for ${item.concept}`}
                                >
                                    -
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateUnderValue(index, 1)}
                                    aria-label={`Increase under value for ${item.concept}`}
                                >
                                    +
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteNeedToBlurt(index)}
                                    aria-label={`Delete ${item.concept}`}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
			</section>
            <section className="clear-button">
                <button className="blurt-dashboard-button" onClick={handleClick}>Clear Materials and Return</button>
            </section>
            </main>
        </div>
    )
}
