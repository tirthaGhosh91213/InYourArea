import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  ArrowLeftCircle,
  LogOut,
  Image as ImageIcon,
  X,
  Check,
  Home,
  MapPin,
  Briefcase,
  DollarSign,
  Link as LinkIcon,
  Clock,
  Building,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const BASE_API = "https://api.jharkhandbiharupdates.com/api/v1";
const TABS = [
  { key: "events", label: "Events" },
  { key: "jobs", label: "Jobs" },
  { key: "community", label: "Community" },
  { key: "properties", label: "Property" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [fullImage, setFullImage] = useState(null);
  const [processingItems, setProcessingItems] = useState(new Set());
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/login");
  }, [navigate]);

  const fetchPending = useCallback(async (category) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      let endpoint =
        category === "properties"
          ? `${BASE_API}/properties/pending`
          : `${BASE_API}/${category}/pending`;
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.data || []);
    } catch {
      toast.error("Failed to fetch pending items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending(activeTab);
  }, [activeTab, fetchPending]);

  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => {
        setPopupMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  const handleAction = async (id, action, fromModal = false) => {
    try {
      setProcessingItems((prev) => new Set(prev).add(id));
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${BASE_API}/${
          activeTab === "properties" ? "properties" : activeTab
        }/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((prev) => prev.filter((it) => it.id !== id));
      setPopupMessage(
        `${activeTab.slice(0, -1).toUpperCase()} ${
          action === "approve" ? "Approved ✅" : "Rejected ❌"
        }`
      );
      if (fromModal) {
        setSelectedItem(null);
        setPropertyDetails(null);
      }
    } catch (error) {
      toast.error("Failed to process action");
      console.error("Action error:", error);
    } finally {
      setConfirmAction(null);
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleQuickAction = (e, id, action) => {
    e.stopPropagation();
    setConfirmAction({ id, action, fromModal: false });
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const viewDetails = async (item) => {
    if (activeTab === "properties") {
      setLoadingDetails(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${BASE_API}/properties/${item.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPropertyDetails(res.data.data);
        setSelectedItem(item);
      } catch {
        toast.error("Failed to fetch property details.");
        setPropertyDetails(null);
        setSelectedItem(null);
      } finally {
        setLoadingDetails(false);
      }
    } else {
      setSelectedItem(item);
    }
  };

  const closeFullImage = () => {
    setFullImage(null);
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last;
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-red-600",
      "bg-yellow-600",
      "bg-teal-600",
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (fullImage) {
          closeFullImage();
        } else if (selectedItem) {
          setSelectedItem(null);
          setPropertyDetails(null);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullImage, selectedItem]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6 gap-3 sm:gap-0">
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center text-gray-700 hover:text-green-700 transition-colors duration-200 order-2 sm:order-1"
        >
          <ArrowLeftCircle size={26} className="mr-2" />
          <span className="hidden sm:inline font-semibold">Back</span>
        </motion.button>
        <h1 className="text-xl sm:text-2xl font-bold text-center text-green-800 order-1 sm:order-2">
          Admin Dashboard — Pending Approvals
        </h1>
        <div className="flex justify-center sm:justify-end items-center gap-3 order-3 flex-wrap">
          <motion.button
            onClick={() => navigate("/add")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-blue-200 hover:bg-blue-300 text-blue-800 px-4 py-2 rounded-lg shadow-sm font-medium transition-all duration-200"
          >
            <ImageIcon size={18} className="mr-2" />
            ADs
          </motion.button>

          <motion.button
            onClick={() => navigate("/user-dashboard")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-green-200 hover:bg-green-300 text-green-800 px-4 py-2 rounded-lg shadow-sm font-medium transition-all duration-200"
          >
            <User size={18} className="mr-2" /> Profile
          </motion.button>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-red-200 hover:bg-red-300 text-red-800 px-3 py-2 rounded-lg shadow-sm font-medium transition-all duration-200"
          >
            <LogOut size={18} className="mr-1" /> Logout
          </motion.button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex justify-center gap-3 sm:gap-6 bg-white py-3 border-b border-gray-200">
        {TABS.map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 shadow-sm ${
              activeTab === tab.key
                ? "bg-green-600 text-white"
                : "bg-gray-100 hover:bg-green-100 text-gray-700"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-lg">
            No pending {activeTab} posts 🎉
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`mb-4 rounded-xl p-4 sm:p-5 shadow-md border transition-all duration-300 hover:shadow-lg ${
                  index % 2 === 0
                    ? "bg-green-50 hover:bg-green-100 border-green-200"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div
                    onClick={() => viewDetails(item)}
                    className="cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="text-lg font-semibold text-green-800 mb-1 break-words">
                        {item.title}
                      </h3>
                      {activeTab === "properties" ? (
                        <div className="text-sm text-gray-600 flex flex-wrap gap-3">
                          <span className="flex items-center">
                            <Home size={14} className="mr-1" />
                            {item.propertyType} • {item.totalArea} sqft • ₹
                            {item.price}
                          </span>
                          <span>Status: {item.propertyStatus}</span>
                          <span className="break-all">
                            Location: {item.city}, {item.state}
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 flex flex-wrap gap-4">
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </p>
                          {(item.description || item.content) && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2 break-words overflow-hidden">
                              {(item.description || item.content).length > 100
                                ? `${(item.description || item.content).substring(0, 100)}...`
                                : item.description || item.content}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex gap-3">
                      <motion.button
                        onClick={(e) =>
                          handleQuickAction(e, item.id, "approve")
                        }
                        disabled={processingItems.has(item.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {processingItems.has(item.id) ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Approve
                      </motion.button>
                      <motion.button
                        onClick={(e) => handleQuickAction(e, item.id, "reject")}
                        disabled={processingItems.has(item.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {processingItems.has(item.id) ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <X size={16} />
                        )}
                        Reject
                      </motion.button>
                    </div>
                    <button
                      onClick={() => viewDetails(item)}
                      className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedItem(null);
                setPropertyDetails(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-4 gap-4">
                <h2 className="text-xl font-semibold text-green-700 break-words flex-1 min-w-0">
                  {selectedItem.title}
                </h2>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setPropertyDetails(null);
                  }}
                  className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-1 flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              {loadingDetails && activeTab === "properties" ? (
                <div className="flex items-center justify-center h-32">
                  <Loader />
                </div>
              ) : (
                <>
                  {/* JOBS TAB DETAILS */}
                  {activeTab === "jobs" && (
                    <div className="space-y-4">
                      {/* Images Section */}
                      {selectedItem.imageUrls &&
                        selectedItem.imageUrls.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              Images
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedItem.imageUrls.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`Job ${i + 1}`}
                                  className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setFullImage(img)}
                                  loading="lazy"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2 min-w-0">
                          <Briefcase
                            size={18}
                            className="text-green-600 mt-1 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Company</p>
                            <p className="font-semibold text-gray-800 break-words">
                              {selectedItem.company || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-semibold text-gray-800 break-words">
                              {selectedItem.location || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <DollarSign
                            size={18}
                            className="text-green-600 mt-1 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">
                              Salary Range
                            </p>
                            <p className="font-semibold text-gray-800 break-words">
                              {selectedItem.salaryRange || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <Clock size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">
                              Application Deadline
                            </p>
                            <p className="font-semibold text-gray-800 break-words">
                              {selectedItem.applicationDeadline
                                ? new Date(
                                    selectedItem.applicationDeadline
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedItem.reglink && (
                        <div className="flex items-start gap-2 mt-4 min-w-0">
                          <LinkIcon size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">
                              Registration Link
                            </p>
                            <a
                              href={selectedItem.reglink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-all overflow-wrap-anywhere"
                            >
                              {selectedItem.reglink}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-1">
                          Description
                        </p>
                        <p className="text-gray-700 break-words whitespace-pre-wrap overflow-wrap-anywhere">
                          {selectedItem.description || "N/A"}
                        </p>
                      </div>

                      {selectedItem.author && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-gray-500 mb-2">
                            Posted By
                          </p>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex-shrink-0 ${getAvatarColor(
                                selectedItem.author.firstName
                              )} flex items-center justify-center text-white font-semibold text-sm`}
                            >
                              {getInitials(
                                selectedItem.author.firstName,
                                selectedItem.author.lastName
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-800 break-words">
                                {selectedItem.author.firstName}{" "}
                                {selectedItem.author.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedItem.author.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">Created At</p>
                        <p className="text-gray-700">
                          {new Date(selectedItem.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* EVENTS TAB DETAILS */}
                  {activeTab === "events" && (
                    <div className="space-y-4">
                      {/* Images Section */}
                      {selectedItem.imageUrls &&
                        selectedItem.imageUrls.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              Images
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedItem.imageUrls.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`Event ${i + 1}`}
                                  className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setFullImage(img)}
                                  loading="lazy"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2 min-w-0">
                          <Calendar size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Event Date</p>
                            <p className="font-semibold text-gray-800 break-words">
                              {selectedItem.eventDate
                                ? new Date(
                                    selectedItem.eventDate
                                  ).toLocaleString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-semibold text-gray-800 break-words">
                              {selectedItem.location || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedItem.reglink && (
                        <div className="flex items-start gap-2 mt-4 min-w-0">
                          <LinkIcon size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">
                              Registration Link
                            </p>
                            <a
                              href={selectedItem.reglink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-all overflow-wrap-anywhere"
                            >
                              {selectedItem.reglink}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-1">
                          Description
                        </p>
                        <p className="text-gray-700 break-words whitespace-pre-wrap overflow-wrap-anywhere">
                          {selectedItem.description || "N/A"}
                        </p>
                      </div>

                      {selectedItem.author && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-gray-500 mb-2">
                            Posted By
                          </p>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex-shrink-0 ${getAvatarColor(
                                selectedItem.author.firstName
                              )} flex items-center justify-center text-white font-semibold text-sm`}
                            >
                              {getInitials(
                                selectedItem.author.firstName,
                                selectedItem.author.lastName
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-800 break-words">
                                {selectedItem.author.firstName}{" "}
                                {selectedItem.author.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedItem.author.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">Created At</p>
                        <p className="text-gray-700">
                          {new Date(selectedItem.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* COMMUNITY TAB DETAILS */}
                  {activeTab === "community" && (
                    <div className="space-y-4">
                      {/* Images Section */}
                      {selectedItem.imageUrls &&
                        selectedItem.imageUrls.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              Images
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedItem.imageUrls.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`Community ${i + 1}`}
                                  className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setFullImage(img)}
                                  loading="lazy"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="flex items-start gap-2 min-w-0">
                        <MapPin size={18} className="text-green-600 mt-1 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-semibold text-gray-800 break-words">
                            {selectedItem.location || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-1">Content</p>
                        <p className="text-gray-700 break-words whitespace-pre-wrap overflow-wrap-anywhere">
                          {selectedItem.content || "N/A"}
                        </p>
                      </div>

                      {selectedItem.author && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-gray-500 mb-2">
                            Posted By
                          </p>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex-shrink-0 ${getAvatarColor(
                                selectedItem.author.firstName
                              )} flex items-center justify-center text-white font-semibold text-sm`}
                            >
                              {getInitials(
                                selectedItem.author.firstName,
                                selectedItem.author.lastName
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-800 break-words">
                                {selectedItem.author.firstName}{" "}
                                {selectedItem.author.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedItem.author.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">Created At</p>
                        <p className="text-gray-700">
                          {new Date(selectedItem.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PROPERTY TAB DETAILS */}
                  {activeTab === "properties" && propertyDetails && (
                    <div className="space-y-4">
                      {/* Images Section */}
                      {propertyDetails.imageUrls &&
                        propertyDetails.imageUrls.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              Property Images
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {propertyDetails.imageUrls.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`Property ${i + 1}`}
                                  className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setFullImage(img)}
                                  loading="lazy"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2 min-w-0">
                          <Home size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">
                              Property Type
                            </p>
                            <p className="font-semibold text-gray-800 break-words">
                              {propertyDetails.propertyType || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <Building size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">
                              Property Status
                            </p>
                            <p className="font-semibold text-gray-800 break-words">
                              {propertyDetails.propertyStatus || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <DollarSign
                            size={18}
                            className="text-green-600 mt-1 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Price</p>
                            <p className="font-semibold text-gray-800 break-words">
                              ₹{" "}
                              {propertyDetails.price
                                ? (+propertyDetails.price / 100000).toLocaleString(
                                    "en-IN"
                                  )
                                : "N/A"}{" "}
                              Lakhs
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <Home size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Total Area</p>
                            <p className="font-semibold text-gray-800 break-words">
                              {propertyDetails.totalArea || "N/A"} sq.ft
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">District</p>
                            <p className="font-semibold text-gray-800 break-words">
                              {propertyDetails.district || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">City</p>
                            <p className="font-semibold text-gray-800 break-words">
                              {propertyDetails.city || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">State</p>
                            <p className="font-semibold text-gray-800 break-words">
                              {propertyDetails.state || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 min-w-0 md:col-span-2">
                          <MapPin size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="font-semibold text-gray-800 break-words">
                              {propertyDetails.address || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-1">
                          Description
                        </p>
                        <p className="text-gray-700 break-words whitespace-pre-wrap overflow-wrap-anywhere">
                          {propertyDetails.description || "N/A"}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-2">
                          Contact Information
                        </p>
                        <div className="space-y-1">
                          <p className="text-gray-700 break-words">
                            <span className="font-semibold">Name:</span>{" "}
                            {propertyDetails.contactName || "N/A"}
                          </p>
                          <p className="text-gray-700 break-all">
                            <span className="font-semibold">Email:</span>{" "}
                            {propertyDetails.contactEmail || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">Created At</p>
                        <p className="text-gray-700">
                          {new Date(propertyDetails.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Modal Action Buttons */}
              <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
                <motion.button
                  onClick={() =>
                    setConfirmAction({
                      id: selectedItem.id,
                      action: "approve",
                      fromModal: true,
                    })
                  }
                  disabled={processingItems.has(selectedItem.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
                >
                  {processingItems.has(selectedItem.id) ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Approve
                </motion.button>
                <motion.button
                  onClick={() =>
                    setConfirmAction({
                      id: selectedItem.id,
                      action: "reject",
                      fromModal: true,
                    })
                  }
                  disabled={processingItems.has(selectedItem.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
                >
                  {processingItems.has(selectedItem.id) ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <XCircle size={18} />
                  )}
                  Reject
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Image Preview with Close Button */}
      <AnimatePresence>
        {fullImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFullImage}
          >
            <motion.button
              onClick={closeFullImage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg"
              aria-label="Close image preview"
            >
              <X size={24} />
            </motion.button>
            <motion.img
              src={fullImage}
              alt="Full size preview"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-[90%] max-h-[90%] rounded-lg shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              Click outside or press ESC to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center border border-green-200"
            >
              <AlertTriangle
                className="text-yellow-500 mx-auto mb-3"
                size={40}
              />
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Confirm Action
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to{" "}
                <span
                  className={`font-semibold ${
                    confirmAction.action === "approve"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {confirmAction.action}
                </span>{" "}
                this {activeTab.slice(0, -1)}?
              </p>
              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={() =>
                    handleAction(
                      confirmAction.id,
                      confirmAction.action,
                      confirmAction.fromModal
                    )
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200 ${
                    confirmAction.action === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  Yes, {confirmAction.action}
                </motion.button>
                <motion.button
                  onClick={() => setConfirmAction(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700 transition-all duration-200"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success/Error Popup Notification */}
      <AnimatePresence>
        {popupMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed right-6 bottom-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50 max-w-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span className="font-medium">{popupMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
