import React, { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role") || "user";
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
  const [showFullContent, setShowFullContent] = useState(false);

  // Image lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  // Profile image states
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Image crop states
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Add state for edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editNewsData, setEditNewsData] = useState({
    title: "",
    content: "",
  });
  const [editNewsId, setEditNewsId] = useState(null);

  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null, title: "" });

  useEffect(() => {
    if (!token) navigate("/login");
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
      setProfileImageUrl(res.data.data.profileImageUrl);
      setFormData({
        firstName: res.data.data.firstName || "",
        lastName: res.data.data.lastName || "",
      });
    } catch (error) {
      toast.error("Failed to fetch profile");
      console.error("Profile error:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/stats", { headers });
      setStats(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch stats");
      console.error("Stats error:", error);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/my-content", { headers });
      setContent(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch content");
      console.error("Content error:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/my-comments", { headers });
      setComments(res.data.data || []);
    } catch (error) {
      setComments([]);
      console.error("Comments error:", error);
    }
  };

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.put("http://localhost:8000/api/v1/user/profile", formData, { headers });
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
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

  // Function to get cropped image as blob
  const getCroppedImage = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const image = imageRef.current;

      if (!canvas || !image) {
        resolve(null);
        return;
      }

      const ctx = canvas.getContext("2d");
      const size = 400; // Output size
      canvas.width = size;
      canvas.height = size;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Save context state
      ctx.save();

      // Translate to center
      ctx.translate(size / 2, size / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply scale
      ctx.scale(scale, scale);

      // Draw image centered
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      let drawWidth, drawHeight;

      if (aspectRatio > 1) {
        drawHeight = size;
        drawWidth = size * aspectRatio;
      } else {
        drawWidth = size;
        drawHeight = size / aspectRatio;
      }

      ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      // Restore context state
      ctx.restore();

      // Convert to blob
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.95);
    });
  };



  //handle image upload

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

    const formData = new FormData();
    formData.append("image", croppedBlob, "profile.jpg");

    await axios.put(
      "http://localhost:8000/api/v1/user/profile/image",
      formData,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Reset all modal states FIRST
    setUploadingImage(false);
    setShowImageUpload(false);
    setSelectedImage(null);
    setImagePreview(null);
    setScale(1);
    setRotation(0);
    
    // Show success message
    toast.success("Profile image updated successfully!");
    
    // Fetch updated profile to get new image URL
    const profileRes = await axios.get("http://localhost:8000/api/v1/user/profile", { headers });
    const newImageUrl = profileRes.data.data.profileImageUrl + `?t=${Date.now()}`;
    
    setProfileImageUrl(newImageUrl);
    setProfile(profileRes.data.data);
    
  } catch (error) {
    setUploadingImage(false);
    toast.error("Failed to upload image");
    console.error("Image upload error:", error);
  }
};












  const handleCancelImageUpload = () => {
    setShowImageUpload(false);
    setSelectedImage(null);
    setImagePreview(null);
    setScale(1);
    setRotation(0);
  };

  const handleView = async (type, id) => {
    try {
      let url = "";
      if (type === "events") url = `http://localhost:8000/api/v1/events/${id}`;
      else if (type === "jobs") url = `http://localhost:8000/api/v1/jobs/${id}`;
      else if (type === "community") url = `http://localhost:8000/api/v1/community/${id}`;
      else if (type === "localNews") url = `http://localhost:8000/api/v1/district-news/${id}`;

      const res = await axios.get(url, { headers });

      setModalContent(res.data.data);
      setModalType(type);
      setShowFullContent(false);
    } catch (error) {
      toast.error("Failed to fetch details");
      console.error("View error:", error);
    }
  };

  const handleDeleteConfirm = (type, id, title) => {
    setDeleteTarget({ type, id, title });
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    const { type, id } = deleteTarget;
    try {
      let url = "";
      if (type === "events") url = `http://localhost:8000/api/v1/events/${id}`;
      if (type === "jobs") url = `http://localhost:8000/api/v1/jobs/${id}`;
      if (type === "community") url = `http://localhost:8000/api/v1/community/${id}`;
      if (type === "localNews") url = `http://localhost:8000/api/v1/district-news/${id}`;

      await axios.delete(url, { headers });
      toast.success("Deleted successfully!");
      setDeleteConfirmOpen(false);
      await fetchContent();
    } catch (error) {
      toast.error("Failed to delete");
      console.error("Delete error:", error);
    }
  };

  const handleOpenEditModal = (item) => {
    setEditNewsId(item.id);
    setEditNewsData({
      title: item.title || "",
      content: item.content || "",
    });
    setEditModalOpen(true);
  };

  const handleEditNewsChange = (e) => {
    setEditNewsData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateNews = async () => {
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:8000/api/v1/district-news/${editNewsId}`,
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

  const truncateText = (text, wordLimit = 50) => {
    if (!text) return "";
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ");
  };

  const needsTruncation = (text, wordLimit = 50) => {
    if (!text) return false;
    const words = text.split(/\s+/);
    return words.length > wordLimit;
  };

  const handleImageClick = (url, e) => {
    e.stopPropagation();
    setLightboxImage(url);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
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
       {/* Profile Image Section */}
{/* Profile Image Section */}
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
  </div>

  {/* Hover Edit Button - only show when modal is NOT open */}
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
                  placeholder="First Name"
                />
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                  placeholder="Last Name"
                />
              </div>
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
                  <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
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
                    <>
                      <span>• District: {item.districtName || "N/A"}</span>
                      <span>• Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </>
                  ) : (
                    ""
                  )}
                </p>

                {activeTab !== "comments" && (
                  <div className="flex gap-2 mt-2">
                    {activeTab !== "localNews" && (
                      <button
                        onClick={() => handleView(activeTab, item.id)}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-100 transition"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    )}

                    {activeTab === "localNews" && role === "admin" ? (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-100 transition"
                        >
                          <Edit2 size={14} /> Update
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(activeTab, item.id, item.title)}
                          className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDeleteConfirm(activeTab, item.id, item.title)}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition"
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

      {/* Modal for View Details */}
      <AnimatePresence>
        {modalContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setModalContent(null);
              setShowFullContent(false);
            }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setModalContent(null);
                  setShowFullContent(false);
                }}
                className="absolute right-3 top-3 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition z-10"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 pr-8">{modalContent.title}</h2>

              {/* Content Section with See More functionality */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  {modalType === "localNews"
                    ? "Content"
                    : modalType === "community"
                    ? "Description"
                    : "Description"}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {showFullContent
                      ? modalType === "community"
                        ? modalContent.content || "No description available"
                        : modalType === "localNews"
                        ? modalContent.content || "No content available"
                        : modalContent.description || modalContent.content || "No content available"
                      : truncateText(
                          modalType === "community"
                            ? modalContent.content
                            : modalType === "localNews"
                            ? modalContent.content
                            : modalContent.description || modalContent.content,
                          50
                        ) || "No content available"}
                  </p>

                  {needsTruncation(
                    modalType === "community"
                      ? modalContent.content
                      : modalType === "localNews"
                      ? modalContent.content
                      : modalContent.description || modalContent.content,
                    50
                  ) && (
                    <button
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="mt-3 flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition"
                    >
                      {showFullContent ? (
                        <>
                          <ChevronUp size={16} /> See Less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} /> See More
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Location (for Community and Events) */}
              {(modalType === "community" || modalType === "events") && modalContent.location && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-indigo-600" />
                    Location
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{modalContent.location}</p>
                  </div>
                </div>
              )}

              {/* Additional Fields based on type */}
              {modalType === "localNews" && (
                <div className="mb-6 space-y-3 bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">District:</span> {modalContent.districtName || "N/A"}
                  </p>
                  {modalContent.author && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Author:</span>{" "}
                      {modalContent.author.firstName} {modalContent.author.lastName}
                      <span className="ml-2 px-2 py-0.5 bg-white rounded text-xs">
                        {modalContent.author.role}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {modalType === "events" && (
                <div className="mb-6 space-y-3 bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Event Date:</span> {modalContent.eventDate || "N/A"}
                  </p>
                  {modalContent.organizer && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Organizer:</span> {modalContent.organizer}
                    </p>
                  )}
                </div>
              )}

              {modalType === "jobs" && (
                <div className="mb-6 space-y-3 bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Company:</span> {modalContent.company || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Salary Range:</span> ₹{modalContent.salaryRange || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Application Deadline:</span>{" "}
                    {modalContent.applicationDeadline || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Location:</span> {modalContent.location || "N/A"}
                  </p>
                  {modalContent.contactEmail && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Contact:</span> {modalContent.contactEmail}
                    </p>
                  )}
                </div>
              )}

              {modalType === "community" && (
                <div className="mb-6 space-y-3 bg-green-50 p-4 rounded-lg">
                  {modalContent.author && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Posted by:</span>{" "}
                      {modalContent.author.firstName} {modalContent.author.lastName}
                      <span className="ml-2 px-2 py-0.5 bg-white rounded text-xs">
                        {modalContent.author.role}
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Status:</span>{" "}
                    <span className={`px-2 py-0.5rounded text-xs ${getStatusColor(modalContent.status)}`}>
                      {modalContent.status}
                    </span>
                  </p>
                </div>
              )}

              {/* Comments Section (for Community posts) */}
              {modalType === "community" && modalContent.comments && modalContent.comments.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MessageCircle size={18} className="text-indigo-600" />
                    Comments ({modalContent.comments.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {modalContent.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-indigo-100 rounded-full p-1">
                              <User size={14} className="text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {comment.author.firstName} {comment.author.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-white rounded">
                            {comment.author.role}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 ml-6">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images with lightbox functionality */}
              {modalContent.imageUrls && modalContent.imageUrls.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {modalContent.imageUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Post ${i + 1}`}
                        className="rounded-lg w-full h-40 object-cover cursor-pointer shadow-md hover:shadow-xl transition-shadow"
                        onClick={(e) => handleImageClick(url, e)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                <p>
                  <span className="font-semibold">Created:</span>{" "}
                  {new Date(modalContent.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                {modalContent.updatedAt && modalContent.updatedAt !== modalContent.createdAt && (
                  <p>
                    <span className="font-semibold">Last Updated:</span>{" "}
                    {new Date(modalContent.updatedAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox - Full Screen with Close Button */}
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

      {/* Image Upload Modal with Crop Functionality */}
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

              <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Profile Picture</h2>

              <div className="space-y-4">
                {/* Image Preview with Crop Controls */}
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    {/* Canvas for cropped preview */}
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

                    {/* Hidden canvas for processing */}
                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    {/* Crop Controls */}
                    <div className="w-full space-y-3 mb-4">
                      {/* Zoom Control */}
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
                            }%, #e5e7eb ${((scale - 0.5) / 2.5) * 100}%, #e5e7eb 100%)`,
                          }}
                        />
                        <ZoomIn size={20} className="text-gray-600" />
                      </div>

                      {/* Rotation Control */}
                      <div className="flex items-center gap-3">
                        <RotateCw size={20} className="text-gray-600" />
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={rotation}
                          onChange={(e) => setRotation(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${
                              (rotation / 360) * 100
                            }%, #e5e7eb ${(rotation / 360) * 100}%, #e5e7eb 100%)`,
                          }}
                        />
                        <span className="text-sm text-gray-600 min-w-[40px]">{rotation}°</span>
                      </div>
                    </div>

                    {/* Reset and Remove Buttons */}
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
                    <p className="text-gray-600 mb-4">Click to upload your profile picture</p>
                    <label className="bg-indigo-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition inline-block">
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-3">Maximum file size: 5MB</p>
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
                  <Upload size={16} /> {uploadingImage ? "Uploading..." : "Upload"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Edit Local News */}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Local News</h2>

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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirmOpen(false)}
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
                <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
              </div>

              <p className="text-gray-600 mb-2">Are you sure you want to delete this post?</p>
              <p className="text-sm font-semibold text-gray-800 bg-gray-50 p-3 rounded-lg mb-6">
                "{deleteTarget.title}"
              </p>

              <p className="text-sm text-red-600 mb-6">This action cannot be undone.</p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}