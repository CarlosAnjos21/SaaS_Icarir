import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Feedbacks from "./pages/Feedbacks";
import Missions from "./pages/Missions";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import Trips from "./pages/Trips";
import Logout from "./pages/Logout";

export default function App() {
  return (
    <Router>
      <div className="bg-white text-dark min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </div>
    </Router>
  );
}