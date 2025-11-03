import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search } from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Helper: fetch avatar for any user ID
const fetchProfileImage = async (userId) => {
  try {
    const res = await axios.get(`https://cached-nursery-kevin-advances.trycloudflare.com/api/v1/user/profile/${userId}`);
    if (res.data && res.data.success && res.data.data && res.data.data.profileImageUrl) {
      return res.data.data.profileImageUrl;
    }
  } catch (error) {}
  return "/default-avatar.png";
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

  // Fetch posts, and author avatars
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://cached-nursery-kevin-advances.trycloudflare.com/api/v1/community",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setPosts(res.data.data);
        const avatarFetches = res.data.data.map(async (post) => {
          const avatar = await fetchProfileImage(post.author.id);
          return { userId: post.author.id, avatar };
        });
        const avatarList = await Promise.all(avatarFetches);
        const avatarMap = avatarList.reduce((acc, { userId, avatar }) => {
          acc[userId] = avatar;
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
  }, []);

  // Fetch comments and comment author avatars
  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `https://cached-nursery-kevin-advances.trycloudflare.com/api/v1/comments/community-posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setCommentsMap((prev) => ({ ...prev, [postId]: res.data.data }));
        const fetchAvatars = res.data.data.map(async (comment) => {
          const avatar = await fetchProfileImage(comment.author.id);
          return { userId: comment.author.id, avatar };
        });
        const avatarList = await Promise.all(fetchAvatars);
        setCommentAvatars((prev) => ({
          ...prev,
          ...avatarList.reduce((acc, { userId, avatar }) => { acc[userId] = avatar; return acc; }, {})
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
        `https://cached-nursery-kevin-advances.trycloudflare.com/api/v1/comments/community-posts/${postId}`,
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

  /** Truncate helpers for mobile card rendering only */
  const truncateWords = (str, count) => {
    if (!str) return "";
    const words = str.trim().split(/\s+/);
    return words.length <= count ? str : words.slice(0, count).join(" ") + "...";
  };

  // Original summary function for desktop/tablet
  const getSummary = (content) => {
    if (!content) return "";
    const words = content.trim().split(/\s+/);
    if (window.innerWidth < 640) return content; // Not used for mobile here
    return words.length <= 25 ? content : words.slice(0, 25).join(" ") + "...";
  };

  return (
    <>
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar />
      </div>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden pt-16">
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
            <div className="flex justify-center">
              <div className="relative w-full sm:w-96">
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
            <div className="flex justify-center py-12 text-gray-600">Loading...</div>
          ) : filteredPosts.length > 0 ? (
            <AnimatePresence>
              <div className="space-y-5 mx-0 sm:mx-4">
                {filteredPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
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
                    onClick={() => window.innerWidth < 640 ? null : navigate(`/community/${post.id}`)}
                  >
                    {/* DESKTOP+TABLET layout untouched */}
                    <div className="hidden sm:flex">
                      <div className="flex flex-col items-center px-4 py-4 min-w-[90px]">
                        <img
                          src={authorAvatars[post.author.id] || "/default-avatar.png"}
                          alt="author"
                          className="rounded-full w-12 h-12 object-cover border border-gray-200 mb-2"
                        />
                        <span className="font-semibold text-gray-900 text-[15px] text-center max-w-[80px] truncate">
                          {post.author.firstName} {post.author.lastName}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center px-6 py-4 flex-1 min-w-0">
                        <span className="font-semibold text-lg truncate mb-1">
                          {post.title}
                        </span>
                        <span className="text-xs text-gray-500 mb-2 block">
                          {formatDate(post.createdAt)}
                        </span>
                        <span className="text-[15px] text-gray-700 mb-3">
                          {getSummary(post.content)}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCommentInput((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }));
                            if (!commentsMap[post.id]) fetchComments(post.id);
                          }}
                          className="inline-flex items-center gap-2 text-green-700 font-semibold mt-1"
                        >
                          <MessageCircle size={18} /> Comment
                        </motion.button>
                        {showCommentInput[post.id] && (
                          <div className="mt-3 space-y-2">
                            {(commentsMap[post.id] || []).map((c) => (
                              <div
                                key={c.id}
                                className="flex gap-2 items-center text-gray-700"
                              >
                                <img
                                  src={commentAvatars[c.author.id] || "/default-avatar.png"}
                                  alt="profile"
                                  className="rounded-full w-8 h-8 object-cover border border-gray-300"
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
                                value={commentText[post.id] || ""}
                                onChange={(e) =>
                                  setCommentText((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                              />
                              <button
                                onClick={() => sendComment(post.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {post.imageUrls && post.imageUrls.length > 0 && (
                        <div className="flex flex-col justify-center items-center px-4 py-4 min-w-[140px]">
                          <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={post.imageUrls[post.currentImageIndex || 0]}
                              alt={post.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            {post.imageUrls.length > 1 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPosts((prev) =>
                                      prev.map((p) =>
                                        p.id === post.id
                                          ? {
                                              ...p,
                                              currentImageIndex:
                                                (p.currentImageIndex || 0) - 1 < 0
                                                  ? p.imageUrls.length - 1
                                                  : (p.currentImageIndex || 0) - 1,
                                            }
                                          : p
                                      )
                                    );
                                  }}
                                  className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition"
                                >
                                  &#8592;
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPosts((prev) =>
                                      prev.map((p) =>
                                        p.id === post.id
                                          ? {
                                              ...p,
                                              currentImageIndex:
                                                (p.currentImageIndex || 0) + 1 >= p.imageUrls.length
                                                  ? 0
                                                  : (p.currentImageIndex || 0) + 1,
                                            }
                                          : p
                                      )
                                    );
                                  }}
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition"
                                >
                                  &#8594;
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* MOBILE RESPONSIVE LAYOUT (sm:hidden) */}
                    <div className="flex sm:hidden flex-col w-full p-4 gap-2">
                      {/* Title truncated to 6 words */}
                      <span className="text-base font-bold w-full text-center mb-2">
                        {truncateWords(post.title, 6)}
                      </span>
                      <div className="flex flex-row items-center w-full">
                        {/* Avatar, firstName and date/desc block, now at left */}
                        <div className="flex flex-col items-center mr-2">
                          <img
                            src={authorAvatars[post.author.id] || "/default-avatar.png"}
                            alt="author"
                            className="rounded-full w-10 h-10 object-cover border border-gray-200"
                          />
                          <span className="text-[15px] font-semibold text-center text-gray-700 mt-1">
                            {post.author.firstName}
                          </span>
                        </div>
                        <div className="flex flex-col items-start ml-2 flex-1">
                          <span className="text-xs text-gray-400">
                            {formatDate(post.createdAt)}
                          </span>
                          <span className="text-[14px] text-gray-800 mt-1">
                            {truncateWords(post.content, 7)}
                          </span>
                        </div>
                        {/* Post image at right side */}
                        {post.imageUrls && post.imageUrls.length > 0 && (
                          <div className="flex-shrink-0 ml-2">
                            <div className="w-20 h-24 rounded-lg overflow-hidden">
                              <img
                                src={post.imageUrls[post.currentImageIndex || 0]}
                                alt={post.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Comment Button and Comments (mobile) */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCommentInput((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }));
                          if (!commentsMap[post.id]) fetchComments(post.id);
                        }}
                        className="inline-flex items-center gap-2 text-green-700 font-semibold mt-2"
                      >
                        <MessageCircle size={18} /> Comment
                      </motion.button>
                      {showCommentInput[post.id] && (
                        <div className="mt-2 space-y-2">
                          {(commentsMap[post.id] || []).map((c) => (
                            <div
                              key={c.id}
                              className="flex gap-2 items-center text-gray-700"
                            >
                              <img
                                src={commentAvatars[c.author.id] || "/default-avatar.png"}
                                alt="profile"
                                className="rounded-full w-8 h-8 object-cover border border-gray-300"
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
                              value={commentText[post.id] || ""}
                              onChange={(e) =>
                                setCommentText((prev) => ({
                                  ...prev,
                                  [post.id]: e.target.value,
                                }))
                              }
                              className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <button
                              onClick={() => sendComment(post.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 mt-10 text-xl"
            >
              No results found for <span className="font-semibold">{searchTerm}</span>
            </motion.p>
          )}
        </main>
      </div>
    </>
  );
}
