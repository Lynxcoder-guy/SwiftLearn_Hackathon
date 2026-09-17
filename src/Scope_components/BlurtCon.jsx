import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from '../firebase';
import { collection, getDocs, query, setDoc, where } from "firebase/firestore";
import "./Scope.css";


export default function BlurtContent() {
  const [blurtMaterials, setBlurtMaterials] = useState('')
  const navigate = useNavigate();
  const { userId } = useParams();

  const handleChange = (e) => {
    // Keep the learner's source material local until they explicitly begin
    // the session, avoiding partial drafts being written to Firestore.
    setBlurtMaterials(e.target.value)
  }

  const handleClick = async () => {
    try {
      // Scope stores the source notes before starting the timed recall session
      // so the later rewrite and accuracy screens can load the same material.
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
    <div className="scope-page">
      <main className="blurt-con-hero">
        <h1>Scope Active Recall</h1>
        <h3>Memorize Efficiently With Scope</h3>
      </main>
      <section className="blurt-input">
        <textarea
          className="blurt-material-input"
          name="blurt-material-input"
          value={blurtMaterials}
          onChange={handleChange}
          placeholder={'Highly recomended to put a single pararaph text for better acuracy'}
          rows="14"
          aria-label="Study notes"
        />
        <section className="start-now-blurt">
          <button className="blurt-material-start" onClick={handleClick}>
            Start Now
          </button>
        </section>
      </section>
    </div>
  );
}
