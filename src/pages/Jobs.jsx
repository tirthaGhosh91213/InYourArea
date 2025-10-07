// src/pages/Jobs.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Building2,
  MapPin,
  Search,
  DollarSign,
  Heart,
  Send,
  PlusCircle,
} from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechNova",
    location: "London, UK",
    type: "Full-Time",
    salary: "£45,000 - £55,000",
    logo: "https://img.icons8.com/color/96/000000/react-native.png",
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "CloudBridge",
    location: "Manchester, UK",
    type: "Remote",
    salary: "£50,000 - £60,000",
    logo: "https://img.icons8.com/color/96/000000/nodejs.png",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "PixelVerse",
    location: "Bristol, UK",
    type: "Contract",
    salary: "£35/hour",
    logo: "https://img.icons8.com/color/96/000000/figma--v1.png",
  },
  {
    id: 4,
    title: "Data Analyst",
    company: "InsightWorks",
    location: "Leeds, UK",
    type: "Full-Time",
    salary: "£40,000 - £48,000",
    logo: "https://img.icons8.com/color/96/000000/python--v1.png",
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "SkyStack",
    location: "Birmingham, UK",
    type: "Hybrid",
    salary: "£55,000 - £65,000",
    logo: "https://img.icons8.com/color/96/000000/docker.png",
  },
];

const filterTabs = [
  { name: "All", icon: Briefcase },
  { name: "Full-Time", icon: Briefcase },
  { name: "Remote", icon: Building2 },
  { name: "Hybrid", icon: MapPin },
];

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [likedJobs, setLikedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("All"); // default: All

  const toggleLike = (id) => {
    setLikedJobs((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };

  // Filter jobs by search term and active tab
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "All" || job.type === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 overflow-y-auto">
        {/* Jobs Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="bg-emerald-700 text-white rounded-xl p-6 mb-6 shadow-lg"
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-center mb-4">Job Board</h2>

          {/* Search Bar */}
          <div className="flex justify-center mb-6">
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

          {/* Filter Tabs */}
          <div className="flex justify-center gap-3">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg border transition ${
                    isActive
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1 font-semibold text-center">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Job Cards */}
        <AnimatePresence>
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{
                    scale: 1.06,
                    boxShadow: "0 25px 40px rgba(52, 211, 153, 0.25)",
                  }}
                  className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-white/90 shadow-lg border border-green-100 backdrop-blur transition-all cursor-pointer hover:bg-gradient-to-r hover:from-emerald-100 hover:via-green-50 hover:to-teal-100"
                >
                  {/* Job Logo */}
                  <motion.img
                    src={job.logo}
                    alt={job.company}
                    className="w-14 h-14 object-contain rounded-full border border-emerald-200 p-1 bg-white shadow mb-4"
                    whileHover={{ y: -5 }}
                  />

                  {/* Job Header */}
                  <div className="mb-3">
                    <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                    <p className="text-sm text-emerald-700 flex items-center gap-1">
                      <Building2 size={14} /> {job.company}
                    </p>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center gap-2 hover:text-green-700 transition">
                      <MapPin size={16} className="text-green-700" /> {job.location}
                    </p>
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 animate-pulse">
                      {job.type}
                    </span>
                    <p className="flex items-center gap-2 hover:text-yellow-600 transition">
                      <DollarSign size={16} className="text-yellow-600" /> {job.salary}
                    </p>
                  </div>

                  {/* Action Buttons */}
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
                        likedJobs.includes(job.id) ? "text-red-500" : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <Heart size={18} /> Save
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 col-span-full mt-10 text-xl"
            >
              No results found for "<span className="font-semibold">{searchTerm}</span>"
            </motion.p>
          )}
        </AnimatePresence>

        {/* Floating Post Job Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-10 right-10 flex items-center gap-2 bg-emerald-600 text-white font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all"
        >
          <PlusCircle size={20} />
          Post a Job
        </motion.button>
      </main>

      <RightSidebar />
    </div>
  );
}
