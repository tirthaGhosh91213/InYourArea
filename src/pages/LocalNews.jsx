// src/pages/LocalNews.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import { MessageSquare, Clock, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function LocalNews() {
  const params = useParams();
  const navigate = useNavigate();
  const initialDistrict = params.district
    ? decodeURIComponent(params.district)
    : "";

  const [district, setDistrict] = useState(initialDistrict);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState({});

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

  // Keep district and URL in sync when dropdown is changed
  useEffect(() => {
    if (district && params.district !== district) {
      navigate(`/localnews/${encodeURIComponent(district)}`, { replace: true });
    }
    // eslint-disable-next-line
  }, [district]);

  // Fetch news whenever district changes
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
          setNewsList(res.data.data || []);
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

  const handlePrevImage = (newsId, total) => {
    setCurrentImage((prev) => ({
      ...prev,
      [newsId]: prev[newsId] === 0 ? total - 1 : prev[newsId] - 1,
    }));
  };

  const handleNextImage = (newsId, total) => {
    setCurrentImage((prev) => ({
      ...prev,
      [newsId]: prev[newsId] === total - 1 ? 0 : prev[newsId] + 1,
    }));
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

            {/* Standard District Dropdown */}
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

          {/* Loading / Error / News */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-green-600" size={40} />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 font-semibold">{error}</div>
          ) : newsList.length === 0 ? (
            district && <div className="text-center text-gray-600 font-medium">No district news found.</div>
          ) : (
            <AnimatePresence>
              <div className="flex flex-col gap-6 w-full max-w-5xl">
                {newsList.map((news, i) => {
                  const images = Array.isArray(news.imageUrls) ? news.imageUrls : [];
                  const imgIndex = currentImage[news.id] || 0;

                  return (
                    <motion.div
                      key={news.id || i}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-3xl shadow-md border border-green-100 overflow-hidden hover:shadow-xl hover:border-green-300 transition-all duration-300 w-full"
                    >
                      {/* Image Slider */}
                      {images.length > 0 && (
                        <div className="relative w-full overflow-hidden">
                          <div className="hidden sm:flex gap-2 p-2 overflow-x-auto">
                            {images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`News ${idx + 1}`}
                                className="h-64 object-cover rounded-lg flex-shrink-0"
                              />
                            ))}
                          </div>
                          <div className="sm:hidden relative">
                            <img
                              src={images[imgIndex]}
                              alt="News"
                              className="w-full h-64 object-cover transition-transform duration-700 cursor-pointer"
                              onClick={() => window.open(images[imgIndex], "_blank")}
                            />
                            {images.length > 1 && (
                              <>
                                <button
                                  onClick={() => handlePrevImage(news.id, images.length)}
                                  className="absolute top-1/2 left-2 bg-white/70 rounded-full p-1 hover:bg-white/90 transition"
                                >
                                  <ChevronLeft size={24} />
                                </button>
                                <button
                                  onClick={() => handleNextImage(news.id, images.length)}
                                  className="absolute top-1/2 right-2 bg-white/70 rounded-full p-1 hover:bg-white/90 transition"
                                >
                                  <ChevronRight size={24} />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-white/80 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                                  {imgIndex + 1} / {images.length}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* News Content */}
                      <div className="p-6 space-y-3">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-bold text-gray-800">
                              {news.title}
                            </h3>
                            {news.districtName && (
                              <div className="text-sm text-gray-600 font-medium">
                                District:{" "}
                                <span className="font-semibold">
                                  {news.districtName}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1 sm:mt-0">
                            <Clock size={16} /> {formatDate(news.createdAt)}
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed text-base">
                          {news.content || "No content available."}
                        </p>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-600">
                            By{" "}
                            <span className="ml-1 font-semibold text-green-700">
                              {news.author?.firstName} {news.author?.lastName}
                            </span>
                          </div>
                          <button className="flex items-center gap-1 bg-green-600 text-white px-4 py-1.5 rounded-full text-sm shadow-md hover:bg-green-700 transition">
                            <MessageSquare size={16} /> Comment
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
