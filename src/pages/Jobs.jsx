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

// Keys in localStorage for each slot (separate from Events keys)
const SLOT_KEYS = {
  TOP_RIGHT: "JOBS_AD_INDEX_TOP_RIGHT",
  BOTTOM_RIGHT: "JOBS_AD_INDEX_BOTTOM_RIGHT",
};

export default function Jobs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Small ads (same behavior pattern as Events page)
  const [ads, setAds] = useState([]);
  const [topRightIndex, setTopRightIndex] = useState(0);
  const [bottomRightIndex, setBottomRightIndex] = useState(1);
  const [topRightClosed, setTopRightClosed] = useState(false);
  const [bottomRightClosed, setBottomRightClosed] = useState(false);

  // Large banner ads (for interleaving in grid)
  const [largeAds, setLargeAds] = useState([]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://api.jharkhandbiharupdates.com/api/v1/jobs"
      );
      if (res.data.success) {
        setJobs(res.data.data.filter((job) => job.status === "APPROVED"));
      }
    } catch (err) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs, small ads, and large ads
  useEffect(() => {
    fetchJobs();

    // Small ads (top-right / bottom-right)
    fetch(
      "https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/small"
    )
      .then((res) => res.json())
      .then((data) => {
        if (
          data &&
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          // Keep original order a,b,c,d,e,f (as created in backend)
          const orderedAds = [...data.data];
          setAds(orderedAds);

          const total = orderedAds.length;

          // Load saved indexes from localStorage (jobs-specific keys)
          let savedTop = parseInt(
            localStorage.getItem(SLOT_KEYS.TOP_RIGHT) ?? "0",
            10
          );
          let savedBottom = parseInt(
            localStorage.getItem(SLOT_KEYS.BOTTOM_RIGHT) ?? "1",
            10
          );

          // Normalize
          if (isNaN(savedTop) || savedTop < 0 || savedTop >= total) {
            savedTop = 0;
          }
          if (isNaN(savedBottom) || savedBottom < 0 || savedBottom >= total) {
            savedBottom = total > 1 ? 1 : 0;
          }

          // Ensure different ads for top and bottom if possible
          if (savedTop === savedBottom && total > 1) {
            savedBottom = getNextIndex(savedTop, total);
          }

          setTopRightIndex(savedTop);
          setBottomRightIndex(savedBottom);
        }
      })
      .catch((err) => {
        console.error("Error fetching jobs small ads:", err);
      });

    // Large ads (for grid, shuffled every page load)
    fetch("https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/large")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setLargeAds(shuffle(data.data));
        }
      })
      .catch((err) => {
        console.error("Error fetching jobs large ads:", err);
      });
  }, []);

  // When a slot is closed, update localStorage so that on next refresh
  // it moves to the next ad (same pattern as Events page)
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

  const topRightAd = ads.length ? ads[topRightIndex % ads.length] : null;
  const bottomRightAd = ads.length ? ads[bottomRightIndex % ads.length] : null;

  // Interleave large ads and jobs in the grid (ad -> job -> job -> ad ...)
  function buildInterleavedGrid(jobsArr, adsArr) {
    const result = [];
    let jobIdx = 0,
      adIdx = 0;
    while (jobIdx < jobsArr.length || adIdx < adsArr.length) {
      if (adIdx < adsArr.length) {
        result.push({ type: "ad", data: adsArr[adIdx] });
        adIdx++;
      }
      for (let k = 0; k < 2 && jobIdx < jobsArr.length; k++) {
        result.push({ type: "job", data: jobsArr[jobIdx] });
        jobIdx++;
      }
    }
    return result;
  }

  const gridItems = buildInterleavedGrid(filteredJobs, largeAds);

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar refreshJobs={fetchJobs} />
      </div>

      {/* Small Ads - same layout/behavior as Events page */}
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
            <h2 className="text-2xl font-semibold text-center mb-4">
              Job Board
            </h2>
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

          {/* Job + Large Ads Grid */}
          {loading ? (
            <div className="flex justify-center py-12 text-gray-600">
              Loading...
            </div>
          ) : gridItems.length > 0 ? (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {gridItems.map((item, idx) =>
                  item.type === "ad" ? (
                    <LargeAd
                      key={"ad-" + (item.data.id ?? idx)}
                      ad={item.data}
                      onClose={() => {
                        setLargeAds((prev) =>
                          prev.filter((a) => a.id !== item.data.id)
                        );
                      }}
                    />
                  ) : (
                    <motion.div
                      key={item.data.id}
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
                        scale: 1.03,
                        boxShadow: "0 25px 40px rgba(52,211,153,0.25)",
                      }}
                      className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-white/90 shadow-md border border-green-100 backdrop-blur transition-all cursor-pointer hover:bg-gradient-to-r hover:from-emerald-100 hover:via-green-50 hover:to-teal-100"
                      onClick={() => navigate(`/jobs/${item.data.id}`)}
                    >
                      {/* Image slider */}
                      {item.data.imageUrls?.length > 0 && (
                        <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                          <img
                            src={
                              item.data.imageUrls[
                                item.data.currentImageIndex || 0
                              ]
                            }
                            alt={item.data.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                          {item.data.imageUrls.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setJobs((prev) =>
                                    prev.map((j) =>
                                      j.id === item.data.id
                                        ? {
                                            ...j,
                                            currentImageIndex:
                                              (j.currentImageIndex || 0) - 1 <
                                              0
                                                ? j.imageUrls.length - 1
                                                : (j.currentImageIndex || 0) -
                                                  1,
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
                                      j.id === item.data.id
                                        ? {
                                            ...j,
                                            currentImageIndex:
                                              (j.currentImageIndex || 0) + 1 >=
                                              j.imageUrls.length
                                                ? 0
                                                : (j.currentImageIndex || 0) +
                                                  1,
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

                      {item.data.author && (
                        <div className="mt-2 mb-5 flex items-center gap-2 text-gray-500 ">
                          {item.data.author.profileImageUrl ? (
                            <img
                              src={item.data.author.profileImageUrl}
                              alt={`${item.data.author.firstName} ${item.data.author.lastName}`}
                              className="w-6 h-6 rounded-full object-cover border border-green-300 flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "block";
                              }}
                            />
                          ) : null}
                          <UserCircle
                            size={16}
                            className="text-green-700 flex-shrink-0"
                            style={{
                              display: item.data.author.profileImageUrl
                                ? "none"
                                : "block",
                            }}
                          />
                          <span>
                            Posted by:{" "}
                            <span className="font-semibold text-gray-700">
                              {item.data.author.firstName}{" "}
                              {item.data.author.lastName}
                            </span>
                            {item.data.author.role && (
                              <span className="ml-1 text-emerald-700">
                                ({item.data.author.role})
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      <div className="mb-3">
                        <h2 className="pb-5 font-semibold text-gray-800">
                          {item.data.title}
                        </h2>
                        <p className="text-sm text-emerald-700 flex items-center gap-1">
                          <Building2 size={14} /> {item.data.company}
                        </p>
                      </div>

                      <div className="space-y-2 text-gray-700">
                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-green-700" />{" "}
                          {item.data.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign size={16} className="text-yellow-600" />{" "}
                          {item.data.salaryRange}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-600" />{" "}
                          {formatDate(item.data.applicationDeadline)}
                        </p>
                      </div>

                      <div className="mt-4 flex justify-between items-center border-t pt-3 border-emerald-200">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.data.reglink || "", "_blank");
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
                  )
                )}
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
        </main>
      </div>
    </>
  );
}
