// src/pages/LocalNews.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Sidebar from "../../src/components/SideBar";
import RightSidebar from "../components/RightSidebar";
import SmallAdd from "../components/SmallAdd";
import LargeAd from "../components/LargeAd";
import { Clock } from "lucide-react";
import { MdVerified } from "react-icons/md";
import Loader from '../components/Loader';


// Helper: circular next index
function getNextIndex(current, total) {
  if (total === 0) return 0;
  return (current + 1) % total;
}


// Helper: truncate text to specified length
const truncateText = (text, maxLength) => {
  if (!text) return '';
  const cleanText = text.replace(/<[^>]*>/g, '');
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.slice(0, maxLength).trim() + '...';
};


// LocalStorage keys for StateNews ads
const SLOT_KEYS = {
  TOP_RIGHT: "STATENEWS_AD_INDEX_TOP_RIGHT",
  BOTTOM_RIGHT: "STATENEWS_AD_INDEX_BOTTOM_RIGHT",
};


export default function LocalNews() {
  const params = useParams();
  const navigate = useNavigate();


  const states = [
    "----------- States -----------",
    "Bihar",
    "Jharkhand"
  ];


  const getInitialState = () => {
    const paramState = params.state ? decodeURIComponent(params.state) : "";
    if (paramState && !paramState.startsWith("-")) return paramState;
    const saved = localStorage.getItem("state");
    if (saved && !saved.startsWith("-")) return saved;
    return states.find((s) => !s.startsWith("-")) || "";
  };


  const [state, setState] = useState(getInitialState());
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("accessToken");


  // Small ads state
  const [ads, setAds] = useState([]);
  const [topRightIndex, setTopRightIndex] = useState(0);
  const [bottomRightIndex, setBottomRightIndex] = useState(1);
  const [topRightClosed, setTopRightClosed] = useState(false);
  const [bottomRightClosed, setBottomRightClosed] = useState(false);


  // Large ads state for interleaving
  const [largeAds, setLargeAds] = useState([]);


  useEffect(() => {
    if (state && !state.startsWith("-") && params.state !== state) {
      localStorage.setItem("state", state);
      navigate(`/statenews/${encodeURIComponent(state)}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);


  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };


  useEffect(() => {
    if (!state || state.startsWith("-")) return;
    const fetchNews = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `https://api.jharkhandbiharupdates.com/api/v1/state-news/${state}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        if (res.data.success) {
          const fetchedNews = res.data.data || [];
          setNewsList(shuffleArray(fetchedNews));
        } else setError("Failed to load news data");
      } catch (err) {
        setError("Failed to load state news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [state, token]);


  // Fetch small ads for State News
  useEffect(() => {
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
      .catch((err) => {
        console.error("Error fetching state news ads:", err);
      });
  }, []);


  // Fetch large ads for interleaving
  useEffect(() => {
    fetch("https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/large")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setLargeAds(shuffleArray(data.data));
        }
      })
      .catch((err) => {
        console.error("Error fetching state news large ads:", err);
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


  const handleNewsClick = (id) => navigate(`/statenews/details/${id}`);


  // Desktop layout logic
  const getDesktopNewsLayout = () => {
    const bigTop = newsList.slice(0, 2);
    const smallBoxes = newsList.slice(2, 4);
    const bigMore = newsList.slice(4);
    return { bigTop, smallBoxes, bigMore };
  };
  const { bigTop, smallBoxes, bigMore } = getDesktopNewsLayout();


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


  // Mobile interleaved: news then ads
  function buildInterleavedList(newsArr, adsArr) {
    const result = [];
    let newsIdx = 0;
    let adIdx = 0;
    let initialNews = 2;
    for (let i = 0; i < initialNews && newsIdx < newsArr.length; i++) {
      result.push({ type: "news", data: newsArr[newsIdx++] });
    }
    while (newsIdx < newsArr.length || adIdx < adsArr.length) {
      if (adIdx < adsArr.length) {
        result.push({ type: "ad", data: adsArr[adIdx++] });
      }
      for (let k = 0; k < 2 && newsIdx < newsArr.length; k++) {
        result.push({ type: "news", data: newsArr[newsIdx++] });
      }
    }
    return result;
  }
  const mobileItems = buildInterleavedList(newsList, largeAds);


  // Choose ads for desktop columns
  const desktopLargeBoxAds = largeAds.slice(0, 2);
  const desktopSmallBoxAds = largeAds.slice(2, 4);


  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block w-64 fixed h-full top-0 left-0 z-20">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col lg:ml-64">
        <div className="fixed top-0 w-full z-30">
          <RightSidebar />
        </div>


        {/* Small ads top/bottom right */}
        <AnimatePresence>
          {topRightAd && !topRightClosed && (
            <SmallAdd
              ad={topRightAd}
              position="top-right"
              open={true}
              onClose={() => setTopRightClosed(true)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {bottomRightAd && !bottomRightClosed && (
            <SmallAdd
              ad={bottomRightAd}
              position="bottom-right"
              open={true}
              onClose={() => setBottomRightClosed(true)}
            />
          )}
        </AnimatePresence>


        <main className="flex-1 flex flex-col gap-6 p-6 pt-24 items-center">
          <motion.div
            className="bg-emerald-700 text-white rounded-xl p-5 shadow-lg w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                State News
              </h2>
              <p className="text-emerald-200 mt-1">
                Latest updates from {state || "your state"}
              </p>
            </div>
          </motion.div>


          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 font-semibold">{error}</div>
          ) : newsList.length === 0 ? (
            state &&
            !state.startsWith("-") && (
              <div className="text-center text-gray-600 font-medium">
                No state news found.
              </div>
            )
          ) : (
            <>
              {/* Mobile: interleaved large ads + news (content first) */}
              <div className="w-full max-w-6xl lg:hidden flex flex-col gap-6">
                {mobileItems.map((item, i) =>
                  item.type === "ad" ? (
                    <LargeAd
                      key={"ad-mobile-" + (item.data.id ?? i)}
                      ad={item.data}
                      onClose={() => {
                        setLargeAds((prev) =>
                          prev.filter((a) => a.id !== item.data.id)
                        );
                      }}
                    />
                  ) : (
                    <motion.div
                      key={item.data.id || `news-mobile-${i}`}
                      className="relative rounded-3xl overflow-hidden shadow-lg border border-green-100 cursor-pointer group"
                      onClick={() => handleNewsClick(item.data.id)}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ minHeight: "350px", height: "350px" }}
                    >
                      {Array.isArray(item.data.imageUrls) &&
                        item.data.imageUrls.length > 0 &&
                        renderMedia(
                          item.data.imageUrls[0],
                          item.data.title,
                          "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 p-6 text-white">
                        <h3 className="text-2xl font-bold mb-2 capitalize">
                          {truncateText(item.data.title, 35)}
                        </h3>
                        <div
                          className="text-sm text-gray-200 mb-3 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: item.data.content,
                          }}
                        />
                        <div className="flex items-center justify-between text-gray-300 text-sm">
                          <div className="flex items-center gap-1.5">
                            <span>
                              {item.data.author?.firstName}{" "}
                              {item.data.author?.lastName}
                            </span>
                            {item.data.author?.role === "ADMIN" && (
                              <MdVerified 
                                size={16} 
                                className="text-blue-500 flex-shrink-0" 
                              />
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />{" "}
                            {formatDate(item.data.createdAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
              </div>


              {/* Desktop: two columns, show ads as boxes after news */}
              <div className="w-full max-w-6xl hidden lg:grid grid-cols-[2fr_1fr] gap-6 items-start">
                {/* Left: Big boxes (news, then large ads, then more news) */}
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
                        <div className="flex items-center justify-between text-gray-300 text-sm">
                          <div className="flex items-center gap-1.5">
                            <span>
                              {news.author?.firstName} {news.author?.lastName}
                            </span>
                            {news.author?.role === "ADMIN" && (
                              <MdVerified 
                                size={18} 
                                className="text-blue-500 flex-shrink-0" 
                              />
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {formatDate(news.createdAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {/* Show large ads after the news entries in "big boxes" */}
                  {desktopLargeBoxAds.map((ad, i) => (
                    <LargeAd
                      key={"ad-desktop-large-" + (ad.id ?? i)}
                      ad={ad}
                      className="rounded-3xl shadow-lg border border-green-100"
                      style={{ height: "520px" }}
                      onClose={() =>
                        setLargeAds((prev) => prev.filter((a) => a.id !== ad.id))
                      }
                    />
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
                        <div className="flex items-center justify-between text-gray-300 text-sm">
                          <div className="flex items-center gap-1.5">
                            <span>
                              {news.author?.firstName} {news.author?.lastName}
                            </span>
                            {news.author?.role === "ADMIN" && (
                              <MdVerified 
                                size={18} 
                                className="text-blue-500 flex-shrink-0" 
                              />
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {formatDate(news.createdAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Right: Small boxes (news then large ads, styled as small) */}
                <div className="flex flex-col gap-6 sticky top-24 h-[520px]">
                  {smallBoxes.map((news, i) => (
                    <motion.div
                      key={news.id || `small-${i}`}
                      className="relative rounded-2xl overflow-hidden shadow-md border border-green-100 cursor-pointer group flex-1"
                      onClick={() => handleNewsClick(news.id)}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
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
                          <div className="flex items-center gap-1">
                            <span>
                              {news.author?.firstName}{" "}
                              {news.author?.lastName}
                            </span>
                            {news.author?.role === "ADMIN" && (
                              <MdVerified 
                                size={14} 
                                className="text-blue-500 flex-shrink-0" 
                              />
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />{" "}
                            {formatDate(news.createdAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {/* Show large ads in small box column */}
                  {desktopSmallBoxAds.map((ad, i) => (
                    <LargeAd
                      key={"ad-desktop-small-" + (ad.id ?? i)}
                      ad={ad}
                      className="rounded-2xl shadow-md border border-green-100 flex-1"
                      style={{ minHeight: "220px", height: "220px" }}
                      onClose={() =>
                        setLargeAds((prev) => prev.filter((a) => a.id !== ad.id))
                      }
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
