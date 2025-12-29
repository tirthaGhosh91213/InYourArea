import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Loader from "./Loader.jsx";
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
  AlertTriangle,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  Camera,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Home,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const headers = { Authorization: `Bearer ${token}` };

  // State variables
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState("events");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);

  // Image, crop, and modal state
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editNewsData, setEditNewsData] = useState({ title: "", content: "" });
  const [editNewsId, setEditNewsId] = useState(null);

  // Delete modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    type: null,
    id: null,
    title: "",
  });
  const [deletingItem, setDeletingItem] = useState(false);

  // ✅ Property Status Update Modal
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [newPropertyStatus, setNewPropertyStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
    else fetchAll();
    // eslint-disable-next-line
  }, [token]);

  const fetchAll = async () => {
    await Promise.all([
      fetchProfile(),
      fetchStats(),
      fetchContent(),
      fetchComments(),
    ]);
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get("https://api.jharkhandbiharupdates.com/api/v1/user/profile", {
        headers,
      });
      setProfile(res.data.data);
      setProfileImageUrl(res.data.data.profileImageUrl);
      setFormData({
        firstName: res.data.data.firstName,
        lastName: res.data.data.lastName,
      });
    } catch (error) {
      toast.error("Failed to fetch profile");
      console.error("Profile error:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("https://api.jharkhandbiharupdates.com/api/v1/user/stats", {
        headers,
      });
      setStats(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch stats");
      console.error("Stats error:", error);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await axios.get(
        "https://api.jharkhandbiharupdates.com/api/v1/user/my-content",
        { headers }
      );
      setContent(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch content");
      console.error("Content error:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        "https://api.jharkhandbiharupdates.com/api/v1/user/my-comments",
        { headers }
      );
      setComments(res.data.data);
    } catch (error) {
      setComments([]);
      console.error("Comments error:", error);
    }
  };

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        "https://api.jharkhandbiharupdates.com/api/v1/user/profile",
        formData,
        { headers }
      );
      setProfile(res.data.data);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Image size should be less than 20MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setScale(1);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Crop/canvas util
  const getCroppedImage = () =>
    new Promise((resolve) => {
      const canvas = canvasRef.current;
      const image = imageRef.current;
      if (!canvas || !image) return resolve(null);
      const ctx = canvas.getContext("2d");
      const size = 400;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      let drawWidth, drawHeight;
      if (aspectRatio > 1) {
        drawHeight = size;
        drawWidth = size * aspectRatio;
      } else {
        drawWidth = size;
        drawHeight = size / aspectRatio;
      }
      ctx.drawImage(
        image,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      ctx.restore();
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
    });

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }
    setUploadingImage(true);
    try {
      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) {
        toast.error("Failed to process image");
        setUploadingImage(false);
        return;
      }
      const formDataObj = new FormData();
      formDataObj.append("image", croppedBlob, "profile.jpg");
      await axios.put(
        "https://api.jharkhandbiharupdates.com/api/v1/user/profile/image",
        formDataObj,
        {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Profile image updated successfully!");
      setShowImageUpload(false);
      setSelectedImage(null);
      setImagePreview(null);
      setScale(1);
      setRotation(0);
      const profileRes = await axios.get(
        "https://api.jharkhandbiharupdates.com/api/v1/user/profile",
        { headers }
      );
      const newImageUrl =
        profileRes.data.data.profileImageUrl + "?t=" + Date.now();
      setProfileImageUrl(newImageUrl);
      setProfile(profileRes.data.data);
    } catch (error) {
      setUploadingImage(false);
      toast.error("Failed to upload image");
      console.error("Image upload error:", error);
    }
    setUploadingImage(false);
  };

  const handleCancelImageUpload = () => {
    setShowImageUpload(false);
    setSelectedImage(null);
    setImagePreview(null);
    setScale(1);
    setRotation(0);
  };

  const handleViewDetails = (type, id) => {
    if (type === "events") {
      navigate(`/events/${id}`);
    } else if (type === "jobs") {
      navigate(`/jobs/${id}`);
    } else if (type === "community") {
      navigate(`/community/${id}`);
    } else if (type === "localNews") {
      navigate(`/statenews/details/${id}`);
    } else if (type === "properties") {
      navigate(`/properties/${id}`);
    }
  };

  const handleDeleteConfirm = (type, id, title) => {
    setDeleteTarget({ type, id, title });
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    const { type, id } = deleteTarget;
    setDeletingItem(true);
    try {
      let url = "";
      if (type === "events") url = `https://api.jharkhandbiharupdates.com/api/v1/events/${id}`;
      if (type === "jobs") url = `https://api.jharkhandbiharupdates.com/api/v1/jobs/${id}`;
      if (type === "community")
        url = `https://api.jharkhandbiharupdates.com/api/v1/community/${id}`;
      if (type === "localNews")
        url = `https://api.jharkhandbiharupdates.com/api/v1/state-news/${id}`;
      if (type === "properties")
        url = `https://api.jharkhandbiharupdates.com/api/v1/properties/${id}`;
      
      await axios.delete(url, { headers });
      toast.success("Deleted successfully!");
      setDeleteConfirmOpen(false);
      await fetchContent();
      await fetchStats();
    } catch (error) {
      toast.error("Failed to delete");
      console.error("Delete error:", error);
    } finally {
      setDeletingItem(false);
    }
  };

  const handleOpenEditModal = (item) => {
    setEditNewsId(item.id);
    setEditNewsData({ title: item.title, content: item.content });
    setEditModalOpen(true);
  };

  const handleEditNewsChange = (e) =>
    setEditNewsData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdateNews = async () => {
    setLoading(true);
    try {
      await axios.put(
        `https://api.jharkhandbiharupdates.com/api/v1/state-news/${editNewsId}`,
        editNewsData,
        { headers }
      );
      toast.success("Local News updated successfully!");
      setEditModalOpen(false);
      await fetchContent();
    } catch (error) {
      toast.error("Failed to update Local News");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Open Property Status Update Modal - Allow Toggle/Revert
  const handleOpenStatusUpdateModal = (property) => {
    setSelectedProperty(property);
    // Set the toggle status based on current status
    if (property.propertyStatus === "FOR_SALE") {
      setNewPropertyStatus("SOLD");
    } else if (property.propertyStatus === "SOLD") {
      setNewPropertyStatus("FOR_SALE"); // Allow revert
    } else if (property.propertyStatus === "FOR_RENT") {
      setNewPropertyStatus("RENTED");
    } else if (property.propertyStatus === "RENTED") {
      setNewPropertyStatus("FOR_RENT"); // Allow revert
    } else {
      setNewPropertyStatus(property.propertyStatus);
    }
    setStatusUpdateModalOpen(true);
  };

  // ✅ Handle Property Status Update
  const handlePropertyStatusUpdate = async () => {
    if (!selectedProperty || !newPropertyStatus) {
      toast.error("Please select a status");
      return;
    }

    if (newPropertyStatus === selectedProperty.propertyStatus) {
      toast.info("Status is already set to " + newPropertyStatus);
      setStatusUpdateModalOpen(false);
      return;
    }

    setUpdatingStatus(true);
    try {
      await axios.put(
        `https://api.jharkhandbiharupdates.com/api/v1/properties/${selectedProperty.id}/status?status=${newPropertyStatus}`,
        {},
        { headers }
      );
      toast.success("Property status updated successfully!");
      setStatusUpdateModalOpen(false);
      setSelectedProperty(null);
      setNewPropertyStatus("");
      await fetchContent();
      await fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to update property status";
      toast.error(errorMessage);
      console.error("Status update error:", error);
      console.error("Error response:", error.response?.data);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleImageClick = (url, e) => {
    e.stopPropagation();
    setLightboxImage(url);
  };
  const closeLightbox = () => setLightboxImage(null);

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const s = status.toLowerCase();
    if (s === "approved") return "bg-green-100 text-green-700";
    if (s === "pending") return "bg-yellow-100 text-yellow-700";
    if (s === "rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  // ✅ Get Property Status Badge Color
  const getPropertyStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const s = status.toUpperCase();
    if (s === "FOR_SALE") return "bg-blue-100 text-blue-700";
    if (s === "FOR_RENT") return "bg-purple-100 text-purple-700";
    if (s === "SOLD") return "bg-green-100 text-green-700";
    if (s === "RENTED") return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-700";
  };

  // ✅ Format Property Status for Display
  const formatPropertyStatus = (status) => {
    if (!status) return "Unknown";
    return status.replace(/_/g, " ");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const filteredContent = (() => {
    if (!content) return [];
    if (activeTab === "events") return content.events;
    if (activeTab === "jobs") return content.jobs;
    if (activeTab === "community") return content.communityPosts;
    if (activeTab === "comments") return comments;
    if (activeTab === "localNews") return content.stateNews;
    if (activeTab === "properties") return content.properties || [];
    return [];
  })();

  const tabs = [
    { key: "events", label: "Events", icon: Calendar },
    { key: "jobs", label: "Jobs", icon: Briefcase },
    { key: "community", label: "Community", icon: FileText },
    { key: "properties", label: "Properties", icon: Home },
  ];
  if (role === "admin")
    tabs.push({ key: "localNews", label: "State News", icon: FileText });

  if (!profile || !stats || !content) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-64">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
      {/* Header + Logout */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
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
        {/* Profile Image + Edit */}
        <div className="relative group">
          <div className="rounded-full p-0.5 w-20 h-20 flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-400 to-green-600">
            <div className="bg-white rounded-full w-full h-full flex items-center justify-center overflow-hidden">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User size={56} className="text-indigo-600" />
              )}
            </div>
            {!showImageUpload && (
              <button
                onClick={() => setShowImageUpload(true)}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Change profile picture"
              >
                <Camera size={24} className="text-white" />
              </button>
            )}
          </div>
        </div>
        {/* Display or edit profile info */}
        <div className="flex-1">
          {!editMode ? (
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {profile.fullName}
                </h2>
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
            <div className="flex flex-col md:flex-row gap-3">
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                placeholder="First Name"
              />
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                placeholder="Last Name"
              />
              <div className="mt-3 flex gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
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
      <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {[
          { title: "State News", value: stats.totalStateNews },
          { title: "Events", value: stats.totalEvents },
          { title: "Jobs", value: stats.totalJobs },
          { title: "Community", value: stats.totalCommunityPosts },
          { title: "Properties", value: stats.totalProperties || 0 },
          { title: "Comments", value: stats.totalComments },
          { title: "Total", value: stats.totalContent },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-xs text-gray-400">{s.title}</p>
            <p className="text-xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          const TabIcon = tab.icon;
          return (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                active
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <TabIcon size={16} /> {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {filteredContent.length === 0 ? (
          <div className="text-center text-gray-400">No data found</div>
        ) : (
          filteredContent.map((item) => (
            <motion.div
              key={item.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  {activeTab !== "localNews" && (
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status || "UNKNOWN"}
                    </span>
                  )}
                  {activeTab === "properties" && (
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${getPropertyStatusColor(
                        item.propertyStatus
                      )}`}
                    >
                      {formatPropertyStatus(item.propertyStatus)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-7">
                  {activeTab === "jobs" && (
                    <>
                      <span>Deadline: {item.applicationDeadline || "N/A"}</span>
                      <span>Salary Range: {item.salaryRange || "N/A"}</span>
                    </>
                  )}
                  {activeTab === "events" && (
                    <span>Date: {item.eventDate || "N/A"}</span>
                  )}
                  {activeTab === "community" && (
                    <span>
                      Created: {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {activeTab === "properties" && (
                    <>
                      <span>₹{item.price?.toLocaleString() || "N/A"}</span>
                      <span>{item.city}, {item.district}</span>
                      <span>{item.propertyType}</span>
                    </>
                  )}
                  <span>
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>

              {activeTab !== "comments" && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button
                    onClick={() => handleViewDetails(activeTab, item.id)}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-100 transition"
                  >
                    <Eye size={14} /> View Details
                  </button>

                  {/* ✅ UPDATED: Always show Update Status button for properties (no condition) */}
                  {activeTab === "properties" &&
                    item.author &&
                    item.author.id === profile.id && (
                      <button
                        onClick={() => handleOpenStatusUpdateModal(item)}
                        className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100 transition"
                      >
                        <RefreshCw size={14} /> Update Status
                      </button>
                    )}

                  {activeTab === "localNews" && role === "admin" && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-100 transition"
                      >
                        <Edit2 size={14} /> Update
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteConfirm("localNews", item.id, item.title)
                        }
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}

                  {["community", "jobs", "events", "properties"].includes(activeTab) &&
                    item.author &&
                    item.author.id === profile.id && (
                      <button
                        onClick={() =>
                          handleDeleteConfirm(activeTab, item.id, item.title)
                        }
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 bg-white hover:bg-gray-200 rounded-full p-3 text-gray-800 transition z-10 shadow-lg"
              title="Close"
            >
              <X size={28} strokeWidth={2.5} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImage}
              alt="Full size"
              className="max-w-[95vw] max-h-[95vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Upload Modal */}
      <AnimatePresence>
        {showImageUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={handleCancelImageUpload}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCancelImageUpload}
                className="absolute right-3 top-3 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Update Profile Picture
              </h2>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-64 h-64 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        ref={imageRef}
                        src={imagePreview}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{
                          transform: `scale(${scale}) rotate(${rotation}deg)`,
                          transformOrigin: "center",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </div>
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <div className="w-full space-y-3 mb-4">
                      <div className="flex items-center gap-3">
                        <ZoomOut size={20} className="text-gray-600" />
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={scale}
                          onChange={(e) => setScale(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${
                              ((scale - 0.5) / 2.5) * 100
                            }%, #e5e7eb ${
                              ((scale - 0.5) / 2.5) * 100
                            }%, #e5e7eb 100%)`,
                          }}
                        />
                        <ZoomIn size={20} className="text-gray-600" />
                      </div>

                      <div className="flex items-center gap-3">
                        <RotateCw size={20} className="text-gray-600" />
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={rotation}
                          onChange={(e) =>
                            setRotation(parseInt(e.target.value))
                          }
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${
                              (rotation / 360) * 100
                            }%, #e5e7eb ${
                              (rotation / 360) * 100
                            }%, #e5e7eb 100%)`,
                          }}
                        />
                        <span className="text-sm text-gray-600 min-w-[40px]">
                          {rotation}°
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setScale(1);
                          setRotation(0);
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                      >
                        Reset
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                          setScale(1);
                          setRotation(0);
                        }}
                        className="text-sm text-red-600 hover:text-red-700 underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">
                      Click to upload your profile picture
                    </p>
                    <label className="bg-indigo-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition inline-block">
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-3">
                      Maximum file size: 5MB
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={handleCancelImageUpload}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                  disabled={uploadingImage}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImageUpload}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  disabled={!selectedImage || uploadingImage}
                >
                  <Upload size={16} />{" "}
                  {uploadingImage ? "Uploading..." : "Upload"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setEditModalOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setEditModalOpen(false)}
                className="absolute right-3 top-3 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Update Local News
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editNewsData.title}
                    onChange={handleEditNewsChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter news title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={editNewsData.content}
                    onChange={handleEditNewsChange}
                    rows={8}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter news content"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateNews}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  <Save size={16} /> {loading ? "Updating..." : "Update News"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ UPDATED: Property Status Update Modal - Allow Toggle/Revert */}
      <AnimatePresence>
        {statusUpdateModalOpen && selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => !updatingStatus && setStatusUpdateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setStatusUpdateModalOpen(false)}
                disabled={updatingStatus}
                className="absolute right-3 top-3 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition disabled:opacity-50"
              >
                ✕
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-100 rounded-full p-3">
                  <RefreshCw size={24} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Update Property Status
                </h2>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Property:</p>
                <p className="font-semibold text-gray-800 bg-gray-50 p-3 rounded-lg">
                  {selectedProperty.title}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                <span
                  className={`inline-block px-4 py-2 rounded-lg font-semibold ${getPropertyStatusColor(
                    selectedProperty.propertyStatus
                  )}`}
                >
                  {formatPropertyStatus(selectedProperty.propertyStatus)}
                </span>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select New Status:
                </label>
                <div className="space-y-3">
                  {/* ✅ FOR_SALE ↔ SOLD Toggle */}
                  {(selectedProperty.propertyStatus === "FOR_SALE" || selectedProperty.propertyStatus === "SOLD") && (
                    <>
                      {selectedProperty.propertyStatus === "FOR_SALE" && (
                        <label
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
                            newPropertyStatus === "SOLD"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="propertyStatus"
                            value="SOLD"
                            checked={newPropertyStatus === "SOLD"}
                            onChange={(e) => setNewPropertyStatus(e.target.value)}
                            className="w-5 h-5 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-3 font-medium text-gray-800">
                            Mark as SOLD
                          </span>
                        </label>
                      )}
                      
                      {selectedProperty.propertyStatus === "SOLD" && (
                        <label
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
                            newPropertyStatus === "FOR_SALE"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="propertyStatus"
                            value="FOR_SALE"
                            checked={newPropertyStatus === "FOR_SALE"}
                            onChange={(e) => setNewPropertyStatus(e.target.value)}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 font-medium text-gray-800">
                            Mark as FOR SALE (Revert)
                          </span>
                        </label>
                      )}
                    </>
                  )}

                  {/* ✅ FOR_RENT ↔ RENTED Toggle */}
                  {(selectedProperty.propertyStatus === "FOR_RENT" || selectedProperty.propertyStatus === "RENTED") && (
                    <>
                      {selectedProperty.propertyStatus === "FOR_RENT" && (
                        <label
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
                            newPropertyStatus === "RENTED"
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="propertyStatus"
                            value="RENTED"
                            checked={newPropertyStatus === "RENTED"}
                            onChange={(e) => setNewPropertyStatus(e.target.value)}
                            className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="ml-3 font-medium text-gray-800">
                            Mark as RENTED
                          </span>
                        </label>
                      )}
                      
                      {selectedProperty.propertyStatus === "RENTED" && (
                        <label
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
                            newPropertyStatus === "FOR_RENT"
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="propertyStatus"
                            value="FOR_RENT"
                            checked={newPropertyStatus === "FOR_RENT"}
                            onChange={(e) => setNewPropertyStatus(e.target.value)}
                            className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-3 font-medium text-gray-800">
                            Mark as FOR RENT (Revert)
                          </span>
                        </label>
                      )}
                    </>
                  )}

                  {/* ✅ Info message */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    {(selectedProperty.propertyStatus === "FOR_SALE" || selectedProperty.propertyStatus === "SOLD") && (
                      <p>💡 You can toggle between FOR SALE and SOLD status anytime.</p>
                    )}
                    {(selectedProperty.propertyStatus === "FOR_RENT" || selectedProperty.propertyStatus === "RENTED") && (
                      <p>💡 You can toggle between FOR RENT and RENTED status anytime.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setStatusUpdateModalOpen(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                  disabled={updatingStatus}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePropertyStatusUpdate}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} /> Update Status
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => !deletingItem && setDeleteConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Confirm Deletion
                </h2>
              </div>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this post?
              </p>
              <p className="text-sm font-semibold text-gray-800 bg-gray-50 p-3 rounded-lg mb-6">
                "{deleteTarget.title}"
              </p>
              <p className="text-sm text-red-600 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                  disabled={deletingItem}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  disabled={deletingItem}
                >
                  {deletingItem ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} /> Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
