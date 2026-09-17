import { useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
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
import MusicButton from "./Audio/MusicButton";

// Route screens are ranked by how deep they sit in the learner journey, so the
// transition can travel forward while diving in and backward on the way out.
function getRouteDepth(pathname) {
  return pathname.split("/").filter(Boolean).length;
}

/**
 * Cross-fades the outgoing and incoming screens so navigating reads as one
 * continuous flow instead of an instant swap. The wrapper animates to
 * "leaving", the finished route is swapped in, then it animates to
 * "entering" — both driven by CSS so only opacity and transform are used.
 */
function AppRoutes() {
  const location = useLocation();
  // The route currently painted. It intentionally trails `location` by one
  // animation so the outgoing screen can animate away before the new one mounts.
  const [displayedLocation, setDisplayedLocation] = useState(location);
  const [stage, setStage] = useState("entering");
  const [direction, setDirection] = useState("forward");
  const [lastPathname, setLastPathname] = useState(location.pathname);

  // A navigation is detected during render rather than in an effect, so the exit
  // animation starts in the same paint as the click. React re-runs this
  // component immediately without committing the intermediate state.
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname);
    setDirection(
      getRouteDepth(location.pathname) >= getRouteDepth(displayedLocation.pathname)
        ? "forward"
        : "backward",
    );
    setStage("leaving");
  }

  const handleAnimationEnd = (event) => {
    // Content entrances bubble their animationend up to this wrapper, so only
    // the wrapper's own exit may trigger the swap.
    if (event.target !== event.currentTarget || stage !== "leaving") return;

    setDisplayedLocation(location);
    setStage("entering");
  };

  return (
    <div
      className={`page-transition is-${stage}`}
      data-direction={direction}
      onAnimationEnd={handleAnimationEnd}
    >
      <Routes location={displayedLocation}>
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
    </div>
  );
}

// The router mirrors the learner journey: authenticate, choose a method,
// complete a session, and return to a review or personalized dashboard.
export default function App() {
  return (
    <Router>
      {/* Rendered above the routes so the music control is on every screen and
          keeps looping while the learner navigates between them. */}
      <MusicButton />
      <AppRoutes />
    </Router>
  );
}