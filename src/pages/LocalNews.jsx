// src/pages/LocalNews.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../../src/components/SideBar";
import RightSidebar from "../components/RightSidebar";
import SmallAdd from "../components/SmallAdd";
import { Clock, Loader2, MessageSquare } from "lucide-react";

// Helper: circular next index
function getNextIndex(current, total) {
  if (total === 0) return 0;
  return (current + 1) % total;
}

// LocalStorage keys for LocalNews ads
const SLOT_KEYS = {
  TOP_RIGHT: "LOCALNEWS_AD_INDEX_TOP_RIGHT",
  BOTTOM_RIGHT: "LOCALNEWS_AD_INDEX_BOTTOM_RIGHT",
};

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

  // Ads state
  const [ads, setAds] = useState([]);
  const [topRightIndex, setTopRightIndex] = useState(0);
  const [bottomRightIndex, setBottomRightIndex] = useState(1);
  const [topRightClosed, setTopRightClosed] = useState(false);
  const [bottomRightClosed, setBottomRightClosed] = useState(false);

  // Sync district with URL and localStorage
  useEffect(() => {
    if (district && !district.startsWith("-") && params.district !== district) {
      localStorage.setItem("district", district);
      navigate(`/localnews/${encodeURIComponent(district)}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch district news
  useEffect(() => {
    if (!district || district.startsWith("-")) return;
    const fetchNews = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `https://api.jharkhandbiharupdates.com/api/v1/district-news/${district}`,
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

  // Fetch small ads for Local News
  useEffect(() => {
    fetch("https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/small")
      .then((res) => res.json())
      .then((data) => {
        if (
          data &&
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          const orderedAds = [...data.data];
          setAds(orderedAds);

          const total = orderedAds.length;
          let savedTop = parseInt(
            localStorage.getItem(SLOT_KEYS.TOP_RIGHT) ?? "0",
            10
          );
          let savedBottom = parseInt(
            localStorage.getItem(SLOT_KEYS.BOTTOM_RIGHT) ?? "1",
            10
          );

          if (isNaN(savedTop) || savedTop < 0 || savedTop >= total) {
            savedTop = 0;
          }
          if (isNaN(savedBottom) || savedBottom < 0 || savedBottom >= total) {
            savedBottom = total > 1 ? 1 : 0;
          }

          if (savedTop === savedBottom && total > 1) {
            savedBottom = getNextIndex(savedTop, total);
          }

          setTopRightIndex(savedTop);
          setBottomRightIndex(savedBottom);
        }
      })
      .catch((err) => {
        console.error("Error fetching local news ads:", err);
      });
  }, []);

  // Rotate ad index on next refresh after a close
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleNewsClick = (id) => navigate(`/localnews/details/${id}`);
  const handleCommentClick = (id) => navigate(`/localnews/details/${id}`);

  // Desktop layout logic
  const getDesktopNewsLayout = () => {
    const bigTop = newsList.slice(0, 2);
    const smallBoxes = newsList.slice(2, 4);
    const bigMore = newsList.slice(4);
    return { bigTop, smallBoxes, bigMore };
  };
  const { bigTop, smallBoxes, bigMore } = getDesktopNewsLayout();

  // Helper to render first media item (image or video)
  const renderMedia = (url, alt, className) => {
    const isVideo =
      url &&
      (url.endsWith(".mp4") ||
        url.endsWith(".webm") ||
        url.endsWith(".ogg") ||
        url.includes("video"));
    if (isVideo) return <video src={url} controls className={className} />;
    return <img src={url} alt={alt} className={className} />;
  };

  const topRightAd = ads.length ? ads[topRightIndex % ads.length] : null;
  const bottomRightAd = ads.length ? ads[bottomRightIndex % ads.length] : null;

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

        {/* Ads like Events/Jobs/Community */}
        {topRightAd && !topRightClosed && (
          <SmallAdd
            ad={topRightAd}
            position="top-right"
            open={true}
            onClose={() => setTopRightClosed(true)}
          />
        )}
        {bottomRightAd && !bottomRightClosed && (
          <SmallAdd
            ad={bottomRightAd}
            position="bottom-right"
            open={true}
            onClose={() => setBottomRightClosed(true)}
          />
        )}

        <main className="flex-1 flex flex-col gap-6 p-6 pt-24 items-center">
          {/* Header */}
          <motion.div
            className="bg-emerald-700 text-white rounded-xl p-5 shadow-lg w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Local District News
              </h2>
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
            district &&
            !district.startsWith("-") && (
              <div className="text-center text-gray-600 font-medium">
                No district news found.
              </div>
            )
          ) : (
            <>
              {/* Mobile: all large cards */}
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
                    {Array.isArray(news.imageUrls) &&
                      news.imageUrls.length > 0 &&
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

              {/* Desktop: 2-column layout */}
              <div className="w-full max-w-6xl hidden lg:grid grid-cols-[2fr_1fr] gap-6 items-start">
                {/* Left: Big boxes */}
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
                      {Array.isArray(news.imageUrls) &&
                        news.imageUrls.length > 0 &&
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
                            {news.author?.firstName}{" "}
                            {news.author?.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />{" "}
                            {formatDate(news.createdAt)}
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
                      {Array.isArray(news.imageUrls) &&
                        news.imageUrls.length > 0 &&
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
                            {news.author?.firstName}{" "}
                            {news.author?.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />{" "}
                            {formatDate(news.createdAt)}
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

                {/* Right: small boxes (2 & 3) */}
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
                        {Array.isArray(news.imageUrls) &&
                          news.imageUrls.length > 0 &&
                          renderMedia(
                            news.imageUrls[0],
                            news.title,
                            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 p-4 text-white w-full">
                          <h3
                            className="text-lg font-semibold capitalize mb-1 line-clamp-1"
                            dangerouslySetInnerHTML={{
                              __html: news.title,
                            }}
                          />
                          <div
                            className="text-xs text-gray-200 line-clamp-2 mb-1"
                            dangerouslySetInnerHTML={{
                              __html: news.content,
                            }}
                          />
                          <div className="flex items-center justify-between text-xs text-gray-300">
                            <span>
                              {news.author?.firstName}{" "}
                              {news.author?.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />{" "}
                              {formatDate(news.createdAt)}
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
