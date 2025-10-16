import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import HeroPage from "./components/heroPage";

import Footer from "./components/Footer";
import LocalNews from "./pages/LocalNews"; 

import NotFound from "./components/NotFound";
import Community from "./pages/Community";
import Jobs from "./pages/Jobs";
import Events from "./pages/Events";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EventPostForm from "./pages/EventPostForm";
import AdminItemDetail from "./pages/AdminItemDetail";


// ✅ Home component with postcode + navigation
function Home() {
  const navigate = useNavigate();
  const [postcode, setPostcode] = React.useState("");

  const handleSubmit = () => {
    if (postcode.trim() === "") {
      alert("Please enter a valid postcode.");
      return;
    }
    navigate("/localnews"); // Navigate to dashboard
  };

  return (
    <>
      <HeroPage
        onSubmit={handleSubmit}
        setPostcode={setPostcode}
        postcode={postcode}
      />
      <LocalNews />
      <Footer />
    </>
  );
}

// ✅ App component with routing
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/localnews" element={<LocalNews />} />
        <Route path="/community" element={<Community />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-post/:type" element={<CreatePost />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/event-post-form" element={<EventPostForm />} />
        <Route path="/admin/:type/:id" element={<AdminItemDetail />} />
         <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
