// src/pages/Jobs.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Search,
  DollarSign,
  Heart,
  Send,
  PlusCircle,
} from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar"; // will act as top navbar
import axios from "axios";
import { toast } from "react-toastify";

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [likedJobs, setLikedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/v1/jobs");
      if (res.data.success) {
        setJobs(res.data.data.filter((job) => job.status === "APPROVED"));
      }
    } catch (err) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const toggleLike = (id) => {
    setLikedJobs((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };

  const filteredJobs = jobs.filter((job) =>
    [job.title, job.company, job.location].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      {/* ===== Top Navbar ===== */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar refreshJobs={fetchJobs} />
      </div>

      {/* ===== Page Layout ===== */}
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden pt-16">
        {/* ===== Left Sidebar ===== */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar />
        </div>

        {/* ===== Main Content ===== */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="bg-emerald-700 text-white rounded-xl p-6 mb-6 shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-center mb-4">Job Board</h2>
            <div className="flex justify-center">
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-2 flex items-center justify-center pointer-events-none">
                  <Search size={18} className="text-emerald-700" />
                </div>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-emerald-300 text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition placeholder-gray-400"
                />
              </div>
            </div>
          </motion.div>

          {/* Job Cards */}
          {loading ? (
            <div className="flex justify-center py-12 text-gray-600">
              Loading...
            </div>
          ) : filteredJobs.length > 0 ? (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {filteredJobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      delay: idx * 0.05,
                      type: "spring",
                      stiffness: 100,
                    }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 25px 40px rgba(52, 211, 153, 0.25)",
                    }}
                    className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-white/90 shadow-md border border-green-100 backdrop-blur transition-all cursor-pointer hover:bg-gradient-to-r hover:from-emerald-100 hover:via-green-50 hover:to-teal-100"
                  >
                    <img
                      src={job.imageUrls?.[0] || job.logo}
                      alt={job.company}
                      className="w-14 h-14 object-contain rounded-full border border-emerald-200 p-1 bg-white shadow mb-4"
                    />

                    <div className="mb-3">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {job.title}
                      </h2>
                      <p className="text-sm text-emerald-700 flex items-center gap-1">
                        <Building2 size={14} /> {job.company}
                      </p>
                    </div>

                    <div className="space-y-2 text-gray-700">
                      <p className="flex items-center gap-2">
                        <MapPin size={16} className="text-green-700" />{" "}
                        {job.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <DollarSign size={16} className="text-yellow-600" />{" "}
                        {job.salaryRange}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-between items-center border-t pt-3 border-emerald-200">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-green-700 font-semibold hover:text-teal-700 transition"
                      >
                        <Send size={18} /> Apply Now
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 1.2 }}
                        onClick={() => toggleLike(job.id)}
                        className={`flex items-center gap-2 transition ${
                          likedJobs.includes(job.id)
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
                        }`}
                      >
                        <Heart size={18} /> Save
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 col-span-full mt-10 text-xl"
            >
              No results found for{" "}
              <span className="font-semibold">"{searchTerm}"</span>
            </motion.p>
          )}

          {/* Floating Post Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/create/jobs")}
            className="fixed bottom-10 right-10 flex items-center gap-2 bg-emerald-600 text-white font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all z-50"
          >
            <PlusCircle size={20} />
            Post a Job
          </motion.button>
        </main>
      </div>
    </>
  );
}
