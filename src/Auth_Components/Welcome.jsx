import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <>
     <div className="welcome-hero">
        <h1>
          Welcome to <strong>SwiftScope</strong>
        </h1>
        <h3>Learn Swiftly. Review Effectively.</h3>
        <p>
          Spend less time learning by learning effieciently with
          <strong>SwiftScope</strong> a learning tool to help you learn
          materials faster as efficient as possible with Active learning With
          Swift, and Active Recall With Scope.
        </p>
      </div>
      <div className="get-started">
        <h3>Start Your Progress today!!</h3>
        <ul className="get-started-buttons">
          <li>
            <Link to="/register"><button>Register</button></Link>
          </li>
          <li>
            <Link to="/login"><button>Login</button></Link>
          </li>
        </ul>
      </div>
    </>
  )
}