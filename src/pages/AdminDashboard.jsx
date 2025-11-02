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
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BASE_API = "https://cached-nursery-kevin-advances.trycloudflare.com/api/v1";
const TABS = [
  { key: "events", label: "Events" },
  { key: "jobs", label: "Jobs" },
  { key: "community", label: "Community" },
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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/login");
  }, [navigate]);

  const fetchPending = useCallback(async (category) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${BASE_API}/${category}/pending`, {
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
      setProcessingItems(prev => new Set(prev).add(id));
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${BASE_API}/${activeTab}/${id}/${action}`,
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
      }
    } catch (error) {
      toast.error("Failed to process action");
      console.error("Action error:", error);
    } finally {
      setConfirmAction(null);
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleQuickAction = (e, id, action) => {
    e.stopPropagation(); // Prevent opening the modal when clicking buttons
    setConfirmAction({ id, action, fromModal: false });
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const closeFullImage = () => {
    setFullImage(null);
  };

  // Add keyboard event listener for closing image
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (fullImage) {
          closeFullImage();
        } else if (selectedItem) {
          setSelectedItem(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullImage, selectedItem]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
     <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6 gap-3 sm:gap-0">
  {/* Back button */}
  <motion.button
    onClick={() => navigate(-1)}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center text-gray-700 hover:text-green-700 transition-colors duration-200 order-2 sm:order-1"
  >
    <ArrowLeftCircle size={26} className="mr-2" />
    <span className="hidden sm:inline font-semibold">Back</span>
  </motion.button>

  {/* Dashboard title */}
  <h1 className="text-xl sm:text-2xl font-bold text-center text-green-800 order-1 sm:order-2">
    Admin Dashboard — Pending Approvals
  </h1>

  {/* Buttons: Profile + Logout */}
  <div className="flex justify-center sm:justify-end items-center gap-3 order-3 flex-wrap">
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
            <Loader2 className="animate-spin text-green-600 w-10 h-10" />
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
                  {/* Main Content - Clickable Area */}
                  <div
                    onClick={() => setSelectedItem(item)}
                    className="cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 flex flex-wrap gap-4">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        {activeTab === "jobs" && (
                          <>
                            <span>
                              • Deadline: {item.applicationDeadline ? new Date(item.applicationDeadline).toLocaleDateString() : "N/A"}
                            </span>
                            <span>• Salary: ₹{item.salaryRange || "N/A"}</span>
                          </>
                        )}
                        {activeTab === "events" && (
                          <>
                            <span>• Location: {item.location || "N/A"}</span>
                            <span>
                              • Date: {item.eventDate ? new Date(item.eventDate).toLocaleDateString() : "N/A"}
                            </span>
                          </>
                        )}
                        {activeTab === "communityPosts" && (
                          <span>• Location: {item.location || "N/A"}</span>
                        )}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {item.description.length > 100 
                            ? `${item.description.substring(0, 100)}...` 
                            : item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Non-clickable Area */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex gap-3">
                      <motion.button
                        onClick={(e) => handleQuickAction(e, item.id, "approve")}
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
                      onClick={() => setSelectedItem(item)}
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
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-green-700">
                  {selectedItem.title}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-1"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold">Description:</span> {selectedItem.description || "N/A"}
                </p>

                {activeTab === "events" && (
                  <>
                    <p className="text-gray-700">
                      <span className="font-semibold">Location:</span> {selectedItem.location || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Event Date:</span>{" "}
                      {selectedItem.eventDate ? new Date(selectedItem.eventDate).toLocaleString() : "N/A"}
                    </p>
                  </>
                )}

                {activeTab === "jobs" && (
                  <>
                    <p className="text-gray-700">
                      <span className="font-semibold">Application Deadline:</span>{" "}
                      {selectedItem.applicationDeadline ? new Date(selectedItem.applicationDeadline).toLocaleDateString() : "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Salary Range:</span> ₹{selectedItem.salaryRange || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Company:</span> {selectedItem.company || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Job Type:</span> {selectedItem.jobType || "N/A"}
                    </p>
                  </>
                )}

                {activeTab === "communityPosts" && (
                  <>
                    <p className="text-gray-700">
                      <span className="font-semibold">Location:</span> {selectedItem.location || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Content:</span> {selectedItem.content || "N/A"}
                    </p>
                  </>
                )}

                <p className="text-gray-700">
                  <span className="font-semibold">Created:</span>{" "}
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-green-700 mb-3">Images</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedItem.imageUrls && selectedItem.imageUrls.length > 0 ? (
                    selectedItem.imageUrls.map((img, i) => (
                      <motion.img
                        key={i}
                        src={img}
                        alt={`Post image ${i + 1}`}
                        onClick={() => setFullImage(img)}
                        whileHover={{ scale: 1.05 }}
                        className="w-20 h-20 rounded-lg object-cover cursor-pointer border-2 border-green-300 hover:border-green-500 transition-all duration-200 shadow-sm"
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <ImageIcon size={16} /> No images uploaded
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
                <motion.button
                  onClick={() =>
                    setConfirmAction({ id: selectedItem.id, action: "approve", fromModal: true })
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
                    setConfirmAction({ id: selectedItem.id, action: "reject", fromModal: true })
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
            {/* Close Button */}
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
            
            {/* Instruction text */}
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
              <AlertTriangle className="text-yellow-500 mx-auto mb-3" size={40} />
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
                    handleAction(confirmAction.id, confirmAction.action, confirmAction.fromModal)
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
