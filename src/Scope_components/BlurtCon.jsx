import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from '../firebase';
import { collection, getDocs, query, setDoc, where } from "firebase/firestore";


export default function BlurtContent() {
  const [blurtMaterials, setBlurtMaterials] = useState('')
  const navigate = useNavigate();
  const { userId } = useParams();

  const handleChange = (e) => {
    setBlurtMaterials(e.target.value)
  }

    const handleClick = async () => {
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

      const userDocument = querySnapshot.docs[0];
      await setDoc(userDocument.ref, { blurtMaterials }, { merge: true });
      navigate(`/dashboard/${userId}/scopecontents/timer`);
    } catch (err) {
      console.error("Error saving document:", err);
    }
  };
  
  return (
    <>
    <main className="blurt-con-hero">
      <h1>Scope Active Recall</h1>
      <p>
        Using active recall to make your study session as efficient as possible
        with the Scope learning system, you gain the ability to focus on
        mistakes, refine your knowledge, and transform every study session into
        a powerful step toward mastery.
      </p>
    </main>
    <section className="blurt-input">
        <textarea
          className="blurt-material-input"
          name="blurt-material-input"
          value={blurtMaterials}
          onChange={handleChange}
          placeholder={'Chapter 1\nWrite your notes here...\n\n--- CHAPTER BREAK ---\n\nChapter 2\nContinue your notes here...'}
          rows="14"
          aria-label="Study notes"
        />
        <button className="blurt-material-start" onClick={handleClick}>
          Start Now
        </button>
    </section>
    </>
  );
}
