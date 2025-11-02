import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  XCircle,
  ImagePlus,
  Newspaper,
  FileText,
  Loader2,
  MapPin,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function CreateLocalNewsPost() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    districtName: "",
    media: [],
    mediaPreviews: [],
  });
  const [loading, setLoading] = useState(false);
  const [existingDistricts, setExistingDistricts] = useState([]);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const token = localStorage.getItem("accessToken");
  if (!token) toast.error("Please login first!");

  const allDistricts = [
    "Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum","Garhwa",
    "Giridih","Godda","Gumla","Hazaribagh","Jamtara","Khunti","Koderma","Latehar",
    "Lohardaga","Pakur","Palamu","Ramgarh","Ranchi","Sahibganj","Seraikela Kharsawan",
    "Simdega","West Singhbhum"
  ];

  useEffect(() => {
    const fetchExistingDistricts = async () => {
      try {
        const res = await axios.get("https://miami-only-great-buf.trycloudflare.com/api/v1/districts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const names = res.data.data.map((d) => d.name);
          setExistingDistricts(names);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load districts. Please login again.");
      }
    };
    fetchExistingDistricts();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setFormData({ ...formData, content: editorRef.current.innerHTML });
      updateActiveFormats();
    }
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  };

  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    editorRef.current.focus();
    updateActiveFormats();
  };

  // Handles image and video uploads
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type
    }));
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...files],
      mediaPreviews: [...prev.mediaPreviews, ...previews],
    }));
  };

  // Remove function for both images or videos
  const removeMedia = (index) => {
    const newMedia = [...formData.media];
    const newPreviews = [...formData.mediaPreviews];
    newMedia.splice(index, 1);
    newPreviews.splice(index, 1);
    setFormData({ ...formData, media: newMedia, mediaPreviews: newPreviews });
  };

  const ensureDistrictExists = async (districtName) => {
    if (existingDistricts.includes(districtName)) return;
    try {
      const res = await axios.post(
        "https://miami-only-great-buf.trycloudflare.com/api/v1/districts",
        { name: districtName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`District "${districtName}" created`);
        setExistingDistricts((prev) => [...prev, districtName]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create district. It may already exist.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.districtName) return toast.error("Select a district!");
    if (formData.media.length === 0) return toast.error("Upload at least one image or video!");

    setLoading(true);
    try {
      await ensureDistrictExists(formData.districtName);

      const newsData = {
        title: formData.title,
        content: formData.content,
        districtName: formData.districtName,
      };

      const form = new FormData();
      form.append("news", JSON.stringify(newsData));
      formData.media.forEach((file) => form.append("images", file));  // <-- always use key "images" for all files

      const res = await axios.post(
        "https://miami-only-great-buf.trycloudflare.com/api/v1/district-news",
        form,
        { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("News posted successfully!");
        navigate("/localnews/Bokaro");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to post news. Check your role or token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col items-center py-10 px-4 sm:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={() => navigate(-1)} className="self-start flex items-center gap-2 text-green-600 font-semibold mb-6 hover:text-green-800">
        <ArrowLeft size={20} /> Back
      </button>
      <motion.div className="w-full max-w-2xl bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-green-100" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-green-600 text-center mb-8 flex items-center justify-center gap-2">
          <Newspaper size={35} /> Create District News
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <FileText size={18} /> Title
            </label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Enter news title" className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <FileText size={18} /> Description
            </label>
            {/* Formatting Toolbar */}
            <div className="flex gap-2 mb-2 p-2 bg-gray-100 rounded-t-lg border border-gray-300">
              <button
                type="button"
                onClick={() => applyFormat('bold')}
                className={`px-3 py-2 rounded transition font-bold ${
                  activeFormats.bold 
                    ? 'bg-green-500 text-white' 
                    : 'hover:bg-gray-200'
                }`}
                title="Bold (Ctrl+B)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => applyFormat('italic')}
                className={`px-3 py-2 rounded transition italic ${
                  activeFormats.italic 
                    ? 'bg-green-500 text-white' 
                    : 'hover:bg-gray-200'
                }`}
                title="Italic (Ctrl+I)"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => applyFormat('underline')}
                className={`px-3 py-2 rounded transition underline ${
                  activeFormats.underline 
                    ? 'bg-green-500 text-white' 
                    : 'hover:bg-gray-200'
                }`}
                title="Underline (Ctrl+U)"
              >
                U
              </button>
            </div>
            {/* Rich Text Editor */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorChange}
              onMouseUp={updateActiveFormats}
              onKeyUp={updateActiveFormats}
              className="w-full border border-gray-300 px-4 py-3 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[250px] overflow-y-auto bg-white"
              style={{ whiteSpace: 'pre-wrap' }}
              suppressContentEditableWarning
            >
            </div>
            <p className="text-xs text-gray-500 mt-1">Select text and use the formatting buttons above or keyboard shortcuts</p>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <MapPin size={18} /> Select District
            </label>
            <select name="districtName" value={formData.districtName} onChange={handleChange} className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required>
              <option value="">-- Choose a District --</option>
              {allDistricts.map((d) => (
                <option key={d} value={d}>
                  {d} {!existingDistricts.includes(d) ? "(Will be created)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <ImagePlus size={20} /> Upload Images or Videos
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 p-6 rounded-2xl cursor-pointer hover:border-green-500 transition text-center">
              <Upload className="text-green-500 mb-2" size={30} />
              <span className="text-gray-500 text-sm sm:text-base">Click or drag to upload images or videos</span>
              <input type="file" name="media" multiple accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
            </label>

            <AnimatePresence>
              {formData.mediaPreviews.length > 0 && (
                <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {formData.mediaPreviews.map((preview, index) => (
                    <motion.div key={index} className="relative group overflow-hidden rounded-xl shadow-md cursor-pointer" whileHover={{ scale: 1.05 }}>
                      {preview.type.startsWith("image") ? (
                        <img src={preview.url} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                      ) : preview.type.startsWith("video") ? (
                        <video src={preview.url} controls className="w-full h-40 object-cover rounded-xl" />
                      ) : null}
                      <button type="button" onClick={() => removeMedia(index)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                        <XCircle size={20} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition">
            {loading ? <><Loader2 className="animate-spin" size={20} /> Posting...</> : "Post District News"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
