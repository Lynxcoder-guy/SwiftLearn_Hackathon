import { Link } from "react-router-dom";
import "./welcome.css";

// Present the product's three learning ideas before the learner authenticates:
// Swift for practice, Scope for recall, and Clynx for prioritization.
export default function Welcome() {
  return (
    <div className="screen-shell welcome-screen">
      <div className="welcome-hero">
        <h1>
          Welcome to <strong>SwiftLearn</strong>
        </h1>
        <p className="welcome-kicker">A clearer way to build lasting understanding</p>
        <p>
          SwiftLearn helps you turn study time into real progress. Learn new
          material with <strong>Swift</strong>, then strengthen your memory with
          active recall through <strong>Scope</strong>, and analyze your study priority
          based on your understanding with <strong>Clynx</strong>.
        </p>
      </div>
      <div className="get-started">
        <p className="section-label">Your next step</p>
        <h2>Start studying efficiently with our program today!!</h2>
        <ul className="get-started-buttons">
          <li>
            <Link to="/register"><button>Register</button></Link>
          </li>
          <li>
            <Link to="/login"><button>Login</button></Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
