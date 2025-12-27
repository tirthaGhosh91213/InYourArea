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

    // Validate only required fields: title, description, and images
    if (!formData.title.trim()) {
      toast.error("Please enter a job title!");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a job description!");
      return;
    }

    if (formData.images.length === 0) {
      toast.error("Please upload at least one image!");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      
      // Only include applicationDeadline if provided
      const applicationDeadlineWithTime = formData.applicationDeadline
        ? formData.applicationDeadline + "T00:00:00"
        : null;

      // Build job object with only non-empty optional fields
      const jobData = {
        title: formData.title,
        description: formData.description,
      };

      // Add optional fields only if they have values
      if (formData.company.trim()) jobData.company = formData.company;
      if (formData.location.trim()) jobData.location = formData.location;
      if (formData.salaryRange.trim()) jobData.salaryRange = formData.salaryRange;
      if (formData.applicationLink.trim()) jobData.reglink = formData.applicationLink;
      if (applicationDeadlineWithTime) jobData.applicationDeadline = applicationDeadlineWithTime;

      data.append("job", JSON.stringify(jobData));

      formData.images.forEach((img) => data.append("images", img.file));

      const accessToken = localStorage.getItem("accessToken");

      const res = await axios.post("https://api.jharkhandbiharupdates.com/api/v1/jobs", data, {
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
      toast.error(err.response?.data?.message || "Failed to post job");
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
        
        <p className="text-sm text-gray-600 mb-4 text-center">
          <span className="text-red-500">*</span> Required fields
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* REQUIRED: Title */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Software Developer"
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* REQUIRED: Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job role, responsibilities, requirements..."
              rows={6}
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* REQUIRED: Images */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Images <span className="text-red-500">*</span>
            </label>
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
                <input type="file" multiple accept="image/*" onChange={handleChange} className="hidden" />
              </label>
            </div>
          </div>

          <hr className="my-4" />
          <p className="text-sm text-gray-500 italic">Optional Information</p>

          {/* OPTIONAL: Company */}
          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company Name (Optional)"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
          />

          {/* OPTIONAL: Location */}
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location (Optional)"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
          />

          {/* OPTIONAL: Salary Range */}
          <input
            name="salaryRange"
            value={formData.salaryRange}
            onChange={handleChange}
            placeholder="Salary Range (Optional)"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
          />

          {/* OPTIONAL: Application Link */}
          <input
            name="applicationLink"
            value={formData.applicationLink}
            onChange={handleChange}
            placeholder="Application Link (Optional)"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
          />

          {/* OPTIONAL: Application Deadline */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Application Deadline (Optional)
            </label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
