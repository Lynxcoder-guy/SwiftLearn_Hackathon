import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const [displayName, setDisplayName] = useState("");
  const { userId } = useParams();
  const navigate = useNavigate()

  const handleClick = (route) => {
    navigate(route)
  }

  useEffect(() => {
    if (!userId) return;

    const getUser = async () => {
      try {
        // addDoc() in Register creates RANDOM doc IDs, so the UID in the URL
        // is NOT a doc ID. We must search the "userId" FIELD with getDocs.
        const usersQuery = query(
          collection(db, "Users"),
          where("userId", "==", userId),
        );
        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
          setDisplayName(querySnapshot.docs[0].data().userName ?? "Guest");
        } else {
          console.warn("No profile found for userId:", userId);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };

    getUser();
  }, [navigate, userId]);

  return (
    <>
      <div className="dashboard-container">
        <h1>Welcome back {displayName}</h1>
        <h3>Make your study session count today</h3>
      </div>
      <div className="dashboard-features">
        <ul>
          <li>
            <h3>Swift</h3>
            <p>
              Learn our available materials with <strong>Swift</strong> for more
              interactive learning and use our mistake analisys and review
              system for more efficient lerning process. Using small steps to
              help you understand materials and formulas better. Mistake
              Analisys system to tell you which part you need to learn with an
              efficient study reviews making sure your study session counts!!.
            </p>
            <button className="dashboard-buttons" onClick={() => {handleClick("/swiftcontents")}}>Use Swift</button>
          </li>
          <li>
            <h3>Scope</h3>
            <p>
              Memorize materials with our <strong>Scope</strong>’s blurting study method is designed to
              transform the way you learn. Using the principle of{" "}
              <em>active recall</em>, it helps you strengthen memory retention
              by encouraging you to write down everything you know before
              checking your notes. This process not only reinforces existing
              knowledge but also highlights areas where your understanding may
              be incomplete.
            </p>
            <button className="dashboard-buttons" onClick={() => {handleClick("/scopecontents")}}>Use Scope</button>
          </li>
        </ul> 
      </div>
    </>
  );
}
