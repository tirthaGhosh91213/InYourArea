import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X, Loader2, Image as ImageIcon, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function CreatePromotion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    shopName: "",
    shopDescription: "",
    shopAddress: "", // <--- Added State for Address
    vendorPhone: "",
  });

  // Logo State
  const [shopLogo, setShopLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Cover Photo State
  const [shopCover, setShopCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Logo Upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }
      setShopLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setShopLogo(null);
    setLogoPreview(null);
  };

  // Handle Cover Upload
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }
      setShopCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const removeCover = () => {
    setShopCover(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.shopName.trim()) {
      toast.error("Shop name is required");
      return;
    }

    // New Address Validation
    if (!formData.shopAddress.trim()) {
      toast.error("Shop address is required");
      return;
    }

    if (!formData.vendorPhone.trim()) {
      toast.error("WhatsApp number is required");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.vendorPhone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to register as vendor");
        navigate("/login");
        return;
      }

      const formDataToSend = new FormData();
      
      // Create vendor object
      const vendorData = {
        shopName: formData.shopName.trim(),
        shopDescription: formData.shopDescription.trim() || null,
        shopAddress: formData.shopAddress.trim(), // <--- Sending Address to Backend
        vendorPhone: formData.vendorPhone.trim(),
      };

      // Append JSON data
      formDataToSend.append("vendor", JSON.stringify(vendorData));
      
      // Append Images
      if (shopLogo) {
        formDataToSend.append("shopLogo", shopLogo);
      }
      if (shopCover) {
        formDataToSend.append("shopCover", shopCover);
      }

      const response = await fetch(
        "https://api.jharkhandbiharupdates.com/api/v1/vendors/register",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Vendor registration submitted! Awaiting admin approval.");
        navigate("/promotions");
      } else {
        toast.error(data.message || "Failed to register vendor");
      }
    } catch (error) {
      console.error("Error registering vendor:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Register as Vendor
          </h1>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
        >
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shop Logo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shop Logo (Optional)
              </label>
              {logoPreview ? (
                <div className="relative w-32 h-32">
                  <img
                    src={logoPreview}
                    alt="Shop Logo Preview"
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
                  <Upload size={28} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Shop Cover Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cover Photo (Optional)
              </label>
              {coverPreview ? (
                <div className="relative w-full h-32">
                  <img
                    src={coverPreview}
                    alt="Cover Preview"
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <ImageIcon size={28} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Upload Cover Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Shop Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleInputChange}
              placeholder="Enter your shop name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Shop Address (Added Here) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <MapPin size={16} className="text-gray-500" /> 
              Shop Location / Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shopAddress"
              value={formData.shopAddress}
              onChange={handleInputChange}
              placeholder="Enter full shop address (e.g., Main Road, Ranchi, Jharkhand)"
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition"
              required
            />
          </div>

          {/* Shop Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Shop Description (Optional)
            </label>
            <textarea
              name="shopDescription"
              value={formData.shopDescription}
              onChange={handleInputChange}
              placeholder="Describe your shop and products..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition"
            />
          </div>

          {/* WhatsApp Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="vendorPhone"
              value={formData.vendorPhone}
              onChange={handleInputChange}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Orders will be sent to this WhatsApp number
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Submitting...
              </span>
            ) : (
              "Submit for Approval"
            )}
          </motion.button>

          <p className="text-sm text-gray-600 text-center">
            Your vendor application will be reviewed by admin before approval
          </p>
        </motion.form>
      </div>
    </div>
  );
}