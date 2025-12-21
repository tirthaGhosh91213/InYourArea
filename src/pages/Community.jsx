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
import { IoPersonCircleOutline } from "react-icons/io5";
import Loader from "../components/Loader";

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
  const [largeAdIndexes, setLargeAdIndexes] = useState([0, 1]);
  const [largeAd1Closed, setLargeAd1Closed] = useState(false);
  const [largeAd2Closed, setLargeAd2Closed] = useState(false);

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

    // Small ads
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

    // Large ads
    fetch("https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/large")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          const shuffled = shuffle(data.data);
          setLargeAds(shuffled);
          if (shuffled.length === 1) {
            setLargeAdIndexes([0]);
          } else if (shuffled.length >= 2) {
            setLargeAdIndexes([0, 1]);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching community large ads:", err);
      });
  }, []);

  // Rotate small ads index on next refresh after a close
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

  // Mobile: interleave ads after every 2 posts (single post per row)
  const buildMobileItems = () => {
    const items = [];
    if (!filteredPosts.length) return items;
    let adPtr = 0;

    if (filteredPosts.length === 1) {
      if (largeAds.length > 0)
        items.push({ type: "ad", adIndex: largeAdIndexes[0] ?? 0 });
      items.push({ type: "post", post: filteredPosts[0] });
      if (largeAds.length > 1)
        items.push({ type: "ad", adIndex: largeAdIndexes[1] ?? 0 });
      return items;
    }

    if (filteredPosts.length === 2) {
      items.push({ type: "post", post: filteredPosts[0] });
      if (largeAds.length > 0)
        items.push({ type: "ad", adIndex: largeAdIndexes[0] ?? 0 });
      items.push({ type: "post", post: filteredPosts[1] });
      if (largeAds.length > 1)
        items.push({ type: "ad", adIndex: largeAdIndexes[1] ?? 0 });
      return items;
    }

    for (let i = 0; i < filteredPosts.length; i++) {
      items.push({ type: "post", post: filteredPosts[i] });
      const isEndOfPair = (i + 1) % 2 === 0;
      const isNotLast = i !== filteredPosts.length - 1;
      if (isEndOfPair && isNotLast && largeAds.length > 0) {
        const useIdx =
          largeAds.length === 1
            ? largeAdIndexes[0] ?? 0
            : largeAdIndexes[adPtr % largeAdIndexes.length] ?? 0;
        items.push({ type: "ad", adIndex: useIdx });
        adPtr++;
      }
    }
    return items;
  };

  const mobileItems = buildMobileItems();

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const CommunityCard = ({ post, idx }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        delay: idx * 0.03,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.01,
        boxShadow: "0 16px 30px rgba(52, 211, 153, 0.16)",
      }}
      className="relative rounded-2xl bg-white shadow-md border border-emerald-50 cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50 overflow-hidden"
      onClick={() => handlePostClick(post.id)}
    >
      {/* Unified layout for all breakpoints: header → title → image → description → footer */}
      <div className="flex flex-col w-full">
        {/* Header: avatar, name, time */}
        <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <ProfileImage
              src={authorAvatars[post.author.id]}
              alt="author"
              size="w-8 h-8 sm:w-9 sm:h-9"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                {post.author.firstName} {post.author.lastName}
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500">
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Title - Mobile: truncate to 25 chars, Desktop: 2 lines */}
        <div className="px-3 sm:px-4 pt-2 sm:pt-3">
          <h3 className="text-sm sm:text-[15px] md:text-[16px] font-semibold text-gray-900 leading-snug">
            <span className="block md:hidden">
              {truncateText(post.title, 25)}
            </span>
            <span className="hidden md:block line-clamp-2">
              {post.title}
            </span>
          </h3>
        </div>

        {/* Image - Increased heights: Mobile h-52, Tablet h-60, Desktop h-80 */}
        {post.imageUrls && post.imageUrls.length > 0 ? (
          <div className="mt-2 sm:mt-3 w-full h-52 sm:h-60 md:h-80 overflow-hidden">
            <img
              src={post.imageUrls[post.currentImageIndex || 0]}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {/* Description - Mobile: truncate to 30 chars, Desktop: 3 lines */}
        <div className="px-3 sm:px-4 pt-2 sm:pt-3">
          <p className="text-xs sm:text-sm text-gray-700 leading-snug">
            <span className="block md:hidden">
              {truncateText(post.content, 30)}
            </span>
            <span className="hidden md:block line-clamp-3">
              {post.content}
            </span>
          </p>
        </div>

        {/* Footer: comment button */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex-1" />
          <button
            className="flex items-center gap-1 text-emerald-700 text-xs sm:text-sm font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              setShowCommentInput((prev) => ({
                ...prev,
                [post.id]: !prev[post.id],
              }));
              if (!commentsMap[post.id]) fetchComments(post.id);
            }}
          >
            <MessageCircle size={14} className="sm:w-4 sm:h-4" /> Comment
          </button>
        </div>
      </div>

      {/* Comments (shared for both layouts) */}
      {showCommentInput[post.id] && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <div className="mt-2 space-y-2">
            {(commentsMap[post.id] || []).map((c) => (
              <div
                key={c.id}
                className="flex gap-2 items-start text-gray-700 text-xs sm:text-sm"
              >
                <ProfileImage
                  src={commentAvatars[c.author.id]}
                  alt="profile"
                  size="w-6 h-6 sm:w-7 sm:h-7"
                  className="border border-gray-300 flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-gray-800">
                    {c.author.firstName} {c.author.lastName}
                  </span>
                  <span className="break-words">{c.content}</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText[post.id] || ""}
                onChange={(e) =>
                  setCommentText((prev) => ({
                    ...prev,
                    [post.id]: e.target.value,
                  }))
                }
                className="flex-1 px-3 py-1.5 sm:py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 text-xs sm:text-sm"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sendComment(post.id);
                }}
                className="bg-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-emerald-700 transition text-xs sm:text-sm whitespace-nowrap"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar />
      </div>

      {/* Small Ads */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Layout */}
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-2 pt-4 sm:pt-6 pb-6">
          {/* Header + search */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="bg-emerald-700 text-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg w-full max-w-5xl md:max-w-7xl"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-3 sm:mb-4">
              Community Posts
            </h2>
            <div className="flex justify-center">
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-2 flex items-center justify-center pointer-events-none">
                  <Search size={16} className="sm:w-[18px] sm:h-[18px] text-emerald-700" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-1.5 sm:py-2 text-sm rounded-full border border-emerald-300 text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition placeholder-gray-400"
                />
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 mt-10 text-lg sm:text-xl px-4"
            >
              No results found for{" "}
              <span className="font-semibold">{searchTerm}</span>
            </motion.p>
          ) : (
            <>
              {/* MOBILE: posts + ads interleaved, single column */}
              <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-5xl md:hidden pb-6">
                {mobileItems.map((item, idx) =>
                  item.type === "post" ? (
                    <CommunityCard
                      key={`m-post-${item.post.id}`}
                      post={item.post}
                      idx={idx}
                    />
                  ) : largeAds[item.adIndex] ? (
                    <motion.div
                      key={`m-ad-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-2xl shadow-md border border-emerald-100 overflow-hidden h-52 sm:h-60"
                    >
                      <LargeAd
                        ad={largeAds[item.adIndex]}
                        className="w-full h-full"
                      />
                    </motion.div>
                  ) : null
                )}
              </div>

              {/* DESKTOP/TABLET: post list + sticky ads */}
              <div className="hidden md:grid md:grid-cols-3 gap-8 w-full max-w-7xl pb-10">
                {/* Posts column */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  {filteredPosts.map((post, idx) => (
                    <CommunityCard key={post.id} post={post} idx={idx} />
                  ))}
                </div>

                {/* Sticky ads column */}
                <div className="flex">
                  <div className="sticky top-28 w-full flex flex-col gap-6 max-h-[80vh]">
                    {largeAds.length > 0 &&
                      largeAdIndexes.map((idx, i) => {
                        if (i === 0 && largeAd1Closed) return null;
                        if (i === 1 && largeAd2Closed) return null;
                        if (!largeAds[idx]) return null;

                        return (
                          <motion.div
                            key={`large-ad-${i}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative rounded-2xl shadow-md border border-emerald-100 overflow-hidden"
                            style={{ height: "240px", minHeight: "240px" }}
                          >
                            <LargeAd
                              ad={largeAds[idx]}
                              className="w-full h-full"
                            />
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
