// src/pages/Jobs.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Search as SearchIcon,
  DollarSign,
  Calendar,
  MessageCircle,
  Send,
  UserCircle,
} from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Jobs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://rehabilitation-cost-additionally-pci.trycloudflare.com/api/v1/jobs");
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

  const filteredJobs = jobs.filter((job) =>
    [job.title, job.company, job.location].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar refreshJobs={fetchJobs} />
      </div>

      {/* Page Layout */}
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar />
        </div>
        {/* Main Content */}
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
                  <SearchIcon size={18} className="text-emerald-700" />
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
            <div className="flex justify-center py-12 text-gray-600">Loading...</div>
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
                    transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 25px 40px rgba(52,211,153,0.25)",
                    }}
                    className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-white/90 shadow-md border border-green-100 backdrop-blur transition-all cursor-pointer hover:bg-gradient-to-r hover:from-emerald-100 hover:via-green-50 hover:to-teal-100"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    {/* Image slider */}
                    {job.imageUrls?.length > 0 && (
                      <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                        <img
                          src={job.imageUrls[job.currentImageIndex || 0]}
                          alt={job.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        {job.imageUrls.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setJobs((prev) =>
                                  prev.map((j) =>
                                    j.id === job.id
                                      ? {
                                          ...j,
                                          currentImageIndex:
                                            (j.currentImageIndex || 0) - 1 < 0
                                              ? j.imageUrls.length - 1
                                              : (j.currentImageIndex || 0) - 1,
                                        }
                                      : j
                                  )
                                );
                              }}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition"
                            >
                              &#8592;
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setJobs((prev) =>
                                  prev.map((j) =>
                                    j.id === job.id
                                      ? {
                                          ...j,
                                          currentImageIndex:
                                            (j.currentImageIndex || 0) + 1 >= j.imageUrls.length
                                              ? 0
                                              : (j.currentImageIndex || 0) + 1,
                                        }
                                      : j
                                  )
                                );
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition"
                            >
                              &#8594;
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {job.author && (
                      <div className="mt-2 mb-5 flex items-center gap-2 text-gray-500 ">
                        <UserCircle size={16} className="text-green-700" />
                        <span className="">
                          Posted by:{" "}
                          <span className="font-semibold text-gray-700">
                            {job.author.firstName} {job.author.lastName}
                          </span>
                          {job.author.role && (
                            <span className="ml-1 text-emerald-700">({job.author.role})</span>
                          )}
                        </span>
                      </div>
                    )}

                    <div className="mb-3">
                      <h2 className=" pb-5 font-semibold text-gray-800">{job.title}</h2>
                      <p className="text-sm text-emerald-700 flex items-center gap-1">
                        <Building2 size={14} /> {job.company}
                      </p>
                    </div>

                    <div className="space-y-2 text-gray-700">
                      <p className="flex items-center gap-2">
                        <MapPin size={16} className="text-green-700" /> {job.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <DollarSign size={16} className="text-yellow-600" /> {job.salaryRange}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-600" /> {formatDate(job.applicationDeadline)}
                      </p>
                    </div>

                    {/* Author */}
                    

                    <div className="mt-4 flex justify-between items-center border-t pt-3 border-emerald-200">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(job.reglink || "", "_blank");
                        }}
                        className="flex items-center gap-2 text-green-700 font-semibold hover:text-teal-700 transition"
                      >
                        <Send size={18} /> Apply Now
                      </motion.button>
                      <motion.div className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition">
                        <MessageCircle size={18} /> Comment
                      </motion.div>
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
              No results found for <span className="font-semibold">"{searchTerm}"</span>
            </motion.p>
          )}
        </main>
      </div>
    </>
  );
}
