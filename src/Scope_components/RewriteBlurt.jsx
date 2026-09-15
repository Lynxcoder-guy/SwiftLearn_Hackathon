import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../firebase";

export default function BlurtRewrite() {
	const [rewriteMaterials, setRewriteMaterials] = useState("");
	const { userId } = useParams();
	const navigate = useNavigate();

	const handleSubmit = async (event) => {
		event.preventDefault();

		try {
			const usersQuery = query(
				collection(db, "Users"),
				where("userId", "==", userId),
			);
			const querySnapshot = await getDocs(usersQuery);

			if (querySnapshot.empty) {
				console.warn("No profile found for userId:", userId);
				return;
			}

			await setDoc(
				querySnapshot.docs[0].ref,
				{ rewriteMaterials },
				{ merge: true },
			);
			navigate(`/dashboard/${userId}/scopecontents/timer/rewrite/review`);
		} catch (error) {
			console.error("Error saving rewrite:", error);
		}
	};

	return (
		<main>
			<h1>Rewrite what you remember</h1>
			<p>Write the material again from memory, then compare it with your original notes.</p>
			<form onSubmit={handleSubmit}>
				<textarea
					value={rewriteMaterials}
					onChange={(event) => setRewriteMaterials(event.target.value)}
					placeholder="Rewrite what you remember..."
					required
					rows="8"
				/>
				<button type="submit">Review both notes</button>
			</form>
		</main>
	);
}
