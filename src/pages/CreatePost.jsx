import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, XCircle } from "lucide-react";
import EventPostForm from "./EventPostForm"; // ✅ event form

export default function CreatePost() {
  const { type } = useParams();
  const navigate = useNavigate();

  // ✅ Decode and normalize type (handles "localnews" as "local news")
  const normalizedType =
    type === "localnews"
      ? "local news"
      : type === "jobs"
      ? "jobs"
      : type === "events"
      ? "events"
      : type === "community"
      ? "community"
      : "post";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    jobType: "Full-Time",
    salaryRange: "",
    image: null,
    imagePreview: null,
    eventName: "",
    eventLocation: "",
    eventDate: "",
    eventTime: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: file, imagePreview: previewUrl });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null, imagePreview: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.image) {
      alert("Please upload an image before posting!");
      return;
    }

    console.log("Post created:", { type: normalizedType, ...formData });
    alert(`${normalizedType.toUpperCase()} post created successfully!`);
    navigate(`/${type}`);
  };

  const isJobPost = normalizedType === "jobs";
  const isEventPost = normalizedType === "events";

  const postTypeTitle =
    normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center py-10 px-6"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-2 text-green-600 font-semibold mb-6 hover:text-green-800"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Form Container */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
      >
        <h1 className="text-3xl font-bold text-green-600 text-center mb-6">
          Create {postTypeTitle} Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title (skip for events) */}
          {!isEventPost && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={`Enter your ${normalizedType} title`}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
          )}

          {/* Job-specific fields */}
          {isJobPost && (
            <>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., London, UK"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-2">
                    Job Type
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Remote</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    name="salaryRange"
                    value={formData.salaryRange}
                    onChange={handleChange}
                    placeholder="£45,000 - £55,000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Event-specific fields */}
          {isEventPost && (
            <EventPostForm formData={formData} handleChange={handleChange} />
          )}

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={`Write something about this ${normalizedType}...`}
              rows={isJobPost || isEventPost ? 4 : 5}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Image Upload (Mandatory) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Upload Image <span className="text-red-500">*</span>
            </label>

            {formData.imagePreview ? (
              <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <XCircle size={20} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-all cursor-pointer">
                <label
                  htmlFor="image"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="text-green-500 mb-2" size={30} />
                  <span className="text-gray-600">Click to upload an image</span>
                  <input
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Post {postTypeTitle}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
