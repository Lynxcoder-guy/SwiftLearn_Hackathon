import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Welcome from "./Auth_Components/Welcome";
import Login from "./Auth_Components/Login";
import Register from "./Auth_Components/Register";
import Dashboard from "./Dash_Components/Dashboard";
import DashTimer from "./Dash_Components/DashTimer";
import BlurtContent from "./Scope_components/BlurtCon";
import BlurtTimer from "./Scope_components/Timer";
import BlurtRewrite from "./Scope_components/RewriteBlurt";
import BlurtReview from "./Scope_components/ReviewBlurt";
import SwiftContents from "./Swift_components/SwiftCon";
import SwiftQuiz from "./Swift_components/SwiftQuiz";
import SwiftReview from "./Swift_components/ReviewSwift";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard/:userId" element={<Dashboard />} />
        <Route path="/dashboard/:userId/dashtimer" element={<DashTimer />} />

        <Route  path="/dashboard/:userId/swiftcontents" element={<SwiftContents />}/>
        
        <Route
          path="/dashboard/:userId/swiftcontents/:materialId"
          element={<SwiftQuiz />}
        />
        <Route
          path="/dashboard/:userId/swiftcontents/:materialId/review"
          element={<SwiftReview />}
        />
        <Route
          path="/dashboard/:userId/scopecontents"
          element={<BlurtContent />}
        />
        <Route
          path="/dashboard/:userId/scopecontents/timer"
          element={<BlurtTimer />}
        />
        <Route
          path="/dashboard/:userId/scopecontents/timer/rewrite"
          element={<BlurtRewrite />}
        />
        <Route
          path="/dashboard/:userId/scopecontents/timer/rewrite/review"
          element={<BlurtReview />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}