// src/pages/CreateCommunityPost.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function CreateCommunityPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    location: "",
    images: [],
    imagePreviews: [],
  });
  const [loading, setLoading] = useState(false);

  // Redirect to /login if no token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("You must login first!");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const newImages = [...files];
      const previews = newImages.map((file) => URL.createObjectURL(file));
      setFormData({ ...formData, images: newImages, imagePreviews: previews });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = formData.imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages, imagePreviews: newPreviews });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Access token missing! Please login again.");
      navigate("/login");
      return;
    }

    // Only validate content field
    if (!formData.content || formData.content.trim() === "") {
      return toast.error("Please provide content for your post!");
    }

    setLoading(true);
    try {
      const multipartData = new FormData();

      // Append post as JSON Blob (include only non-empty fields)
      const postPayload = {
        content: formData.content.trim(),
      };
      
      // Add optional fields only if provided
      if (formData.title && formData.title.trim()) {
        postPayload.title = formData.title.trim();
      }
      if (formData.location && formData.location.trim()) {
        postPayload.location = formData.location.trim();
      }

      multipartData.append(
        "post",
        new Blob([JSON.stringify(postPayload)], { type: "application/json" })
      );

      // Append images only if provided
      if (formData.images.length > 0) {
        formData.images.forEach((img) => multipartData.append("images", img));
      }

      const res = await axios.post(
        "https://api.jharkhandbiharupdates.com/api/v1/community",
        multipartData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Community post created successfully and pending approval!");
        navigate("/community");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to create community post";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Right Sidebar as Navbar */}
      <aside className="hidden md:flex md:flex-col w-20 bg-white border-r p-4">
        <div className="flex flex-col gap-6 items-center">
          <ArrowLeft size={24} className="cursor-pointer" onClick={() => navigate(-1)} />
          {/* Add more icons for community navigation */}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-green-600 font-semibold mb-6 hover:text-green-800 md:hidden"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <motion.div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h1 className="text-3xl font-bold text-green-600 text-center mb-6">Create Community Post</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Content"
              rows={5}
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="grid grid-cols-2 gap-4">
              {formData.imagePreviews.map((src, idx) => (
                <div key={idx} className="relative border rounded-lg overflow-hidden">
                  <img src={src} alt={`preview-${idx}`} className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center border-2 border-dashed p-4 rounded-lg cursor-pointer hover:border-green-400">
                <Upload className="text-green-500 mb-2" size={30} />
                Upload Images
                <input type="file" multiple accept="image/*" onChange={handleChange} className="hidden" />
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-full shadow-lg"
            >
              {loading ? "Posting..." : "Post Community"}
            </motion.button>
          </form>
        </motion.div>
      </main>
    </motion.div>
  );
}
