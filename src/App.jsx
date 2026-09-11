import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Authetication components Route
import Welcome from "./Auth_Components/Welcome";
import Login from "./Auth_Components/Login";
import Register from "./Auth_Components/Register";

//Dashboard components Route
import DashBoard from "./Dash_Components/Dashboard";

//Scope system components Route
import BlurtContent from "./Scope_components/BlurtCon";
import BlurtTimer from "./Scope_components/Timer";
import BlurtReview from "./Scope_components/ReviewBlurt";

//Swift system components Route
import SwiftContentOption from "./Swift_components/SwiftCon";
import SwiftTutorial from "./Swift_components/SwiftQuiz";
import SwiftReview from "./Swift_components/ReviewSwift";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/*Routers for Auth components*/}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/*Routers for Dashboard_components*/}
          <Route path="/dashboard/:userId" element={<DashBoard />} />

          {/*Routers for Swift_components*/}
          <Route path="/swiftcontents" element={<SwiftContentOption />} />
          <Route
            path="/swiftcontents/:materialId"
            element={<SwiftTutorial />}
          />
          <Route
            path="/swiftcontents/:materialId/:reviewId"
            element={<SwiftReview />}
          />
          {/*After finishing the study materials*/}

          {/*Routers for Scope_components*/}
          <Route path="/scopecontents" element={<BlurtContent />} />
          <Route path="/scopecontents/timer" element={<BlurtTimer />} />
          <Route path="/scopecontents/timer/review" element={<BlurtReview />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
