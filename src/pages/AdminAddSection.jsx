import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  ArrowRight,
  Loader2,
  XCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const tabDefs = [
  { key: "ALL", label: "All Ads", api: "https://api.jharkhandbiharupdates.com/api/v1/banner-ads" },
  { key: "SMALL_ACTIVE", label: "Active Small", api: "https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/small" },
  { key: "LARGE_ACTIVE", label: "Active Large", api: "https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/large" }
];

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
}

function getAuth() {
  const token = localStorage.getItem("accessToken");
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
}

const DropDownStatus = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left z-50">
      <button
        className="px-2 py-1 rounded border text-xs font-semibold bg-blue-50 text-blue-700 flex items-center gap-1"
        onClick={e => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        type="button"
      >
        {value} {open ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, pointerEvents: "auto" }}
            exit={{ opacity: 0, y: -10, pointerEvents: "none" }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-1 w-24 bg-white border border-gray-300 shadow-xl rounded py-1"
          >
            {STATUS_OPTIONS.map(s => (
              <li
                key={s}
                onClick={e => {
                  e.stopPropagation();
                  setOpen(false);
                  if (s !== value) onChange(s);
                }}
                className="px-3 py-1 hover:bg-blue-50 cursor-pointer text-sm transition"
              >
                {s}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AdminAddSection() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(tabDefs[0].key);
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();

  const fetchAds = async () => {
    setLoading(true);
    setFetchError(null);
    setAds([]);
    try {
      const { api } = tabDefs.find(t => t.key === tab);
      const res = await axios.get(api, getAuth());
      setAds(res.data.data || []);
    } catch (error) {
      if (error?.response?.status === 403) {
        setFetchError(
          "Access Denied. You do not have admin privileges or your session expired. Please login as admin."
        );
      } else {
        setFetchError("Failed to load ads. Please check your connection or admin privileges.");
      }
      setAds([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line
  }, [tab]);

  const handleStatusChange = async (adId, newStatus) => {
    try {
      await axios.patch(
        `https://api.jharkhandbiharupdates.com/api/v1/banner-ads/${adId}/status?status=${newStatus}`,
        {},
        getAuth()
      );
      toast.success(`Status changed to ${newStatus}`);
      fetchAds();
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (adId) => {
    if (!window.confirm("Delete this ad?")) return;
    try {
      await axios.delete(`https://api.jharkhandbiharupdates.com/api/v1/banner-ads/${adId}`, getAuth());
      toast.success("Ad deleted successfully");
      fetchAds();
    } catch {
      toast.error("Failed to delete ad");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Card fix: Remove opacity & filters
  const renderAdCard = (ad) => (
    <motion.div
      key={ad.id}
      layout
      initial={{ opacity: 0, scale: 1, y: 32 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 32 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      whileHover={{ scale: 1.03, y: -4, boxShadow: "0 8px 32px rgba(25,60,165,0.13)" }}
      className="rounded-xl border-2 p-4 shadow-md bg-white relative overflow-visible transition group border-blue-100 hover:border-blue-500"
      style={{ opacity: 1, filter: "none", backdropFilter: "none" }} // <-- FIX: Remove blur!
    >
      <div className="flex items-center gap-1 absolute right-2 top-2 z-20">
        <DropDownStatus
          value={(ad.status || "INACTIVE").toUpperCase()}
          onChange={val => handleStatusChange(ad.id, val)}
        />
      </div>
      {ad.bannerUrl ? (
        <img
          src={ad.bannerUrl}
          alt={ad.title}
          className="w-full h-28 md:h-32 object-cover rounded-lg mb-3 border shadow group-hover:scale-105 transition duration-300"
        />
      ) : (
        <div className="w-full h-28 md:h-32 bg-blue-50 rounded-lg mb-3 flex items-center justify-center text-2xl font-black tracking-widest text-blue-300">
          N/A
        </div>
      )}
      <div className="font-bold text-blue-800 text-lg truncate mb-1">{ad.title}</div>
      <div className="text-xs text-gray-600 mb-2 truncate">{ad.destinationUrl}</div>
      <div className="flex items-center gap-2 mb-2 text-xs text-gray-700">
        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200">
          {ad.size}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
          {formatDate(ad.startDate)}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
          {formatDate(ad.endDate)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="flex items-center gap-2 text-blue-500 font-bold text-xs hover:underline hover:text-blue-700 focus:underline focus:outline-none transition"
          onClick={() => window.open(ad.destinationUrl, "_blank", "noopener,noreferrer")}
        >
          <ArrowRight className="w-3 h-3" />
          Visit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="flex items-center gap-1 py-1 px-2 rounded bg-yellow-100 text-yellow-700 font-bold text-xs border border-yellow-300 transition"
          onClick={() => navigate(`/update-add/${ad.id}`)}
        >
          <Edit size={14} /> Update
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="flex items-center gap-1 py-1 px-2 rounded bg-red-100 text-red-600 font-bold text-xs border border-red-200 transition"
          onClick={() => handleDelete(ad.id)}
        >
          <Trash2 size={14} /> Delete
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-blue-100 shadow sticky top-0 z-30">
        <div className="text-2xl md:text-3xl font-black text-blue-800 flex items-center gap-2 drop-shadow">
          Ads Admin Panel
        </div>
        <div className="flex gap-2 sm:gap-3 items-center">
          <motion.button
            whileHover={{ scale: 1.07, backgroundColor: "#2563eb", color: "#fff" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-base transition-colors hover:bg-blue-700"
            onClick={() => navigate("/add-post")}
          >
            <PlusCircle className="w-5 h-5" />
            Post Ads
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.07, backgroundColor: "#fee2e2", color: "#b91c1c" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-xl shadow font-bold text-base transition-colors hover:bg-red-200 border border-red-200"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-3 mt-4 mb-2 overflow-x-auto">
        {tabDefs.map(def => (
          <button
            key={def.key}
            className={`px-4 py-1.5 rounded-lg font-bold border text-base shadow-sm transition-all
              ${tab === def.key
                ? "bg-blue-100 text-blue-700 border-blue-400 shadow"
                : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50"
              }`}
            onClick={() => setTab(def.key)}
          >
            {def.label}
          </button>
        ))}
      </div>

      {/* AD Main List */}
      <main className="flex-1 px-2 sm:px-4 md:px-8 pt-2 pb-10 w-full max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-gray-500 my-14 min-h-[30vh]"
            >
              <Loader2 className="w-10 h-10 animate-spin mb-3" />
              <div className="font-medium text-lg">Loading Ads...</div>
            </motion.div>
          ) : fetchError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-red-400 mt-32"
            >
              <XCircle size={44} />
              <div className="font-black text-xl mt-2">{fetchError}</div>
            </motion.div>
          ) : ads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-gray-400 mt-32"
            >
              <XCircle size={44} />
              <div className="font-extrabold text-lg mt-2">
                No {tabDefs.find(t => t.key === tab).label.toLowerCase()} found.
              </div>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-2"
            >
              {ads.map(renderAdCard)}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
