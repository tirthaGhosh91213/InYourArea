// src/pages/AdminDashboard.jsx
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
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BASE_API = "http://localhost:8000/api/v1";
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
  const navigate = useNavigate();

  // ✅ Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchPending = useCallback(
    async (category) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${BASE_API}/${category}/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(res.data.data || []);
      } catch (err) {
        toast.error("Failed to fetch pending items");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchPending(activeTab);
  }, [activeTab, fetchPending]);

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        `${BASE_API}/${activeTab}/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((prev) => prev.filter((it) => it.id !== id));
      setPopupMessage(
        `${activeTab.toUpperCase()} ${
          action === "approve" ? "Approved ✅" : "Rejected ❌"
        }`
      );
    } catch (err) {
      toast.error("Failed to process action");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-green-50 to-green-100 text-gray-800 flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-green-200 bg-white/70 backdrop-blur-sm shadow-sm">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center text-green-700 hover:text-green-800 transition"
        >
          <ArrowLeftCircle size={32} className="mr-2" />
          <span className="font-semibold hidden sm:inline">Back</span>
        </motion.button>

        {/* Title */}
        <h1 className="text-xl sm:text-3xl font-bold text-center text-gray-900 flex-1">
          Admin Dashboard — Pending Approvals
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center bg-white/50 backdrop-blur-md py-3 gap-3 border-b border-green-100">
        {TABS.map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 shadow-md ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:scale-105 hover:shadow-sm border"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-green-600 w-10 h-10" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium text-lg">
            No pending items 🎉
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`cursor-pointer grid grid-cols-1 sm:grid-cols-3 items-center px-4 py-4 sm:px-6 sm:py-3 gap-3 rounded-xl shadow-md border transition-all duration-300 ${
                  index % 2 === 0
                    ? "bg-green-100 hover:bg-green-200"
                    : "bg-green-200 hover:bg-green-300"
                }`}
                onClick={() => navigate(`/admin/${activeTab}/${item.id}`)}
              >
                {/* Title */}
                <div className="font-medium text-gray-900 truncate text-center sm:text-left">
                  {item.title}
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2 text-gray-700 justify-center">
                  <Calendar size={16} />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Author & Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-center items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1 text-green-800 font-medium">
                    <User size={16} />{" "}
                    {item.author?.firstName} {item.author?.lastName || ""}
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      onClick={() =>
                        setConfirmAction({ id: item.id, action: "approve" })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm shadow"
                      whileTap={{ scale: 0.95 }}
                    >
                      <CheckCircle size={14} /> Approve
                    </motion.button>
                    <motion.button
                      onClick={() =>
                        setConfirmAction({ id: item.id, action: "reject" })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm shadow"
                      whileTap={{ scale: 0.95 }}
                    >
                      <XCircle size={14} /> Reject
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center"
          >
            <AlertTriangle className="text-yellow-500 mx-auto mb-3" size={40} />
            <h3 className="text-lg font-semibold mb-2">Confirm Action</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to{" "}
              <span
                className={
                  confirmAction.action === "approve"
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {confirmAction.action}
              </span>{" "}
              this post?
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() =>
                  handleAction(confirmAction.id, confirmAction.action)
                }
                className={`px-4 py-2 rounded-lg text-white font-semibold ${
                  confirmAction.action === "approve"
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Popup Notification */}
      <AnimatePresence>
        {popupMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed right-6 bottom-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between gap-4"
          >
            <span>{popupMessage}</span>
            <button
              className="text-sm underline"
              onClick={() => setPopupMessage("")}
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
