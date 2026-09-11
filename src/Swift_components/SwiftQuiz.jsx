import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import subjects from "./SwiftSubjects.json"

const question = {
	prompt: "Solve for x: 2x + 4 = 10",
	answer: "3",
}

export default function SwiftQuiz() {
	const { materialId } = useParams()
	const [answer, setAnswer] = useState("")
	const [checked, setChecked] = useState(false)

	const isCorrect = answer.trim() === question.answer

	return (
		<main>
			<h1>Swift practice: {subjects[materialId]?.title ?? "Unknown material"}</h1>
			<p>{question.prompt}</p>
			<form onSubmit={(event) => { event.preventDefault(); setChecked(true) }}>
				<label htmlFor="answer">Your answer</label>
				<input
					id="answer"
					value={answer}
					onChange={(event) => { setAnswer(event.target.value); setChecked(false) }}
					inputMode="numeric" 
				/>
				<button type="submit">Check answer</button>
			</form>
			{checked && <p role="status">{isCorrect ? "Correct" : "Try again"}</p>}
			<Link to="/swiftcontents/quiz/review">Review session</Link>
		</main>
	)
}
