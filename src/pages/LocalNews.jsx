// src/pages/LocalNews.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../../src/components/SideBar";
import RightSidebar from "../components/RightSidebar";
import { Clock, Loader2, MessageSquare } from "lucide-react";

export default function LocalNews() {
  const params = useParams();
  const navigate = useNavigate();

  const districts = [
    "----------- Jharkhand -----------",
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka",
    "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla",
    "Hazaribagh", "Jamtara", "Jamshedpur", "Khunti", "Koderma",
    "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh",
    "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum",
    "----------- Bihar -----------",
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar",
    "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
    "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura",
    "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas",
    "Saharsa", "Samastipur", "Saran (Chhapra)", "Sheikhpura", "Sheohar", "Sitamarhi",
    "Siwan", "Supaul", "Vaishali", "West Champaran (Bettiah)",
  ];

  // Prevent heading as selected value
  const getInitialDistrict = () => {
    const paramDistrict = params.district ? decodeURIComponent(params.district) : "";
    if (paramDistrict && !paramDistrict.startsWith("-")) return paramDistrict;
    const saved = localStorage.getItem("district");
    if (saved && !saved.startsWith("-")) return saved;
    return districts.find((d) => !d.startsWith("-")) || "";
  };

  const [district, setDistrict] = useState(getInitialDistrict());
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("accessToken");

  // On dropdown select or on param change, always sync to local storage and URL
  useEffect(() => {
    // Do not sync if the heading is ever set by mistake
    if (district && !district.startsWith("-") && params.district !== district) {
      localStorage.setItem("district", district);
      navigate(`/localnews/${encodeURIComponent(district)}`, { replace: true });
    }
  }, [district]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (!district || district.startsWith("-")) return;
    const fetchNews = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `https://cached-nursery-kevin-advances.trycloudflare.com//api/v1/district-news/${district}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        if (res.data.success) {
          const fetchedNews = res.data.data || [];
          setNewsList(shuffleArray(fetchedNews));
        } else setError("Failed to load news data");
      } catch (err) {
        setError("Failed to load local news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [district, token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleNewsClick = (id) => navigate(`/localnews/details/${id}`);
  const handleCommentClick = (id) => navigate(`/localnews/details/${id}`);

  // NEW: Desktop layout logic changed as per instructions
  const getDesktopNewsLayout = () => {
    // First 2 = big boxes, next 2 = small boxes, remaining big boxes below
    const bigTop = newsList.slice(0, 2); // large first two
    const smallBoxes = newsList.slice(2, 4); // small next two
    const bigMore = newsList.slice(4); // remaining as additional big boxes
    return { bigTop, smallBoxes, bigMore };
  };
  const { bigTop, smallBoxes, bigMore } = getDesktopNewsLayout();

  // Helper to render first media item (image or video)
  const renderMedia = (url, alt, className) => {
    const isVideo = url &&
      (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg") || url.includes("video"));
    if (isVideo) return <video src={url} controls className={className} />;
    return <img src={url} alt={alt} className={className} />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="hidden lg:block w-64 fixed h-full top-0 left-0 z-20">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header bar */}
        <div className="fixed top-0 w-full z-30">
          <RightSidebar />
        </div>
        <main className="flex-1 flex flex-col gap-6 p-6 pt-24 items-center">
          {/* Header */}
          <motion.div
            className="bg-emerald-700 text-white rounded-xl p-5 shadow-lg w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Local District News</h2>
              <p className="text-emerald-200 mt-1">
                Latest updates from {district || "your district"}
              </p>
            </div>
            {/* Select input removed as requested */}
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-green-600" size={40} />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 font-semibold">{error}</div>
          ) : newsList.length === 0 ? (
            district && !district.startsWith("-") && (
              <div className="text-center text-gray-600 font-medium">
                No district news found.
              </div>
            )
          ) : (
            <>
              {/* Mobile: show all as same style large boxes, single column */}
              <div className="w-full max-w-6xl lg:hidden flex flex-col gap-6">
                {newsList.map((news, i) => (
                  <motion.div
                    key={news.id || i}
                    className="relative rounded-3xl overflow-hidden shadow-lg border border-green-100 cursor-pointer group"
                    onClick={() => handleNewsClick(news.id)}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ minHeight: "350px", height: "350px" }}
                  >
                    {Array.isArray(news.imageUrls) && news.imageUrls.length > 0 &&
                      renderMedia(
                        news.imageUrls[0],
                        news.title,
                        "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 p-6 text-white">
                      <h3
                        className="text-2xl font-bold mb-2 capitalize"
                        dangerouslySetInnerHTML={{ __html: news.title }}
                      />
                      <div
                        className="text-sm text-gray-200 mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: news.content }}
                      />
                      <div className="flex items-center justify-between text-gray-300 text-sm mb-3">
                        <span>
                          {news.author?.firstName} {news.author?.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {formatDate(news.createdAt)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommentClick(news.id);
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition-all"
                      >
                        <MessageSquare size={16} /> Comment
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Desktop: two column grid */}
              <div className="w-full max-w-6xl hidden lg:grid grid-cols-[2fr_1fr] gap-6 items-start">
                {/* Left Side: Big Boxes - show first 2 + all after 4 */}
                <div className="flex flex-col gap-6">
                  {bigTop.map((news, i) => (
                    <motion.div
                      key={news.id || `big-top-${i}`}
                      className="relative rounded-3xl overflow-hidden shadow-lg border border-green-100 cursor-pointer group"
                      onClick={() => handleNewsClick(news.id)}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ height: "520px" }}
                    >
                      {Array.isArray(news.imageUrls) && news.imageUrls.length > 0 &&
                        renderMedia(
                          news.imageUrls[0],
                          news.title,
                          "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 p-6 text-white">
                        <h3
                          className="text-2xl font-bold mb-2 capitalize"
                          dangerouslySetInnerHTML={{ __html: news.title }}
                        />
                        <div
                          className="text-sm text-gray-200 mb-3 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: news.content }}
                        />
                        <div className="flex items-center justify-between text-gray-300 text-sm mb-3">
                          <span>
                            {news.author?.firstName} {news.author?.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {formatDate(news.createdAt)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommentClick(news.id);
                          }}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition-all"
                        >
                          <MessageSquare size={16} /> Comment
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {bigMore.map((news, i) => (
                    <motion.div
                      key={news.id || `big-more-${i}`}
                      className="relative rounded-3xl overflow-hidden shadow-lg border border-green-100 cursor-pointer group"
                      onClick={() => handleNewsClick(news.id)}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (bigTop.length + i) * 0.05 }}
                      style={{ height: "520px" }}
                    >
                      {Array.isArray(news.imageUrls) && news.imageUrls.length > 0 &&
                        renderMedia(
                          news.imageUrls[0],
                          news.title,
                          "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 p-6 text-white">
                        <h3
                          className="text-2xl font-bold mb-2 capitalize"
                          dangerouslySetInnerHTML={{ __html: news.title }}
                        />
                        <div
                          className="text-sm text-gray-200 mb-3 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: news.content }}
                        />
                        <div className="flex items-center justify-between text-gray-300 text-sm mb-3">
                          <span>
                            {news.author?.firstName} {news.author?.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {formatDate(news.createdAt)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommentClick(news.id);
                          }}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition-all"
                        >
                          <MessageSquare size={16} /> Comment
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Right Side: Small Boxes - only news[2] and news[3] */}
                {smallBoxes.length > 0 && (
                  <div className="flex flex-col gap-6 sticky top-24 h-[520px]">
                    {smallBoxes.map((news, i) => (
                      <motion.div
                        key={news.id || `small-${i}`}
                        className="relative rounded-2xl overflow-hidden shadow-md border border-green-100 cursor-pointer group flex-1"
                        onClick={() => handleNewsClick(news.id)}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (bigTop.length + i) * 0.05 }}
                      >
                        {Array.isArray(news.imageUrls) && news.imageUrls.length > 0 &&
                          renderMedia(
                            news.imageUrls[0],
                            news.title,
                            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 p-4 text-white w-full">
                          <h3
                            className="text-lg font-semibold capitalize mb-1 line-clamp-1"
                            dangerouslySetInnerHTML={{ __html: news.title }}
                          />
                          <div
                            className="text-xs text-gray-200 line-clamp-2 mb-1"
                            dangerouslySetInnerHTML={{ __html: news.content }}
                          />
                          <div className="flex items-center justify-between text-xs text-gray-300">
                            <span>
                              {news.author?.firstName} {news.author?.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {formatDate(news.createdAt)}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCommentClick(news.id);
                            }}
                            className="mt-2 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-sm transition-all"
                          >
                            <MessageSquare size={14} /> Comment
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
