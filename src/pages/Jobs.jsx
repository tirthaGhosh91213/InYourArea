import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, Search as SearchIcon, DollarSign,
  Calendar, MessageCircle, Send, UserCircle,
} from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import SmallAdd from "../components/SmallAdd";
import LargeAd from "../components/LargeAd";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Helper: Get next index in circular manner
function getNextIndex(current, total) {
  if (total === 0) return 0;
  return (current + 1) % total;
}

// Helper: Shuffle an array (for large ads order)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SLOT_KEYS = {
  TOP_RIGHT: "JOBS_AD_INDEX_TOP_RIGHT",
  BOTTOM_RIGHT: "JOBS_AD_INDEX_BOTTOM_RIGHT",
  LARGE_AD_1: "JOBS_LARGE_AD_INDEX_1",
  LARGE_AD_2: "JOBS_LARGE_AD_INDEX_2"
};

export default function Jobs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ads, setAds] = useState([]);
  const [topRightIndex, setTopRightIndex] = useState(0);
  const [bottomRightIndex, setBottomRightIndex] = useState(1);
  const [topRightClosed, setTopRightClosed] = useState(false);
  const [bottomRightClosed, setBottomRightClosed] = useState(false);

  const [largeAds, setLargeAds] = useState([]);
  const [largeAdIndexes, setLargeAdIndexes] = useState([0, 1]);
  const timerRef = useRef();

  // --- Fetch JOBS, ADS, LARGE ADS ---
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://api.jharkhandbiharupdates.com/api/v1/jobs");
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

    fetch("https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/small")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          const orderedAds = [...data.data];
          setAds(orderedAds);

          const total = orderedAds.length;
          let savedTop = parseInt(localStorage.getItem(SLOT_KEYS.TOP_RIGHT) ?? "0", 10);
          let savedBottom = parseInt(localStorage.getItem(SLOT_KEYS.BOTTOM_RIGHT) ?? "1", 10);

          if (isNaN(savedTop) || savedTop < 0 || savedTop >= total) savedTop = 0;
          if (isNaN(savedBottom) || savedBottom < 0 || savedBottom >= total) savedBottom = total > 1 ? 1 : 0;
          if (savedTop === savedBottom && total > 1) savedBottom = getNextIndex(savedTop, total);

          setTopRightIndex(savedTop);
          setBottomRightIndex(savedBottom);
        }
      })
      .catch((err) => console.error("Error fetching jobs small ads:", err));

    fetch("https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/large")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          const shuffled = shuffle(data.data);
          setLargeAds(shuffled);

          let largeAdIdx1 = parseInt(localStorage.getItem(SLOT_KEYS.LARGE_AD_1) ?? "0", 10);
          let largeAdIdx2 = parseInt(localStorage.getItem(SLOT_KEYS.LARGE_AD_2) ?? "1", 10);
          const total = shuffled.length;

          if (isNaN(largeAdIdx1) || largeAdIdx1 < 0 || largeAdIdx1 >= total) largeAdIdx1 = 0;
          if (isNaN(largeAdIdx2) || largeAdIdx2 < 0 || largeAdIdx2 >= total) largeAdIdx2 = total > 1 ? 1 : 0;
          if (largeAdIdx1 === largeAdIdx2 && total > 1) largeAdIdx2 = getNextIndex(largeAdIdx1, total);

          setLargeAdIndexes([largeAdIdx1, largeAdIdx2]);
        }
      })
      .catch((err) => {
        console.error("Error fetching jobs large ads:", err);
      });
  }, []);

  useEffect(() => {
    if (!ads.length) return;
    const total = ads.length;
    if (topRightClosed) {
      const nextTop = getNextIndex(topRightIndex, total);
      localStorage.setItem(SLOT_KEYS.TOP_RIGHT, String(nextTop));
    }
    if (bottomRightClosed) {
      const nextBottom = getNextIndex(bottomRightIndex, total);
      localStorage.setItem(SLOT_KEYS.BOTTOM_RIGHT, String(nextBottom));
    }
  }, [topRightClosed, bottomRightClosed, topRightIndex, bottomRightIndex, ads]);

  useEffect(() => {
    if (largeAds.length === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setLargeAdIndexes(([idx1, idx2]) => {
        const total = largeAds.length;
        let nextIdx1 = getNextIndex(idx1, total);
        let nextIdx2 = getNextIndex(idx2, total);
        if (nextIdx1 === nextIdx2 && total > 1) nextIdx2 = getNextIndex(nextIdx1, total);

        localStorage.setItem(SLOT_KEYS.LARGE_AD_1, String(nextIdx1));
        localStorage.setItem(SLOT_KEYS.LARGE_AD_2, String(nextIdx2));
        return [nextIdx1, nextIdx2];
      });
    }, 10000); // 10 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [largeAds]);

  const filteredJobs = jobs.filter((job) =>
    [job.title, job.company, job.location].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Split jobs evenly between two columns
  const leftJobs = [];
  const centerJobs = [];
  filteredJobs.forEach((job, idx) => {
    if (idx % 2 === 0) leftJobs.push(job);
    else centerJobs.push(job);
  });

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const topRightAd = ads.length ? ads[topRightIndex % ads.length] : null;
  const bottomRightAd = ads.length ? ads[bottomRightIndex % ads.length] : null;

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar refreshJobs={fetchJobs} />
      </div>

      {/* Small Ads */}
      {topRightAd && !topRightClosed && (
        <AnimatePresence>
          <SmallAdd
            ad={topRightAd}
            position="top-right"
            open={true}
            onClose={() => setTopRightClosed(true)}
          />
        </AnimatePresence>
      )}
      {bottomRightAd && !bottomRightClosed && (
        <AnimatePresence>
          <SmallAdd
            ad={bottomRightAd}
            position="bottom-right"
            open={true}
            onClose={() => setBottomRightClosed(true)}
          />
        </AnimatePresence>
      )}

      {/* Page Layout */}
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar />
        </div>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-2 pt-6">
          {/* Top Green Heading + Search (unchanged) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="bg-emerald-700 sticky top-0 z-20 text-white rounded-xl p-6 mb-6 shadow-lg w-full max-w-7xl"
          >
            <h2 className="text-2xl font-semibold text-center mb-4">
              Job Board
            </h2>
            <div className="flex  justify-center">
              <div className=" relative w-full sm:w-96">
                <div className=" inset-y-0 left-2 flex items-center justify-center pointer-events-none">
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

          {/* Main 3-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            {/* First Column: Jobs (even indexes) */}
            <div className="flex flex-col gap-6">
              {leftJobs.length === 0 && !loading && (
                <div className="text-center text-gray-500 mt-12">No jobs found.</div>
              )}
              {leftJobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    delay: idx * 0.05,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 25px 40px rgba(52,211,153,0.25)",
                  }}
                  className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-white shadow-md border border-green-100 cursor-pointer hover:bg-gradient-to-r hover:from-emerald-100"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  {job.imageUrls?.length > 0 && (
                    <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                      <img
                        src={job.imageUrls[job.currentImageIndex || 0]}
                        alt={job.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <h2 className="pb-5 font-semibold text-gray-800">
                      {job.title}
                    </h2>
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
            {/* Second Column: Jobs (odd indexes) */}
            <div className="flex flex-col gap-6">
              {centerJobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    delay: idx * 0.05,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 25px 40px rgba(52,211,153,0.25)",
                  }}
                  className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-white shadow-md border border-green-100 cursor-pointer hover:bg-gradient-to-r hover:from-emerald-100"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  {job.imageUrls?.length > 0 && (
                    <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                      <img
                        src={job.imageUrls[job.currentImageIndex || 0]}
                        alt={job.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <h2 className="pb-5 font-semibold text-gray-800">
                      {job.title}
                    </h2>
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
            {/* Third Column: Sponsored Ads (Large Ads, stacked) */}
            <div className="flex flex-col gap-6">
              {largeAds.length > 0 && largeAdIndexes.map((idx, i) =>
                largeAds[idx] ? (
                  <LargeAd
                    key={"fixed-large-ad-" + i}
                    ad={largeAds[idx]}
                    className="rounded-2xl shadow-md border border-green-100"
                    style={{ height: "250px", minHeight: "250px" }}
                  />
                ) : null
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
