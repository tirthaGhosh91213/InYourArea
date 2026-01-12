// src/pages/LocalNews.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Sidebar from "../../src/components/SideBar";
import RightSidebar from "../components/RightSidebar";
import SmallAdd from "../components/SmallAdd";
import LargeAd from "../components/LargeAd";
import { Clock, Play, ChevronDown } from "lucide-react";
import { MdVerified } from "react-icons/md";
import StateNewsLoader from '../components/StateNewsLoader'; // 🔥 IMPORTED

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

// 🔥 NEW: Get Cloudinary video thumbnail
const getVideoThumbnail = (videoUrl) => {
  if (!videoUrl) return null;
  
  if (videoUrl.includes('cloudinary.com') && videoUrl.includes('/video/upload/')) {
    return videoUrl
      .replace('/video/upload/', '/video/upload/so_0,q_auto,f_auto/')
      .replace(/\.(mp4|webm|ogg|mov)$/i, '.jpg');
  }
  
  return null;
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  
  // 🔥 PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  
  const token = localStorage.getItem("accessToken");

  // 🔥 INFINITE SCROLL REF (Mobile)
  const observerTarget = useRef(null);

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
  }, [state, params.state, navigate]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 🔥 FETCH NEWS WITH PAGINATION
  const fetchNews = useCallback(async (page = 0, append = false) => {
    if (!state || state.startsWith("-")) return;
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    setError("");
    
    try {
      const res = await axios.get(
        `https://api.jharkhandbiharupdates.com/api/v1/state-news/${state}`,
        {
          params: { page, size: PAGE_SIZE },
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
        }
      );
      
      if (res.data.success) {
        const pageData = res.data.data;
        const fetchedNews = pageData.content || [];
        
        if (append) {
          setNewsList(prev => [...prev, ...fetchedNews]);
        } else {
          setNewsList(fetchedNews);
        }
        
        setCurrentPage(pageData.number);
        setTotalPages(pageData.totalPages);
        setHasMore(!pageData.last);
      } else {
        setError("Failed to load news data");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load state news");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [state, token]);

  // 🔥 INITIAL LOAD
  useEffect(() => {
    setNewsList([]);
    setCurrentPage(0);
    setHasMore(true);
    fetchNews(0, false);
  }, [state, fetchNews]);

  // 🔥 LOAD MORE HANDLER (Desktop button)
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNews(currentPage + 1, true);
    }
  };

  // 🔥 INFINITE SCROLL OBSERVER (Mobile)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchNews(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, currentPage, fetchNews]);

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

  // 🔥 OPTIMIZED: Show thumbnail for videos, actual image for images
  const renderMedia = (url, alt, className) => {
    const isVideo =
      url &&
      (url.endsWith(".mp4") ||
        url.endsWith(".webm") ||
        url.endsWith(".ogg") ||
        url.includes("video"));
    
    if (isVideo) {
      const thumbnail = getVideoThumbnail(url);
      if (thumbnail) {
        return (
          <div className="relative w-full h-full">
            <img 
              src={thumbnail} 
              alt={alt} 
              className={className}
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-full p-4 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Play size={32} className="text-gray-800 fill-gray-800" />
              </div>
            </div>
          </div>
        );
      }
    }
    
    return <img src={url} alt={alt} className={className} loading="lazy" />;
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
            // 🔥 REPLACED <Loader /> WITH <StateNewsLoader />
            <div className="w-full flex justify-center">
               <StateNewsLoader />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 font-semibold">{error}</div>
          ) : newsList.length === 0 ? (
            state &&
            !state.startsWith("-") && (
              <div className="text-center text-gray-600 font-medium">
                {/* No state news found. */}
              </div>
            )
          ) : (
            <>
              {/* 🔥 MOBILE: Infinite scroll with observer */}
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
                        <h3 className="text-base font-semibold mb-3 capitalize leading-snug">
                          {truncateText(item.data.title, 120)}
                        </h3>
                        <div className="flex items-center justify-between text-gray-300 text-xs">
                          <div className="flex items-center gap-1">
                            <span>
                              {item.data.author?.firstName}{" "}
                              {item.data.author?.lastName}
                            </span>
                            {item.data.author?.role === "ADMIN" && (
                              <MdVerified 
                                size={12} 
                                className="text-blue-500 flex-shrink-0" 
                              />
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />{" "}
                            {formatDate(item.data.createdAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
                
                {/* 🔥 INFINITE SCROLL TRIGGER (Mobile) */}
                <div ref={observerTarget} className="h-10 flex items-center justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                      <span className="text-sm font-medium">Loading more...</span>
                    </div>
                  )}
                  {!hasMore && newsList.length > 0 && (
                    <p className="text-gray-500 text-sm">No more news to load</p>
                  )}
                </div>
              </div>

              {/* 🔥 DESKTOP: Load More Button */}
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
                        <div className="text-sm text-gray-200 mb-3">
                          {truncateText(news.content, 70)}
                        </div>
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
                        <div className="text-sm text-gray-200 mb-3">
                          {truncateText(news.content, 70)}
                        </div>
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
                  
                  {/* 🔥 LOAD MORE BUTTON (Desktop) */}
                  {hasMore && (
                    <motion.button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <span>Load More News</span>
                          <ChevronDown size={20} />
                        </>
                      )}
                    </motion.button>
                  )}
                  
                  {!hasMore && newsList.length > 0 && (
                    <div className="text-center py-6 text-gray-500 font-medium">
                      You've reached the end of news
                    </div>
                  )}
                </div>
                
                {/* Right: Small boxes */}
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
                        <div className="text-xs text-gray-200 mb-1">
                          {truncateText(news.content, 70)}
                        </div>
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