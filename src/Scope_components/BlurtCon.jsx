import { Link, useNavigate } from "react-router-dom";

export default function BlurtContent() {
  const navigate = useNavigate();
  return (
    <main>
      <h1>Scope Active Recall</h1>
      <p>
        Using active recall to make your study session as efficient as possible
        with the Scope learning system, you gain the ability to focus on
        mistakes, refine your knowledge, and transform every study session into
        a powerful step toward mastery.
      </p>

      <Link to="/scopecontents/timer">Start a blurting session</Link>
    </main>
  );
}
