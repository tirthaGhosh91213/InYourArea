import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, XCircle, Plus, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function CreateJobPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salaryRange: "",
    description: "",
    applicationDeadline: "",
    applicationLink: "",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      toast.error("Please upload at least one image!");
      return;
    }

    if (!formData.applicationLink.trim()) {
      toast.error("Please provide an application link!");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      const applicationDeadlineWithTime = formData.applicationDeadline
        ? formData.applicationDeadline + "T00:00:00"
        : null;

      data.append(
        "job",
        JSON.stringify({
          title: formData.title,
          company: formData.company,
          location: formData.location,
          salaryRange: formData.salaryRange,
          description: formData.description,
          applicationDeadline: applicationDeadlineWithTime,
          reglink: formData.applicationLink, // backend expects 'reglink'
        })
      );

      formData.images.forEach((img) => data.append("images", img.file));

      const accessToken = localStorage.getItem("accessToken");

      const res = await axios.post("https://cached-nursery-kevin-advances.trycloudflare.com/api/v1/jobs", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.data.success) {
        setShowPopup(true);
        setFormData({
          title: "",
          company: "",
          location: "",
          salaryRange: "",
          description: "",
          applicationDeadline: "",
          applicationLink: "",
          images: [],
        });
      }
    } catch (err) {
      toast.error("Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center py-10 px-6">
      <button
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-2 text-green-600 font-semibold mb-6 hover:text-green-800"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <motion.div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-6">Create Job Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Job Title"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company Name"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            name="salaryRange"
            value={formData.salaryRange}
            onChange={handleChange}
            placeholder="Salary Range"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            name="applicationLink"
            value={formData.applicationLink}
            onChange={handleChange}
            placeholder="Application Link"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
            required
          />

          <div>
            <label className="block text-gray-700 font-medium mb-2">Application Deadline</label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Job Description"
            rows={6}
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
            required
          />

          <div className="flex flex-wrap gap-3">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative border rounded-lg overflow-hidden w-28 h-28">
                <img src={img.preview} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <XCircle size={18} />
                </button>
              </div>
            ))}
            <label className="flex items-center justify-center w-28 h-28 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-400">
              <Plus size={30} className="text-green-500" />
              <input type="file" multiple onChange={handleChange} className="hidden" />
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-full shadow-lg"
          >
            {loading ? "Posting..." : "Post Job"}
          </motion.button>
        </form>
      </motion.div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl w-80 text-center relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <CheckCircle size={50} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-green-600 mb-2">Success!</h2>
              <p className="text-gray-700 mb-4">
                Your job post has been created successfully and is pending approval.
              </p>
              <button
                onClick={() => {
                  setShowPopup(false);
                  navigate("/jobs");
                }}
                className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
              >
                Go to Jobs
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
