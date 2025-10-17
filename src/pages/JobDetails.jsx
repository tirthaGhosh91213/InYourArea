// src/pages/JobDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  MessageCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  UserCircle,
} from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import axios from "axios";
import { toast } from "react-toastify";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [job, setJob] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Swipe handlers for fullscreen
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextImage();
    if (diff < -50) prevImage();
  };

  const prevImage = () => {
    if (!job?.imageUrls) return;
    setCurrentImage((prev) =>
      prev === 0 ? job.imageUrls.length - 1 : prev - 1
    );
  };
  const nextImage = () => {
    if (!job?.imageUrls) return;
    setCurrentImage((prev) =>
      prev === job.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Fetch job
  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/v1/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const foundJob = res.data.data.find((j) => j.id.toString() === id);
      setJob(foundJob);
    } catch {
      toast.error("Failed to fetch job");
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/comments/jobs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setComments(res.data.data);
    } catch {
      toast.error("Failed to fetch comments");
    }
  };

  // Post comment
  const postComment = async () => {
    if (!commentText.trim()) return toast.error("Comment cannot be empty");
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/jobs/${id}`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.data]);
        setCommentText("");
        toast.success("Comment added!");
      }
    } catch {
      toast.error("Failed to post comment");
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
    fetchJob();
    fetchComments();
  }, [id, token]);

  if (loading || !job)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg animate-pulse">
        Loading...
      </div>
    );

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar />
      </div>

      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden pt-16">
        {/* Left Sidebar */}
        {/* <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar />
        </div> */}

       <main className="flex-1 overflow-y-auto p-6 relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-green-700 font-semibold hover:text-teal-700 transition"
          >
            <ArrowLeft size={20} /> Back
          </motion.button>

          {/* Job Card */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-6 space-y-6 border border-green-200"
          >
            {/* Images */}
            {job.imageUrls?.length > 0 && (
              <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={job.imageUrls[currentImage]}
                  alt={job.title}
                  className="w-full h-full object-cover transition-all duration-500 rounded-2xl cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                />
                {job.imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/70 text-green-700 p-2 rounded-full hover:bg-white/90 transition"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/70 text-green-700 p-2 rounded-full hover:bg-white/90 transition"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Job Info */}
            <div className="flex justify-between items-center text-gray-700">
              <div className="flex items-center gap-3">
                <Building2 size={24} className="text-green-600" />
                <div>
                  <div className="font-semibold text-gray-800">{job.company}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} /> Deadline:{" "}
                    <span className="text-red-500">{job.applicationDeadline}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin size={16} className="text-green-600" /> {job.location}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
              {job.description}
            </p>

            {/* Apply Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(job.applyLink, "_blank");
              }}
              className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition mb-6"
            >
              Apply Now
            </button>

            {/* Comments */}
            <div className="mt-6 space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  onClick={postComment}
                  className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
                >
                  Send
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-3 mt-3">
                {comments.length > 0 ? (
                  comments.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 items-start text-gray-700 bg-green-50 rounded-xl p-3 shadow-sm"
                    >
                      <UserCircle size={20} className="text-green-500 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-800">
                          {c.author ? `${c.author.firstName} ${c.author.lastName}` : "Anonymous"}
                        </div>
                        <div className="text-gray-700">{c.content}</div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        </main>

        {/* Fullscreen Image */}
        <AnimatePresence>
          {isFullscreen && job.imageUrls?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-5 right-5 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition"
              >
                <X size={24} />
              </button>
              {job.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-5 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-5 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
              <img
                src={job.imageUrls[currentImage]}
                alt={job.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
