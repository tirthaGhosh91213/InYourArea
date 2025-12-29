import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, XCircle, ImagePlus, Loader2, MapPin, FileText, 
  Home, DollarSign, Bed, Bath, Car, Award, CheckCircle, AlertCircle 
} from "lucide-react";

export default function CreatePropertyPost() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "HOUSE",
    propertyStatus: "FOR_SALE",
    price: "",
    negotiable: false,
    address: "",
    district: "",
    city: "",
    state: "Jharkhand",
    pincode: "",
    locality: "",
    mapLink: "",
    latitude: "",
    longitude: "",
    totalArea: "",
    bedrooms: "",
    bathrooms: "",
    totalFloors: "",
    floorNumber: "",
    furnishingStatus: "SEMI_FURNISHED",
    parkingAvailable: false,
    parkingSpaces: "",
    amenities: "",
    propertyAge: "",
    facingDirection: "NORTH",
    availabilityStatus: "READY_TO_MOVE",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    postedByType: "OWNER"
  });

  const [propertyImages, setPropertyImages] = useState([]);
  const [propertyPreviews, setPropertyPreviews] = useState([]);
  const [floorPlanImages, setFloorPlanImages] = useState([]);
  const [floorPlanPreviews, setFloorPlanPreviews] = useState([]);
  
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

  // Handle property images upload
  const handlePropertyImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(file => file.type.startsWith("image"));
    
    if (propertyImages.length + validImages.length > 10) {
      setErrorMsg("Maximum 10 property images allowed");
      return;
    }

    const previews = validImages.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setPropertyImages(prev => [...prev, ...validImages]);
    setPropertyPreviews(prev => [...prev, ...previews]);
  };

  // Handle floor plan upload
  const handleFloorPlanUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(file => file.type.startsWith("image"));
    
    if (floorPlanImages.length + validImages.length > 5) {
      setErrorMsg("Maximum 5 floor plans allowed");
      return;
    }

    const previews = validImages.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setFloorPlanImages(prev => [...prev, ...validImages]);
    setFloorPlanPreviews(prev => [...prev, ...previews]);
  };

  // Remove property image
  const removePropertyImage = (index) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
    setPropertyPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove floor plan
  const removeFloorPlan = (index) => {
    setFloorPlanImages(prev => prev.filter((_, i) => i !== index));
    setFloorPlanPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Form validation
  const validateForm = () => {
    if (form.title.length < 10 || form.title.length > 200) {
      setErrorMsg("Title must be between 10 and 200 characters");
      return false;
    }
    if (form.description.length < 50 || form.description.length > 5000) {
      setErrorMsg("Description must be between 50 and 5000 characters");
      return false;
    }
    if (propertyImages.length === 0) {
      setErrorMsg("At least one property image is required");
      return false;
    }
    if (form.contactPhone && !/^[0-9]{10}$/.test(form.contactPhone.replace(/\s+/g, ''))) {
      setErrorMsg("Contact phone must be 10 digits");
      return false;
    }
    if (parseFloat(form.price) <= 0) {
      setErrorMsg("Price must be greater than 0");
      return false;
    }
    if (parseInt(form.totalArea) < 1) {
      setErrorMsg("Total area must be at least 1 sq ft");
      return false;
    }
    return true;
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setErrorMsg("Please login to create a property");
        setLoading(false);
        return;
      }

      // Prepare property data (exclude images)
      const propertyData = {
        ...form,
        contactPhone: form.contactPhone.replace(/\s+/g, ''),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        totalArea: parseInt(form.totalArea),
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        totalFloors: form.totalFloors ? parseInt(form.totalFloors) : null,
        floorNumber: form.floorNumber ? parseInt(form.floorNumber) : null,
        parkingSpaces: form.parkingSpaces ? parseInt(form.parkingSpaces) : null,
        propertyAge: form.propertyAge ? parseInt(form.propertyAge) : null,
        amenities: form.amenities ? form.amenities.split(",").map(a => a.trim()).filter(Boolean) : []
      };

      // Create FormData
      const formData = new FormData();
      
      // Add property as JSON string
      formData.append("property", JSON.stringify(propertyData));
      
      // Add property images
      propertyImages.forEach(file => {
        formData.append("images", file);
      });
      
      // Add floor plans if any
      if (floorPlanImages.length > 0) {
        floorPlanImages.forEach(file => {
          formData.append("floorPlans", file);
        });
      }

      const response = await fetch("https://api.jharkhandbiharupdates.com/api/v1/properties", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg(data.message || "Property created successfully and pending approval!");
        
        // Reset form
        setForm({
          title: "",
          description: "",
          propertyType: "HOUSE",
          propertyStatus: "FOR_SALE",
          price: "",
          negotiable: false,
          address: "",
          district: "",
          city: "",
          state: "Jharkhand",
          pincode: "",
          locality: "",
          mapLink: "",
          latitude: "",
          longitude: "",
          totalArea: "",
          bedrooms: "",
          bathrooms: "",
          totalFloors: "",
          floorNumber: "",
          furnishingStatus: "SEMI_FURNISHED",
          parkingAvailable: false,
          parkingSpaces: "",
          amenities: "",
          propertyAge: "",
          facingDirection: "NORTH",
          availabilityStatus: "READY_TO_MOVE",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
          postedByType: "OWNER"
        });
        setPropertyImages([]);
        setPropertyPreviews([]);
        setFloorPlanImages([]);
        setFloorPlanPreviews([]);

        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(data.message || "Failed to create property");
      }
    } catch (error) {
      console.error("Error creating property:", error);
      setErrorMsg("Failed to create property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-10 px-4 sm:px-8"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="w-full max-w-5xl mx-auto bg-white/95 backdrop-blur-md p-6 sm:p-10 rounded-3xl shadow-2xl border border-green-100"
        initial={{ y: 40, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-green-600 text-center mb-2 flex items-center justify-center gap-2">
          <Home size={36}/> Create Property Listing
        </h1>
        <p className="text-center text-gray-600 mb-8">Fill in the details to list your property</p>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl flex items-center gap-2"
            >
              <CheckCircle size={20} />
              {successMsg}
            </motion.div>
          )}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center gap-2"
            >
              <AlertCircle size={20} />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
            <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
              <FileText size={22} /> Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input 
                  name="title" 
                  required 
                  value={form.title} 
                  onChange={handleChange} 
                  className="input" 
                  placeholder="e.g., 3BHK Spacious Flat in Ranchi"
                  minLength={10}
                  maxLength={200}
                />
                <span className="text-xs text-gray-500">{form.title.length}/200 characters (min 10)</span>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="description" 
                  required 
                  value={form.description} 
                  onChange={handleChange} 
                  className="input" 
                  rows={4}
                  placeholder="Describe your property in detail..."
                  minLength={50}
                  maxLength={5000}
                />
                <span className="text-xs text-gray-500">{form.description.length}/5000 characters (min 50)</span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select name="propertyType" value={form.propertyType} onChange={handleChange} className="input" required>
                  <option value="HOUSE">House</option>
                  <option value="FLAT">Flat</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="VILLA">Villa</option>
                  <option value="PLOT">Plot</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Listing Type <span className="text-red-500">*</span>
                </label>
                <select name="propertyStatus" value={form.propertyStatus} onChange={handleChange} className="input" required>
                  <option value="FOR_SALE">For Sale</option>
                  <option value="FOR_RENT">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input 
                  name="price" 
                  required 
                  type="number" 
                  min="1"
                  value={form.price} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="Enter price in rupees"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input 
                  type="checkbox" 
                  name="negotiable" 
                  id="negotiable"
                  checked={form.negotiable} 
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <label htmlFor="negotiable" className="font-semibold text-gray-700">Price Negotiable</label>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
            <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <MapPin size={22} /> Location Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block font-semibold text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input 
                  name="address" 
                  required 
                  value={form.address} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input 
                  name="city" 
                  required 
                  value={form.city} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="e.g., Ranchi"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <input 
                  name="district" 
                  required 
                  value={form.district} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="e.g., Ranchi"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  State
                </label>
                <input 
                  name="state" 
                  value={form.state} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="e.g., Jharkhand"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Pincode</label>
                <input 
                  name="pincode" 
                  value={form.pincode} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="e.g., 834001"
                  pattern="[0-9]{6}"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Locality</label>
                <input 
                  name="locality" 
                  value={form.locality} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="e.g., Main Road"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block font-semibold text-gray-700 mb-1">Google Maps Link</label>
                <input 
                  name="mapLink" 
                  value={form.mapLink} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="Paste Google Maps link here"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Latitude</label>
                <input 
                  name="latitude" 
                  type="number"
                  step="any"
                  value={form.latitude} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="e.g., 23.3441"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Longitude</label>
                <input 
                  name="longitude" 
                  type="number"
                  step="any"
                  value={form.longitude} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="e.g., 85.3096"
                />
              </div>
            </div>
          </div>

          {/* Property Specifications */}
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200">
            <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
              <Bed size={22} /> Property Specifications
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Total Area (sq.ft) <span className="text-red-500">*</span>
                </label>
                <input 
                  name="totalArea" 
                  required 
                  type="number"
                  min="1"
                  value={form.totalArea} 
                  onChange={handleChange} 
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bedrooms</label>
                <input 
                  name="bedrooms" 
                  type="number"
                  min="0"
                  value={form.bedrooms} 
                  onChange={handleChange} 
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bathrooms</label>
                <input 
                  name="bathrooms" 
                  type="number"
                  min="0"
                  value={form.bathrooms} 
                  onChange={handleChange} 
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Total Floors</label>
                <input 
                  name="totalFloors" 
                  type="number"
                  min="0"
                  value={form.totalFloors} 
                  onChange={handleChange} 
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Floor Number</label>
                <input 
                  name="floorNumber" 
                  type="number"
                  min="0"
                  value={form.floorNumber} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="Which floor?"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Furnishing Status</label>
                <select name="furnishingStatus" value={form.furnishingStatus} onChange={handleChange} className="input">
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi-Furnished</option>
                  <option value="FURNISHED">Furnished</option>
                  <option value="FULLY_FURNISHED">Fully Furnished</option> {/* ✅ NEW */}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Property Age (years)</label>
                <input 
                  name="propertyAge" 
                  type="number"
                  min="0"
                  value={form.propertyAge} 
                  onChange={handleChange} 
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Facing Direction</label>
                <select name="facingDirection" value={form.facingDirection} onChange={handleChange} className="input">
                  <option value="NORTH">North</option>
                  <option value="SOUTH">South</option>
                  <option value="EAST">East</option>
                  <option value="WEST">West</option>
                  <option value="NORTH_EAST">North-East</option>
                  <option value="NORTH_WEST">North-West</option>
                  <option value="SOUTH_EAST">South-East</option>
                  <option value="SOUTH_WEST">South-West</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Availability Status</label>
                <select name="availabilityStatus" value={form.availabilityStatus} onChange={handleChange} className="input">
                  <option value="READY_TO_MOVE">Ready to Move</option>
                  <option value="UNDER_CONSTRUCTION">Under Construction</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="parkingAvailable"
                  id="parkingAvailable"
                  checked={form.parkingAvailable} 
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <label htmlFor="parkingAvailable" className="font-semibold text-gray-700">Parking Available</label>
              </div>

              {form.parkingAvailable && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Parking Spaces</label>
                  <input 
                    name="parkingSpaces" 
                    type="number" 
                    min="1" 
                    value={form.parkingSpaces} 
                    onChange={handleChange} 
                    className="input"
                  />
                </div>
              )}

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block font-semibold text-gray-700 mb-1">
                  Amenities <span className="text-xs text-gray-500">(Comma separated)</span>
                </label>
                <input 
                  name="amenities" 
                  value={form.amenities} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="e.g., Garden, Gym, Swimming Pool, Security"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
            <h2 className="text-xl font-bold text-orange-700 mb-4 flex items-center gap-2">
              <Award size={22} /> Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input 
                  name="contactName" 
                  required 
                  value={form.contactName} 
                  onChange={handleChange} 
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input 
                  name="contactPhone" 
                  required 
                  value={form.contactPhone} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input 
                  name="contactEmail" 
                  required 
                  type="email"
                  value={form.contactEmail} 
                  onChange={handleChange} 
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Posted By <span className="text-red-500">*</span>
                </label>
                <select name="postedByType" value={form.postedByType} onChange={handleChange} className="input" required>
                  <option value="OWNER">Owner</option>
                  <option value="DEALER">Dealer</option>
                  <option value="BUILDER">Builder</option>
                  <option value="AGENT">Agent</option> {/* ✅ NEW */}
                </select>
              </div>
            </div>
          </div>

          {/* Property Images Upload */}
          <div className="bg-pink-50 p-6 rounded-2xl border border-pink-200">
            <h2 className="text-xl font-bold text-pink-700 mb-4 flex items-center gap-2">
              <ImagePlus size={22} /> Property Images <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">Upload 1-10 images (Required)</p>
            
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-pink-300 p-8 rounded-2xl cursor-pointer hover:border-pink-500 hover:bg-pink-100 transition">
              <Upload className="text-pink-500 mb-2" size={40} />
              <span className="text-gray-600 font-semibold">Click to upload property images</span>
              <span className="text-sm text-gray-500 mt-1">{propertyImages.length}/10 uploaded</span>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handlePropertyImageUpload} 
                className="hidden" 
              />
            </label>

            <AnimatePresence>
              {propertyPreviews.length > 0 && (
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                >
                  {propertyPreviews.map((preview, index) => (
                    <motion.div 
                      key={index} 
                      className="relative group overflow-hidden rounded-xl shadow-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img 
                        src={preview.url} 
                        alt={preview.name} 
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <button 
                        type="button" 
                        onClick={() => removePropertyImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                      >
                        <XCircle size={18} />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                          Featured
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floor Plans Upload (Optional) */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200">
            <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
              <FileText size={22} /> Floor Plans (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">Upload up to 5 floor plan images</p>
            
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 p-8 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-100 transition">
              <Upload className="text-indigo-500 mb-2" size={40} />
              <span className="text-gray-600 font-semibold">Click to upload floor plans</span>
              <span className="text-sm text-gray-500 mt-1">{floorPlanImages.length}/5 uploaded</span>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFloorPlanUpload} 
                className="hidden" 
              />
            </label>

            <AnimatePresence>
              {floorPlanPreviews.length > 0 && (
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                >
                  {floorPlanPreviews.map((preview, index) => (
                    <motion.div 
                      key={index} 
                      className="relative group overflow-hidden rounded-xl shadow-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img 
                        src={preview.url} 
                        alt={preview.name} 
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <button 
                        type="button" 
                        onClick={() => removeFloorPlan(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                      >
                        <XCircle size={18} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} /> 
                Submitting Property...
              </>
            ) : (
              <>
                <Home size={24} />
                Submit Property Listing
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          background: #ffffff;
          border: 2px solid #e5e7eb;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
      `}</style>
    </motion.div>
  );
}
