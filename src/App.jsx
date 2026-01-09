import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeroPage from "./components/heroPage";
import Footer from "./components/Footer";
import LocalNews from "./pages/LocalNews"; 
// import NotFound from "./components/NotFound";
// import { NotFound } from "./components/ui/ghost-404-page-1"
import { NotFoundPage } from "./components/ui/404-page-not-found"
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
import Properties from "./pages/Properties";
import CreatePropertyPost from "./pages/CreatePropertyPost";
import AdminAddPost from "./pages/AdminAddPost";
import AdminAddSection from "./pages/AdminAddSection";
import AboutUs from "./pages/AboutUs";
import CodeOfEthics from "./pages/CodeOfEthics";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import PropertyDetails from "./pages/PropertyDetails";
import PropertyInquiries from "./pages/PropertyInquiries";
import AllPropertiesAdmin from './pages/AllPropertiesAdmin';
import History from "./components/HistoryModal";

// ✅ Home component
function Home() {
  const [postcode, setPostcode] = React.useState("");

  const handleSubmit = () => {
    if (postcode.trim() === "") {
      alert("Please enter a valid postcode.");
      return;
    }
    window.location.href = "/statenews";
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
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/statenews/:state" element={<LocalNews />} />
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
        <Route path="/create/properties" element={<CreatePropertyPost />} />
        <Route path="/admin/:type/:id" element={<AdminItemDetail />} />
        <Route path="/community/:id" element={<CommunityDetails />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/statenews/details/:id" element={<LocalNewsDetails />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/createPropertyPost" element={<CreatePropertyPost />} />
        <Route path="/add-post" element={<AdminAddPost />} />
        <Route path="/add" element={<AdminAddSection />} />
        <Route path="/admin/inquiries" element={<PropertyInquiries />} />
        <Route path="/admin/properties" element={<AllPropertiesAdmin />} />

        <Route path="/history" element={<History />} />
        
        {/* Footer Pages */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/code-of-ethics" element={<CodeOfEthics />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
