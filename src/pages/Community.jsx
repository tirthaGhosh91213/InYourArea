import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search } from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IoPersonCircleOutline } from "react-icons/io5"; // Ionicons profile image

// Helper: fetch avatar for any user ID
const fetchProfileImage = async (userId) => {
  try {
    const res = await axios.get(
      `http://localhost:8000/api/v1/user/profile/${userId}`
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


  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8000/api/v1/community",
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
  }, []);


  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/comments/community-posts/${postId}`,
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
    if (!commentText[postId])
      return toast.error("Comment cannot be empty");
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/community-posts/${postId}`,
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
                    onClick={() => handlePostClick(post.id)}
                  >
                    {/* DESKTOP+TABLET layout */}
                    <div className="hidden sm:flex items-start">
                      {/* Left: Profile Image */}
                      <div className="flex flex-col items-center px-4 py-4 flex-shrink-0">
                        <ProfileImage
                          src={authorAvatars[post.author.id]}
                          alt="author"
                          size="w-12 h-12"
                        />
                      </div>


                      {/* Center: Title, Author Name, Date, Content */}
                      <div className="flex flex-col justify-start px-4 py-4 flex-1 min-w-0">
                        {/* Title - multiline support */}
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 leading-snug break-words">
                          {post.title}
                        </h3>
                        
                        {/* Author Name and Date */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-gray-800 text-sm">
                            {post.author.firstName} {post.author.lastName}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>


                        {/* Content Summary */}
                        <span className="text-[15px] text-gray-700 mb-3">
                          {getSummary(post.content)}
                        </span>


                        {/* Comment Button */}
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


                        {/* Comments Section */}
                        {showCommentInput[post.id] && (
                          <div className="mt-3 space-y-2">
                            {(commentsMap[post.id] || []).map((c) => (
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


                      {/* Right: Post Image */}
                      {post.imageUrls && post.imageUrls.length > 0 && (
                        <div className="flex flex-col justify-center items-center px-4 py-4 flex-shrink-0">
                          <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-lg overflow-hidden">
                            <img
                              src={
                                post.imageUrls[post.currentImageIndex || 0]
                              }
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
                                                (p.currentImageIndex || 0) - 1 <
                                                0
                                                  ? p.imageUrls.length - 1
                                                  : (p.currentImageIndex || 0) -
                                                    1,
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
                                        p.id === post.id
                                          ? {
                                              ...p,
                                              currentImageIndex:
                                                (p.currentImageIndex || 0) + 1 >=
                                                p.imageUrls.length
                                                  ? 0
                                                  : (p.currentImageIndex || 0) + 1,
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
                            src={authorAvatars[post.author.id]}
                            alt="author"
                            size="w-10 h-10"
                          />
                        </div>
                        
                        {/* Title - Full multiline */}
                        <h3 className="flex-1 text-base font-bold text-gray-900 leading-snug break-words">
                          {post.title}
                        </h3>
                      </div>


                      {/* Author Name and Date */}
                      <div className="flex items-center gap-2 pl-[52px]">
                        <span className="font-semibold text-gray-800 text-sm">
                          {post.author.firstName} {post.author.lastName}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>


                      {/* Content and Image Row */}
                      <div className="flex gap-3 pl-[52px]">
                        {/* Content */}
                        <div className="flex-1">
                          <span className="text-[14px] text-gray-800">
                            {truncateWords(post.content, 15)}
                          </span>
                        </div>


                        {/* Post Image */}
                        {post.imageUrls && post.imageUrls.length > 0 && (
                          <div className="flex-shrink-0">
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


                      {/* Comment Button */}
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
                        className="inline-flex items-center gap-2 text-green-700 font-semibold pl-[52px]"
                      >
                        <MessageCircle size={18} /> Comment
                      </motion.button>


                      {/* Comments Section */}
                      {showCommentInput[post.id] && (
                        <div className="mt-2 space-y-2 pl-[52px]">
                          {(commentsMap[post.id] || []).map((c) => (
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
