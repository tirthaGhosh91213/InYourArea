import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeroPage from "./components/heroPage";
import Footer from "./components/Footer";
import LocalNews from "./pages/LocalNews"; 
import NotFound from "./components/NotFound";
import Community from "./pages/Community";
import Jobs from "./pages/Jobs";
import Events from "./pages/Events";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EventPostForm from "./pages/EventPostForm";
import AdminItemDetail from "./pages/AdminItemDetail";
import CreateJobPost from "./pages/CreateJobPost";
import CreateCommunityPost from "./pages/CreateCommunityPost";
import CreateLocalNewsPost from "./pages/CreateLocalNewsPost";
import CommunityDetails from "./pages/CommunityDetails";
import JobDetails from "./pages/JobDetails";
import EventDetails from "./pages/EventDetails";
import UserDashboard from "./components/UserDashboard";
import RightSidebar from "./components/RightSidebar";
import LocalNewsDetails from "./pages/LocalNewsDetails";
import EmailService from "./components/EmailService";
import GoogleCallback from "./pages/GoogleCallback";

// ✅ Home component
function Home() {
  const [postcode, setPostcode] = React.useState("");

  const handleSubmit = () => {
    if (postcode.trim() === "") {
      alert("Please enter a valid postcode.");
      return;
    }
    window.location.href = "/localnews"; // Navigate to localnews
  };

  return (
    <>
   
      <HeroPage
        onSubmit={handleSubmit}
        setPostcode={setPostcode}
        postcode={postcode}
      />
    
    </>
  );
}

// ✅ App component
export default function App() {
  const token = localStorage.getItem("accessToken");
  return (
    
    <Router>
      {/* Fixed Navbar */}
      

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/localnews/:district" element={<LocalNews />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        <Route path="/community" element={<Community />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/emailservice" element={<EmailService />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/create/events" element={<EventPostForm />} />
        <Route path="/create/jobs" element={<CreateJobPost />} />
        <Route path="/create/localnews" element={<CreateLocalNewsPost />} />
        <Route path="/create/community" element={<CreateCommunityPost />} />
        <Route path="/admin/:type/:id" element={<AdminItemDetail />} />
        <Route
          path="/community/:id"
          element= {<CommunityDetails /> }
        />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/localnews/details/:id" element={<LocalNewsDetails />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
