// src/pages/LocalNews.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Sidebar from "../../src/components/SideBar";
import RightSidebar from "../components/RightSidebar";
import { MessageSquare, Clock, Loader2 } from "lucide-react";

export default function LocalNews() {
  const params = useParams();
  const navigate = useNavigate();
  const initialDistrict = params.district ? decodeURIComponent(params.district) : "";

  const [district, setDistrict] = useState(initialDistrict);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("accessToken");

  const districts = [
    "Bokaro",
    "Chatra",
    "Deoghar",
    "Dhanbad",
    "Dumka",
    "East Singhbhum",
    "Garhwa",
    "Giridih",
    "Godda",
    "Gumla",
    "Hazaribagh",
    "Jamtara",
    "Jamshedpur",
    "Khunti",
    "Koderma",
    "Latehar",
    "Lohardaga",
    "Pakur",
    "Palamu",
    "Ramgarh",
    "Ranchi",
    "Sahibganj",
    "Seraikela-Kharsawan",
    "Simdega",
    "West Singhbhum",
  ];

  // Keep district and URL in sync when dropdown changes
  useEffect(() => {
    if (district && params.district !== district) {
      navigate(`/localnews/${encodeURIComponent(district)}`, { replace: true });
    }
    // eslint-disable-next-line
  }, [district]);

  // Shuffle array (for random news order)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch news
  useEffect(() => {
    if (!district) return;

    const fetchNews = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/district-news/${district}/recent`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        if (res.data.success) {
          const fetchedNews = res.data.data || [];
          const randomized = shuffleArray(fetchedNews); // randomize order
          setNewsList(randomized);
        } else {
          setError("Failed to load news data");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
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

  // ✅ Function to navigate to news details page
  const handleNewsClick = (id) => {
    navigate(`/localnews/details/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="hidden lg:block w-64 fixed h-full top-0 left-0 z-20">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Right Sidebar */}
        <div className="fixed top-0 w-full z-30">
          <RightSidebar />
        </div>

        <main className="flex-1 flex flex-col gap-6 p-6 pt-24 items-center">
          {/* Header + District Select */}
          <motion.div
            className="bg-emerald-700 text-white rounded-xl p-6 shadow-lg w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div>
              <h2 className="text-2xl font-bold text-center sm:text-left">
                Local District News
              </h2>
              <p className="text-center sm:text-left text-emerald-200 mt-1">
                Latest news updates from {district || "your district"} (Last 5 Days)
              </p>
            </div>

            {/* District Dropdown */}
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="px-4 py-2 rounded-md text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select District --</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </motion.div>

          {/* News Section */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-green-600" size={40} />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 font-semibold">{error}</div>
          ) : newsList.length === 0 ? (
            district && (
              <div className="text-center text-gray-600 font-medium">
                No district news found.
              </div>
            )
          ) : (
            <AnimatePresence>
              <div className="w-full max-w-6xl flex flex-col gap-8">
                {/* Featured News (first item) */}
                {newsList[0] && (
                  <motion.div
                    key={newsList[0].id}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-green-100 cursor-pointer"
                    onClick={() => handleNewsClick(newsList[0].id)} // ✅ Navigate on click
                  >
                    {Array.isArray(newsList[0].imageUrls) && newsList[0].imageUrls.length > 0 && (
                      <img
                        src={newsList[0].imageUrls[0]}
                        alt={newsList[0].title}
                        className="w-full h-[400px] object-cover sm:object-center"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 p-6 sm:p-10 text-white">
                      <h2 className="text-2xl sm:text-4xl font-bold mb-3 drop-shadow-lg">
                        {newsList[0].title}
                      </h2>
                      <p className="text-sm sm:text-base mb-3 line-clamp-3 text-gray-100">
                        {newsList[0].content || "No content available."}
                      </p>
                      <div className="flex items-center justify-between text-sm sm:text-base text-gray-200">
                        <span>
                          By {newsList[0].author?.firstName} {newsList[0].author?.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} /> {formatDate(newsList[0].createdAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Remaining News Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {newsList.slice(1).map((news, i) => (
                    <motion.div
                      key={news.id || i}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl shadow-md border border-green-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                      onClick={() => handleNewsClick(news.id)} // ✅ Navigate on click
                    >
                      {Array.isArray(news.imageUrls) && news.imageUrls.length > 0 && (
                        <img
                          src={news.imageUrls[0]}
                          alt={news.title}
                          className="w-full h-48 sm:h-56 object-cover"
                        />
                      )}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                          {news.title}
                        </h3>
                        <p className="text-gray-600 text-sm flex-grow line-clamp-3 mb-3">
                          {news.content || "No content available."}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {news.author?.firstName} {news.author?.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {formatDate(news.createdAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
