import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  PlusCircle,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  ChevronDown,
  X as RemoveIcon,
  ArrowLeftCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const BASE_API = "http://localhost:8000/api/v1";
const SIZES = [
  { label: "Small", value: "SMALL" },
  { label: "Large", value: "LARGE" }
];

export default function AdminAddPost() {
  const [title, setTitle] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [size, setSize] = useState("SMALL");
  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setBanners(prev => [...prev, ...files]);
    e.target.value = null;
  };

  const handleRemoveImage = index => {
    setBanners(banners.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title || !destinationUrl || !startDate || !endDate || banners.length === 0 || !size) {
      toast.error("All fields are required, including at least one image");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      const metadata = { title, destinationUrl, startDate, endDate, size };
      formData.append("metadata", JSON.stringify(metadata));
      banners.forEach(file => formData.append("bannerImage", file));
      const token = localStorage.getItem("accessToken");
      await axios.post(`${BASE_API}/banner-ads`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      toast.success("Banner Ad Created Successfully");
      navigate("/add");
    } catch (error) {
      if (error?.response?.status === 403) {
        toast.error("Access Denied: You are not authorized to create ads. Please log in with an admin account.");
      } else {
        toast.error(error?.response?.data?.message || "Failed to create banner ad");
      }
    } finally {
      setUploading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 160, damping: 15 } },
    exit: { opacity: 0, y: 30, scale: 0.98 }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2">
      {/* Back button outside the box */}
      <div className="w-full max-w-2xl mx-auto mb-6 flex justify-start">
        <motion.button
          whileHover={{ scale: 1.06, x: -3, backgroundColor: "#dbeafe" }}
          whileTap={{ scale: 0.97, x: -8 }}
          className="flex items-center gap-2 font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-full shadow-sm border border-blue-200 z-10 transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftCircle size={20} className="mr-1" />
          Back
        </motion.button>
      </div>
      {/* Form box */}
      <motion.div
        className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 relative border border-blue-100"
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
      >
        <motion.h2
          className="text-2xl md:text-3xl font-black mb-7 text-blue-700 flex items-center gap-2 tracking-tight"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 90 }}
        >
          <PlusCircle className="text-blue-500 drop-shadow-glow" size={30} />
          Create Banner Ad
        </motion.h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-7" encType="multipart/form-data">
          {/* Title */}
          <motion.label className="flex flex-col gap-1"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.11 }}>
            <span className="font-bold text-gray-700">Title</span>
            <input
              type="text"
              className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 duration-200 text-lg bg-white"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="E.g. Weekend Flash Sale"
              maxLength={100}
            />
          </motion.label>
          {/* DESTINATION URL */}
          <motion.label className="flex flex-col gap-1"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}>
            <span className="font-bold text-gray-700 flex items-center gap-2">
              <LinkIcon size={17} /> Destination URL
            </span>
            <input
              type="url"
              className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 duration-200 text-lg bg-white"
              value={destinationUrl}
              onChange={e => setDestinationUrl(e.target.value)}
              required
              placeholder="E.g. https://example.com/flash-sale"
            />
          </motion.label>
          {/* DATES */}
          <div className="flex flex-col md:flex-row gap-5">
            <motion.label className="flex flex-col flex-1 gap-1"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}>
              <span className="font-bold text-gray-700 flex items-center gap-2">
                <Calendar size={17} /> Start Date
              </span>
              <input
                type="datetime-local"
                className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 duration-200 text-lg bg-white"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </motion.label>
            <motion.label className="flex flex-col flex-1 gap-1"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.17 }}>
              <span className="font-bold text-gray-700 flex items-center gap-2">
                <Calendar size={17} /> End Date
              </span>
              <input
                type="datetime-local"
                className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 duration-200 text-lg bg-white"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
                min={startDate}
              />
            </motion.label>
          </div>
          {/* IMAGES */}
          <motion.label className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.19 }}>
            <span className="font-bold text-gray-700 flex items-center gap-2">
              <ImageIcon size={20} /> Banner Image(s)
            </span>
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 flex-wrap">
                <AnimatePresence>
                  {banners.map((file, idx) => (
                    <motion.div
                      key={idx}
                      className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg border border-blue-200 bg-blue-50 flex items-center justify-center overflow-hidden group"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <motion.button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-white shadow-md hover:bg-red-500 hover:text-white transition-colors duration-200 rounded-full p-1 z-10"
                        aria-label="Remove image"
                        whileHover={{ scale: 1.2, rotate: 18 }}
                        whileTap={{ scale: 1 }}
                      >
                        <RemoveIcon size={16} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <label className="flex flex-col w-fit cursor-pointer mt-1">
                <motion.div
                  className="flex items-center gap-2 bg-gradient-to-tr from-blue-100 via-blue-50 to-blue-200 hover:from-blue-200 hover:to-blue-300 px-6 py-2 rounded-xl border border-blue-200 text-blue-800 font-bold shadow hover:shadow-lg"
                  whileHover={{ scale: 1.04 }}
                >
                  <ImageIcon size={18} /> Add Images
                </motion.div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {banners.length === 0 && (
                <div className="text-sm text-gray-400 mt-1 ml-2">No images selected</div>
              )}
            </div>
          </motion.label>
          {/* SIZE */}
          <motion.label className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.21 }}>
            <span className="font-bold text-gray-700">Banner Size</span>
            <div className="relative">
              <select
                value={size}
                onChange={e => setSize(e.target.value)}
                className="border border-blue-200 rounded-lg px-3 py-2 w-full pr-10 appearance-none bg-white"
                required
              >
                {SIZES.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={20} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-300" />
            </div>
          </motion.label>
          {/* SUBMIT */}
          <motion.button
            type="submit"
            disabled={uploading}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-extrabold py-3 px-5 rounded-xl shadow-lg text-lg transition"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {uploading ? <Loader2 size={22} className="animate-spin" /> : <PlusCircle size={22} />}
            {uploading ? "Posting..." : "Post Banner Ad"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
