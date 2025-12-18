// src/pages/Community.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search } from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import SmallAdd from "../components/SmallAdd";
import LargeAd from "../components/LargeAd";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IoPersonCircleOutline } from "react-icons/io5"; // Ionicons profile image

// Helper: fetch avatar for any user ID
const fetchProfileImage = async (userId) => {
  try {
    const res = await axios.get(
      `https://api.jharkhandbiharupdates.com/api/v1/user/profile/${userId}`
    );
    if (
      res.data &&
      res.data.success &&
      res.data.data &&
      res.data.data.profileImageUrl
    ) {
      return res.data.data.profileImageUrl;
    }
  } catch (error) {}
  return null; // Return null instead of a string
};

// Helper: Get next index in circular manner
function getNextIndex(current, total) {
  if (total === 0) return 0;
  return (current + 1) % total;
}

// Helper: shuffle array (for large ads)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// LocalStorage keys for Community ads
const SLOT_KEYS = {
  TOP_RIGHT: "COMMUNITY_AD_INDEX_TOP_RIGHT",
  BOTTOM_RIGHT: "COMMUNITY_AD_INDEX_BOTTOM_RIGHT",
};

export default function Community() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [authorAvatars, setAuthorAvatars] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [commentAvatars, setCommentAvatars] = useState({});
  const [showCommentInput, setShowCommentInput] = useState({});
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);

  // Small ads
  const [ads, setAds] = useState([]);
  const [topRightIndex, setTopRightIndex] = useState(0);
  const [bottomRightIndex, setBottomRightIndex] = useState(1);
  const [topRightClosed, setTopRightClosed] = useState(false);
  const [bottomRightClosed, setBottomRightClosed] = useState(false);

  // Large ads
  const [largeAds, setLargeAds] = useState([]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://api.jharkhandbiharupdates.com/api/v1/community",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setPosts(res.data.data);

        const avatarMap = res.data.data.reduce((acc, post) => {
          acc[post.author.id] = post.author.profileImageUrl || null;
          return acc;
        }, {});
        setAuthorAvatars(avatarMap);
      }
    } catch {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Fetch small ads for Community
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
          // Keep original order
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
        console.error("Error fetching community small ads:", err);
      });

    // Fetch large ads for Community interleaving
    fetch("https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/large")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setLargeAds(shuffle(data.data));
        }
      })
      .catch((err) => {
        console.error("Error fetching community large ads:", err);
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

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `https://api.jharkhandbiharupdates.com/api/v1/comments/community-posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setCommentsMap((prev) => ({ ...prev, [postId]: res.data.data }));

        const newAvatars = res.data.data.reduce((acc, comment) => {
          acc[comment.author.id] = comment.author.profileImageUrl || null;
          return acc;
        }, {});

        setCommentAvatars((prev) => ({
          ...prev,
          ...newAvatars,
        }));
      }
    } catch {
      toast.error("Failed to fetch comments");
    }
  };

  const sendComment = async (postId) => {
    if (!commentText[postId]) return toast.error("Comment cannot be empty");
    try {
      const res = await axios.post(
        `https://api.jharkhandbiharupdates.com/api/v1/comments/community-posts/${postId}`,
        { content: commentText[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Comment added!");
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
        fetchComments(postId);
      }
    } catch {
      toast.error("Failed to send comment");
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${post.author.firstName} ${post.author.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const truncateWords = (str, count) => {
    if (!str) return "";
    const words = str.trim().split(/\s+/);
    return words.length <= count ? str : words.slice(0, count).join(" ") + "...";
  };

  const getSummary = (content) => {
    if (!content) return "";
    const words = content.trim().split(/\s+/);
    if (window.innerWidth < 640) return content;
    return words.length <= 25 ? content : words.slice(0, 25).join(" ") + "...";
  };

  const ProfileImage = ({ src, alt, size, className = "" }) =>
    src ? (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover border border-gray-200 ${size} ${className}`}
      />
    ) : (
      <IoPersonCircleOutline
        size={size.replace("w-", "").replace("h-", "") * 8 || 40}
        color="#b2b2b2"
        className={`bg-gray-200 rounded-full ${className}`}
        style={{ minWidth: "2rem", minHeight: "2rem" }}
      />
    );

  const handlePostClick = (postId) => {
    navigate(`/community/${postId}`);
  };

  const topRightAd = ads.length ? ads[topRightIndex % ads.length] : null;
  const bottomRightAd = ads.length ? ads[bottomRightIndex % ads.length] : null;

  // Build interleaved list: ad -> post -> post -> ad ...
  function buildInterleavedGrid(postsArr, adsArr) {
    const result = [];
    let postIdx = 0;
    let adIdx = 0;
    while (postIdx < postsArr.length || adIdx < adsArr.length) {
      if (adIdx < adsArr.length) {
        result.push({ type: "ad", data: adsArr[adIdx] });
        adIdx++;
      }
      for (let k = 0; k < 2 && postIdx < postsArr.length; k++) {
        result.push({ type: "post", data: postsArr[postIdx] });
        postIdx++;
      }
    }
    return result;
  }

  const gridItems = buildInterleavedGrid(filteredPosts, largeAds);

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar />
      </div>

      {/* Ads like Events/Jobs */}
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

      {/* Wrapper with mobile margin */}
      <div className="px-3 pb-3 pt-16 sm:px-0 sm:pb-0 sm:pt-16">
        <div className="flex h-[calc(100vh-1.5rem)] sm:h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden rounded-2xl sm:rounded-none">
          <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
            <Sidebar />
          </div>

          <main className="flex-1 overflow-y-auto px-0 sm:px-6 pt-4 pb-10 relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 80 }}
              className="bg-emerald-700 text-white rounded-xl p-6 mb-6 shadow-lg mx-0 sm:mx-4"
            >
              <h2 className="text-2xl font-semibold text-center mb-4">
                Community Posts
              </h2>
              <div className="flex justify-center sm:wl-10 ">
                <div className="relative w-full sm:w-96 ">
                  <div className="absolute inset-y-0 left-2 flex items-center justify-center pointer-events-none">
                    <Search size={18} className="text-emerald-700" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-emerald-300 text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition placeholder-gray-400"
                  />
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-12 text-gray-600">
                Loading...
              </div>
            ) : gridItems.length > 0 ? (
              <AnimatePresence>
                <div className="space-y-5 mx-0 sm:mx-4">
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
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          delay: idx * 0.05,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{
                          scale: 1.01,
                          boxShadow: "0 10px 24px rgba(52, 211, 153, 0.10)",
                        }}
                        className="relative rounded-xl overflow-hidden bg-white/90 shadow-md border border-green-50 transition-all cursor-pointer hover:bg-gradient-to-l hover:from-emerald-100 hover:via-green-50 hover:to-teal-50"
                        onClick={() => handlePostClick(item.data.id)}
                      >
                        {/* DESKTOP+TABLET layout */}
                        <div className="hidden sm:flex items-start">
                          {/* Left: Profile Image */}
                          <div className="flex flex-col items-center px-4 py-4 flex-shrink-0">
                            <ProfileImage
                              src={authorAvatars[item.data.author.id]}
                              alt="author"
                              size="w-12 h-12"
                            />
                          </div>

                          {/* Center: Title, Author Name, Date, Content */}
                          <div className="flex flex-col justify-start px-4 py-4 flex-1 min-w-0">
                            {/* Title */}
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 leading-snug break-words">
                              {item.data.title}
                            </h3>

                            {/* Author Name and Date */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="font-semibold text-gray-800 text-sm">
                                {item.data.author.firstName}{" "}
                                {item.data.author.lastName}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(item.data.createdAt)}
                              </span>
                            </div>

                            {/* Content Summary */}
                            <span className="text-[15px] text-gray-700 mb-3">
                              {getSummary(item.data.content)}
                            </span>

                            {/* Comment Button */}
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCommentInput((prev) => ({
                                  ...prev,
                                  [item.data.id]: !prev[item.data.id],
                                }));
                                if (!commentsMap[item.data.id])
                                  fetchComments(item.data.id);
                              }}
                              className="inline-flex items-center gap-2 text-green-700 font-semibold mt-1"
                            >
                              <MessageCircle size={18} /> Comment
                            </motion.button>

                            {/* Comments Section */}
                            {showCommentInput[item.data.id] && (
                              <div className="mt-3 space-y-2">
                                {(commentsMap[item.data.id] || []).map((c) => (
                                  <div
                                    key={c.id}
                                    className="flex gap-2 items-center text-gray-700"
                                  >
                                    <ProfileImage
                                      src={commentAvatars[c.author.id]}
                                      alt="profile"
                                      size="w-8 h-8"
                                      className="border border-gray-300"
                                    />
                                    <span className="font-semibold text-gray-800 mr-1">
                                      {c.author.firstName} {c.author.lastName}
                                    </span>
                                    <span>{c.content}</span>
                                  </div>
                                ))}
                                <div className="flex gap-2 mt-2">
                                  <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={commentText[item.data.id] || ""}
                                    onChange={(e) =>
                                      setCommentText((prev) => ({
                                        ...prev,
                                        [item.data.id]: e.target.value,
                                      }))
                                    }
                                    className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                                  />
                                  <button
                                    onClick={() => sendComment(item.data.id)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
                                  >
                                    Send
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right: Post Image */}
                          {item.data.imageUrls &&
                            item.data.imageUrls.length > 0 && (
                              <div className="flex flex-col justify-center items-center px-4 py-4 flex-shrink-0">
                                <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-lg overflow-hidden">
                                  <img
                                    src={
                                      item.data.imageUrls[
                                        item.data.currentImageIndex || 0
                                      ]
                                    }
                                    alt={item.data.title}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  {item.data.imageUrls.length > 1 && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPosts((prev) =>
                                            prev.map((p) =>
                                              p.id === item.data.id
                                                ? {
                                                    ...p,
                                                    currentImageIndex:
                                                      (p.currentImageIndex ||
                                                        0) -
                                                        1 <
                                                      0
                                                        ? p.imageUrls.length - 1
                                                        : (p.currentImageIndex ||
                                                            0) - 1,
                                                  }
                                                : p
                                            )
                                          );
                                        }}
                                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition"
                                      >
                                        ←
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPosts((prev) =>
                                            prev.map((p) =>
                                              p.id === item.data.id
                                                ? {
                                                    ...p,
                                                    currentImageIndex:
                                                      (p.currentImageIndex ||
                                                        0) +
                                                        1 >=
                                                      p.imageUrls.length
                                                        ? 0
                                                        : (p.currentImageIndex ||
                                                            0) + 1,
                                                  }
                                                : p
                                            )
                                          );
                                        }}
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition"
                                      >
                                        →
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* MOBILE RESPONSIVE LAYOUT */}
                        <div className="flex sm:hidden flex-col w-full p-4 gap-3">
                          {/* Top Row: Profile + Title */}
                          <div className="flex items-start gap-3">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                              <ProfileImage
                                src={authorAvatars[item.data.author.id]}
                                alt="author"
                                size="w-10 h-10"
                              />
                            </div>

                            {/* Title */}
                            <h3 className="flex-1 text-base font-bold text-gray-900 leading-snug break-words">
                              {item.data.title}
                            </h3>
                          </div>

                          {/* Author Name and Date */}
                          <div className="flex items-center gap-2 pl-[52px]">
                            <span className="font-semibold text-gray-800 text-sm">
                              {item.data.author.firstName}{" "}
                              {item.data.author.lastName}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.data.createdAt)}
                            </span>
                          </div>

                          {/* Content and Image Row */}
                          <div className="flex gap-3 pl-[52px]">
                            {/* Content */}
                            <div className="flex-1">
                              <span className="text-[14px] text-gray-800">
                                {truncateWords(item.data.content, 15)}
                              </span>
                            </div>

                            {/* Post Image */}
                            {item.data.imageUrls &&
                              item.data.imageUrls.length > 0 && (
                                <div className="flex-shrink-0">
                                  <div className="w-20 h-24 rounded-lg overflow-hidden">
                                    <img
                                      src={
                                        item.data.imageUrls[
                                          item.data.currentImageIndex || 0
                                        ]
                                      }
                                      alt={item.data.title}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Comment Button */}
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCommentInput((prev) => ({
                                ...prev,
                                [item.data.id]: !prev[item.data.id],
                              }));
                              if (!commentsMap[item.data.id])
                                fetchComments(item.data.id);
                            }}
                            className="inline-flex items-center gap-2 text-green-700 font-semibold pl-[52px]"
                          >
                            <MessageCircle size={18} /> Comment
                          </motion.button>

                          {/* Comments Section */}
                          {showCommentInput[item.data.id] && (
                            <div className="mt-2 space-y-2 pl-[52px]">
                              {(commentsMap[item.data.id] || []).map((c) => (
                                <div
                                  key={c.id}
                                  className="flex gap-2 items-center text-gray-700"
                                >
                                  <ProfileImage
                                    src={commentAvatars[c.author.id]}
                                    alt="profile"
                                    size="w-8 h-8"
                                    className="border border-gray-300"
                                  />
                                  <span className="font-semibold text-gray-800 mr-1">
                                    {c.author.firstName} {c.author.lastName}
                                  </span>
                                  <span>{c.content}</span>
                                </div>
                              ))}
                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentText[item.data.id] || ""}
                                  onChange={(e) =>
                                    setCommentText((prev) => ({
                                      ...prev,
                                      [item.data.id]: e.target.value,
                                    }))
                                  }
                                  className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                                <button
                                  onClick={() => sendComment(item.data.id)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
                                >
                                  Send
                                </button>
                              </div>
                            </div>
                          )}
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
                className="text-center text-gray-500 mt-10 text-xl"
              >
                No results found for{" "}
                <span className="font-semibold">{searchTerm}</span>
              </motion.p>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
