import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  User,
  Calendar,
  Briefcase,
  FileText,
  Edit2,
  Save,
  Trash2,
  Eye,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role") || "user"; // 'user' or 'admin'
  const headers = { Authorization: `Bearer ${token}` };

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState("events");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);

  const [modalContent, setModalContent] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    if (!token) navigate("/login"); // redirect if no token
    else fetchAll();
    // eslint-disable-next-line
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchProfile(), fetchStats(), fetchContent(), fetchComments()]);
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/profile", { headers });
      setProfile(res.data.data);
      setFormData({
        firstName: res.data.data.firstName || "",
        lastName: res.data.data.lastName || "",
      });
    } catch {
      toast.error("Failed to fetch profile");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/stats", { headers });
      setStats(res.data.data);
    } catch {
      toast.error("Failed to fetch stats");
    }
  };

  const fetchContent = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/my-content", { headers });
      setContent(res.data.data);
    } catch {
      toast.error("Failed to fetch content");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/my-comments", { headers });
      setComments(res.data.data || []);
    } catch {
      setComments([]);
    }
  };

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.put("http://localhost:8000/api/v1/user/profile", formData, { headers });
      setProfile(res.data.data);
      setEditMode(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (type, id) => {
    try {
      let url = "";
      if (type === "events") url = `http://localhost:8000/api/v1/events/${id}`;
      if (type === "jobs") url = `http://localhost:8000/api/v1/jobs/${id}`;
      if (type === "community") url = `http://localhost:8000/api/v1/community/${id}`;
      if (type === "localNews") url = `http://localhost:8000/api/v1/district-news/${id}`;
      const res = await axios.get(url, { headers });
      setModalContent(res.data.data);
      setModalType(type);
    } catch {
      toast.error("Failed to fetch details");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      let url = "";
      if (type === "events") url = `http://localhost:8000/api/v1/events/${id}`;
      if (type === "jobs") url = `http://localhost:8000/api/v1/jobs/${id}`;
      if (type === "community") url = `http://localhost:8000/api/v1/community/${id}`;
      if (type === "localNews") url = `http://localhost:8000/api/v1/district-news/${id}`;
      await axios.delete(url, { headers });
      toast.success("Deleted successfully");
      await fetchContent();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateNews = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:8000/api/v1/district-news/${id}`, updatedData, { headers });
      toast.success("Local News updated successfully");
      setModalContent(null);
      fetchContent();
    } catch {
      toast.error("Failed to update Local News");
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const s = status.toLowerCase();
    if (s === "approved") return "bg-green-100 text-green-700";
    if (s === "pending") return "bg-yellow-100 text-yellow-700";
    if (s === "rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const filteredContent = () => {
    if (!content) return [];
    if (activeTab === "events") return content.events || [];
    if (activeTab === "jobs") return content.jobs || [];
    if (activeTab === "community") return content.communityPosts || [];
    if (activeTab === "comments") return comments || [];
    if (activeTab === "localNews") return content.districtNews || [];
    return [];
  };

  if (!profile || !stats || !content)
    return <div className="text-center mt-10 text-gray-500">Loading dashboard...</div>;

  const tabs = [
    { key: "events", label: "Events", icon: Calendar },
    { key: "jobs", label: "Jobs", icon: Briefcase },
    { key: "community", label: "Community", icon: FileText },
  ];

  if (role === "admin") tabs.push({ key: "localNews", label: "Local News", icon: FileText });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
      {/* Header + Logout */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-2xl p-6 flex flex-col md:flex-row gap-6"
      >
        <div className="bg-indigo-600/10 rounded-full p-3">
          <User size={56} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          {!editMode ? (
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{profile.fullName}</h2>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg"
              >
                <Edit2 size={16} /> Edit
              </button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
                >
                  <Save size={16} /> {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-100 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[ 
          { title: "District News", value: stats.totalDistrictNews },
          { title: "Events", value: stats.totalEvents },
          { title: "Jobs", value: stats.totalJobs },
          { title: "Community", value: stats.totalCommunityPosts },
          { title: "Comments", value: stats.totalComments },
          { title: "Total", value: stats.totalContent },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-xs text-gray-400">{s.title}</p>
            <p className="text-xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                active ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-100 text-gray-700"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {filteredContent().length === 0 ? (
          <div className="text-center text-gray-400">No data found</div>
        ) : (
          filteredContent().map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}
                  >
                    {item.status || "UNKNOWN"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-7">
                  {activeTab === "jobs" ? (
                    <>
                      <span>• Deadline: {item.applicationDeadline || "N/A"}</span>
                      <span>• Salary Range: ₹{item.salaryRange || "N/A"}</span>
                    </>
                  ) : activeTab === "events" ? (
                    <span>• Date: {item.eventDate || "N/A"}</span>
                  ) : activeTab === "community" ? (
                    <span>• Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                  ) : activeTab === "localNews" ? (
                    <span>• Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                  ) : (
                    ""
                  )}
                </p>

                {activeTab !== "comments" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleView(activeTab, item.id)}
                      className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg"
                    >
                      <Eye size={14} /> View Details
                    </button>

                    {activeTab === "localNews" && role === "admin" ? (
                      <>
                        <button
                          onClick={() => handleUpdateNews(item.id, item)}
                          className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg"
                        >
                          <Save size={14} /> Update
                        </button>
                        <button
                          onClick={() => handleDelete(activeTab, item.id)}
                          className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-lg"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDelete(activeTab, item.id)}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-lg"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal for Details */}
      <AnimatePresence>
        {modalContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] p-6 relative"
            >
              <button
                onClick={() => setModalContent(null)}
                className="absolute right-3 top-3 bg-gray-200 rounded-full p-2 text-gray-600 hover:bg-gray-300"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{modalContent.title}</h2>
              <p className="text-gray-600 mb-4">{modalContent.description}</p>

              {/* Images */}
              <div className="mt-5">
                <h3 className="font-semibold text-gray-800 mb-2">Images</h3>
                {modalContent.imageUrls?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {modalContent.imageUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Post ${i}`}
                        className="rounded-lg w-full h-40 object-cover hover:scale-105 transition cursor-pointer"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No images available</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
