import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, XCircle, ImagePlus, Loader2, MapPin, FileText, Square, ShieldCheck } from "lucide-react";

export default function CreatePropertyPost() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "HOUSE",
    price: "",
    negotiable: false,
    address: "",
    district: "",
    city: "",
    state: "",
    pincode: "",
    locality: "",
    totalArea: "",
    bedrooms: "",
    bathrooms: "",
    furnishingStatus: "SEMI_FURNISHED",
    parkingAvailable: false,
    parkingSpaces: "",
    amenities: "",
    propertyAge: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handle all field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image/media uploads
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(file => file.type.startsWith("image"));
    if (validImages.length === 0) return;

    const previews = validImages.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type
    }));
    setMediaFiles(prev => [...prev, ...validImages]);
    setMediaPreviews(prev => [...prev, ...previews]);
  };

  // Remove a specific image/media
  const removeMedia = (index) => {
    const newFiles = [...mediaFiles];
    const newPreviews = [...mediaPreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  // Form submit with images
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (mediaFiles.length === 0) {
      setErrorMsg("Please upload at least one property image.");
      setLoading(false);
      return;
    }

    try {
      const amenitiesArr = form.amenities.split(",").map(a => a.trim()).filter(Boolean);
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      amenitiesArr.forEach(a => formData.append("amenities[]", a));
      mediaFiles.forEach(f => formData.append("images", f));  // Send as "images"

      const resp = await fetch("http://localhost:8000/api/v1/properties", {
        method: "POST",
        body: formData
      });
      const data = await resp.json();
      if (data.success) {
        setSuccessMsg("Property created successfully and pending approval.");
        setForm({
          title: "",
          description: "",
          propertyType: "HOUSE",
          price: "",
          negotiable: false,
          address: "",
          district: "",
          city: "",
          state: "",
          pincode: "",
          locality: "",
          totalArea: "",
          bedrooms: "",
          bathrooms: "",
          furnishingStatus: "SEMI_FURNISHED",
          parkingAvailable: false,
          parkingSpaces: "",
          amenities: "",
          propertyAge: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
        });
        setMediaFiles([]);
        setMediaPreviews([]);
      } else {
        setErrorMsg(data.message || "Failed to create property.");
      }
    } catch {
      setErrorMsg("Failed to create property.");
    } finally {
      setLoading(false);
    }
  };

  // Preview: show first image as featured, all others in line
  const featuredImg = mediaPreviews.length > 0 ? mediaPreviews[0].url : null;

  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col items-center py-10 px-4 sm:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="w-full max-w-3xl bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-green-100" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-green-600 text-center mb-8 flex items-center justify-center gap-2">
          <FileText size={32}/> Create Property Post
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title/Type/Price Row */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[160px]"><label className="block font-semibold mb-1">Title</label><input name="title" required value={form.title} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[110px]"><label className="block font-semibold mb-1">Type</label>
              <select name="propertyType" value={form.propertyType} onChange={handleChange} className="input">
                <option value="HOUSE">House</option>
                <option value="FLAT">Flat</option>
                <option value="PLOT">Plot</option>
              </select>
            </div>
            <div className="flex-1 min-w-[110px]"><label className="block font-semibold mb-1">Price (INR)</label><input name="price" required type="number" value={form.price} onChange={handleChange} className="input" /></div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea name="description" required value={form.description} onChange={handleChange} className="input" rows={2} />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[120px]"><label className="block font-semibold mb-1">Address</label><input name="address" required value={form.address} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[100px]"><label className="block font-semibold mb-1">City</label><input name="city" required value={form.city} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[100px]"><label className="block font-semibold mb-1">State</label><input name="state" required value={form.state} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[100px]"><label className="block font-semibold mb-1">District</label><input name="district" value={form.district} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[80px]"><label className="block font-semibold mb-1">Pincode</label><input name="pincode" value={form.pincode} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[100px]"><label className="block font-semibold mb-1">Locality</label><input name="locality" value={form.locality} onChange={handleChange} className="input" /></div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[100px]"><label className="block font-semibold mb-1">Area (sq.ft)</label><input name="totalArea" required type="number" value={form.totalArea} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[70px]"><label className="block font-semibold mb-1">Bedrooms</label><input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[70px]"><label className="block font-semibold mb-1">Bathrooms</label><input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[110px]"><label className="block font-semibold mb-1">Furnishing</label>
              <select name="furnishingStatus" value={form.furnishingStatus} onChange={handleChange} className="input">
                <option value="SEMI_FURNISHED">Semi-Furnished</option>
                <option value="FULLY_FURNISHED">Fully-Furnished</option>
                <option value="UNFURNISHED">Unfurnished</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="parkingAvailable" checked={form.parkingAvailable} onChange={handleChange} />
              <label className="font-semibold">Parking Available</label>
            </div>
            {form.parkingAvailable && (
              <div className="flex-1 min-w-[80px]">
                <label className="block font-semibold mb-1">Parking Spaces</label>
                <input name="parkingSpaces" type="number" min="1" value={form.parkingSpaces} onChange={handleChange} className="input" />
              </div>
            )}
            <div className="flex-1 min-w-[80px]"><label className="block font-semibold mb-1">Property Age (years)</label><input name="propertyAge" type="number" value={form.propertyAge} onChange={handleChange} className="input" /></div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Amenities <span className="font-normal text-xs">(Comma separated)</span></label>
            <input name="amenities" value={form.amenities} onChange={handleChange} className="input" placeholder="Garden, Security, Power Backup" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[110px]"><label className="block font-semibold mb-1">Contact Name</label><input name="contactName" required value={form.contactName} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[110px]"><label className="block font-semibold mb-1">Contact Email</label><input name="contactEmail" required value={form.contactEmail} onChange={handleChange} className="input" /></div>
            <div className="flex-1 min-w-[110px]"><label className="block font-semibold mb-1">Contact Phone</label><input name="contactPhone" value={form.contactPhone} onChange={handleChange} className="input" /></div>
          </div>
          {/* Media Upload Section */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <ImagePlus size={20} /> Property Images
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 p-6 rounded-2xl cursor-pointer hover:border-green-500 transition text-center">
              <Upload className="text-green-500 mb-2" size={30} />
              <span className="text-gray-500 text-sm sm:text-base">Click or drag to upload one or more property images</span>
              <input type="file" multiple accept="image/*" onChange={handleMediaUpload} className="hidden" />
            </label>
            <AnimatePresence>
              {mediaPreviews.length > 0 && (
                <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {mediaPreviews.map((preview, index) => (
                    <motion.div key={index} className="relative group overflow-hidden rounded-xl shadow-md cursor-pointer" whileHover={{ scale: 1.04 }}>
                      <img src={preview.url} alt={preview.name || "Preview"} className="w-full h-40 object-cover rounded-xl" />
                      <button type="button" onClick={() => removeMedia(index)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                        <XCircle size={20} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Submit */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition">
            {loading ? <><Loader2 className="animate-spin" size={20} /> Submitting...</> : "Submit Property"}
          </motion.button>
          {successMsg && <motion.div animate={{opacity: 1}} className="mt-4 text-green-700 font-bold text-center">{successMsg}</motion.div>}
          {errorMsg && <motion.div animate={{opacity: 1}} className="mt-4 text-red-600 font-semibold text-center">{errorMsg}</motion.div>}
        </form>
      </motion.div>
      <style>{`
        .input {
          width: 100%;
          border-radius: 0.625rem;
          background: #f9f9f9;
          border: 2px solid #e5e7eb;
          padding: 0.7rem 1rem;
          margin-bottom: 0.3rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: #10b981;
        }
      `}</style>
    </motion.div>
  );
}
