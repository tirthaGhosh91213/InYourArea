// src/pages/CreateCommunityPost.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function CreateCommunityPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    imagePreview: null,
  });
  const [loading, setLoading] = useState(false);

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

  const removeImage = () => setFormData({ ...formData, image: null, imagePreview: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return toast.error("Please upload an image!");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/v1/posts", {
        title: formData.title,
        description: formData.description,
        type: "community",
        image: formData.image,
      });
      if (res.data.success) {
        toast.success("Community post created successfully!");
        navigate("/community");
      }
    } catch (err) {
      toast.error("Failed to post Community content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center py-10 px-6">
      <button onClick={() => navigate(-1)} className="self-start flex items-center gap-2 text-green-600 font-semibold mb-6 hover:text-green-800">
        <ArrowLeft size={20} /> Back
      </button>

      <motion.div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-6">Create Community Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            rows={5}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <div>
            {formData.imagePreview ? (
              <div className="relative border rounded-lg overflow-hidden">
                <img src={formData.imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                  <XCircle size={20} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center border-2 border-dashed p-6 rounded-lg cursor-pointer hover:border-green-400">
                <Upload className="text-green-500 mb-2" size={30} />
                Click to upload an image
                <input type="file" name="image" onChange={handleChange} className="hidden" required />
              </label>
            )}
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-full shadow-lg">
            {loading ? "Posting..." : "Post Community"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
