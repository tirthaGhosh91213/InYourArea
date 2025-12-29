import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Home,
  Phone,
  Mail,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Eye,
  Building,
  Car,
  Check,
  User,
  ArrowLeft,
  ExternalLink,
  Maximize2,
} from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import Loader from "../components/Loader";


export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Image gallery states
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // UI states
  const [isSaved, setIsSaved] = useState(false);

  // ✅ AUTHENTICATION CHECK - Must be logged in to view property details
  useEffect(() => {
    const checkAuthentication = () => {
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        console.warn("⚠️ No authentication token found. Redirecting to login...");
        navigate("/login", { 
          replace: true,
          state: { 
            from: `/properties/${id}`,
            message: "Please login to view property details" 
          }
        });
        return false;
      }
      return true;
    };

    // ✅ Check authentication before fetching data
    const isAuthenticated = checkAuthentication();
    
    if (isAuthenticated) {
      fetchPropertyDetails();
    }
  }, [id, navigate]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      const accessToken = localStorage.getItem("accessToken");
      
      const response = await fetch(
        `https://api.jharkhandbiharupdates.com/api/v1/properties/${id}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      // ✅ Handle unauthorized access (token expired/invalid)
      if (response.status === 401 || response.status === 403) {
        console.error("❌ Unauthorized access. Token may be expired.");
        localStorage.removeItem("accessToken");
        navigate("/login", { 
          replace: true,
          state: { 
            from: `/properties/${id}`,
            message: "Session expired. Please login again." 
          }
        });
        return;
      }

      const data = await response.json();

      if (data.success) {
        setProperty(data.data);
      } else {
        setError("Property not found");
      }
    } catch (err) {
      console.error("Error fetching property:", err);
      setError("Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    const num = parseFloat(price);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ View Count Validation
  const isValidViewCount = (count) => {
    return typeof count === "number" && count >= 0;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const nextImage = () => {
    if (property.imageUrls) {
      setSelectedImage((prev) =>
        prev === property.imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property.imageUrls) {
      setSelectedImage((prev) =>
        prev === 0 ? property.imageUrls.length - 1 : prev - 1
      );
    }
  };

  // ✅ Check if Property Overview section has any data
  const hasPropertyOverview = () => {
    return (
      property.totalArea ||
      property.bedrooms ||
      property.bathrooms ||
      property.parkingAvailable
    );
  };

  // ✅ Check if Property Details section has any data
  const hasPropertyDetails = () => {
    return (
      property.propertyType ||
      property.furnishingStatus ||
      property.totalFloors ||
      property.floorNumber ||
      property.propertyAge ||
      property.facingDirection ||
      property.availabilityStatus ||
      property.postedByType
    );
  };

  // Loading State
  if (loading) {
    return (
      <>
        <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
          <RightSidebar />
        </div>
        <div className="flex min-h-screen bg-gray-50 pt-16">
          <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
            <Sidebar />
          </div>
          <div className="flex-1 lg:ml-64 flex items-center justify-center">
            <Loader />
          </div>
        </div>
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
          <RightSidebar />
        </div>
        <div className="flex min-h-screen bg-gray-50 pt-16">
          <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
            <Sidebar />
          </div>
          <div className="flex-1 lg:ml-64 flex flex-col items-center justify-center p-8">
            <Building className="text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">{error}</h2>
            <button
              onClick={() => navigate("/properties")}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </>
    );
  }

  const allImages = property.imageUrls || [];
  const hasImages = allImages.length > 0;

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar />
      </div>

      <div className="flex min-h-screen bg-gray-50 pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pb-12">
          {/* Back Button */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <button
              onClick={() => navigate("/properties")}
              className="flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition"
            >
              <ArrowLeft size={20} />
              Back to Properties
            </button>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section with Title and Actions */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    {property.title}
                  </h1>
                  
                  {/* ✅ Only show location if address exists */}
                  {property.address && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin size={18} className="text-green-600 flex-shrink-0" />
                      <p className="text-sm md:text-base">
                        {property.address}
                        {property.locality && `, ${property.locality}`}
                        {property.city && `, ${property.city}`}
                        {property.district && `, ${property.district}`}
                        {property.state && `, ${property.state}`}
                        {property.pincode && ` - ${property.pincode}`}
                      </p>
                    </div>
                  )}

                  {/* ✅ Only show metadata if at least one exists */}
                  {(isValidViewCount(property.viewCount) || property.createdAt) && (
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {isValidViewCount(property.viewCount) && (
                        <span className="flex items-center gap-1">
                          <Eye size={16} />
                          {property.viewCount} views
                        </span>
                      )}
                      {property.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          Posted {formatDate(property.createdAt)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition"
                  >
                    <Share2 size={20} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`p-3 rounded-lg border-2 transition ${
                      isSaved
                        ? "bg-red-50 border-red-500"
                        : "bg-white border-gray-200 hover:border-red-500 hover:bg-red-50"
                    }`}
                  >
                    <Heart
                      size={20}
                      className={isSaved ? "text-red-500" : "text-gray-700"}
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8">
              {/* Main Large Image */}
              <div
                className="lg:col-span-3 relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gray-200 cursor-pointer group"
                onClick={() => hasImages && setShowLightbox(true)}
              >
                {hasImages ? (
                  <>
                    <img
                      src={allImages[selectedImage]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Maximize2 size={18} />
                      View All {allImages.length} Photos
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                    <Home size={80} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Side Thumbnails - ✅ Only show if images exist */}
              {hasImages && allImages.length > 1 && (
                <div className="hidden lg:flex lg:flex-col gap-3">
                  {allImages.slice(1, 4).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedImage(idx + 1);
                        setShowLightbox(true);
                      }}
                      className="relative h-[calc(33.333%-0.5rem)] rounded-xl overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx + 2}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {idx === 2 && allImages.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl">
                          +{allImages.length - 4} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Property Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Price and Status - ✅ Only show if price exists */}
                {property.price && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {formatPrice(property.price)}
                          {property.negotiable && (
                            <span className="text-sm text-green-600 font-normal ml-2">
                              Negotiable
                            </span>
                          )}
                        </div>
                        {property.propertyStatus && (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              property.propertyStatus === "FOR_SALE"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {property.propertyStatus === "FOR_SALE"
                              ? "For Sale"
                              : "For Rent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Property Specs - ✅ Only show if any spec exists */}
                {hasPropertyOverview() && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Property Overview
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {property.totalArea && (
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                          <Square size={24} className="text-green-600 mb-2" />
                          <span className="text-sm text-gray-600">Area</span>
                          <span className="font-bold text-gray-900">
                            {property.totalArea} sq.ft
                          </span>
                        </div>
                      )}
                      {property.bedrooms && (
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                          <Bed size={24} className="text-green-600 mb-2" />
                          <span className="text-sm text-gray-600">Bedrooms</span>
                          <span className="font-bold text-gray-900">
                            {property.bedrooms}
                          </span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                          <Bath size={24} className="text-green-600 mb-2" />
                          <span className="text-sm text-gray-600">Bathrooms</span>
                          <span className="font-bold text-gray-900">
                            {property.bathrooms}
                          </span>
                        </div>
                      )}
                      {property.parkingAvailable && (
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                          <Car size={24} className="text-green-600 mb-2" />
                          <span className="text-sm text-gray-600">Parking</span>
                          <span className="font-bold text-gray-900">
                            {property.parkingSpaces || "Yes"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description - ✅ Only show if description exists */}
                {property.description && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Description
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Property Details Grid - ✅ Only show if any detail exists */}
                {hasPropertyDetails() && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Property Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <DetailRow
                        label="Property Type"
                        value={property.propertyType}
                      />
                      <DetailRow
                        label="Furnishing"
                        value={property.furnishingStatus?.replace("_", " ")}
                      />
                      {property.totalFloors && (
                        <DetailRow
                          label="Total Floors"
                          value={property.totalFloors}
                        />
                      )}
                      {property.floorNumber && (
                        <DetailRow
                          label="Floor Number"
                          value={property.floorNumber}
                        />
                      )}
                      {property.propertyAge && (
                        <DetailRow
                          label="Property Age"
                          value={`${property.propertyAge} years`}
                        />
                      )}
                      {property.facingDirection && (
                        <DetailRow
                          label="Facing"
                          value={property.facingDirection.replace("_", "-")}
                        />
                      )}
                      {property.availabilityStatus && (
                        <DetailRow
                          label="Availability"
                          value={property.availabilityStatus.replace("_", " ")}
                        />
                      )}
                      <DetailRow
                        label="Posted By"
                        value={property.postedByType}
                      />
                    </div>
                  </div>
                )}

                {/* Amenities - ✅ Only show if amenities exist */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Amenities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {property.amenities.map((amenity, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check size={16} className="text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium">
                            {amenity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Floor Plans - ✅ Only show if floor plans exist */}
                {property.floorPlanUrls && property.floorPlanUrls.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Floor Plans
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.floorPlanUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-green-600 transition group"
                          onClick={() => window.open(url, "_blank")}
                        >
                          <img
                            src={url}
                            alt={`Floor Plan ${idx + 1}`}
                            className="w-full h-auto"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                            <ExternalLink
                              size={24}
                              className="text-white opacity-0 group-hover:opacity-100 transition"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location - ✅ Only show if location data exists */}
                {(property.address || property.mapLink || (property.latitude && property.longitude)) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Location
                    </h2>
                    
                    {property.address && (
                      <div className="mb-4">
                        <p className="text-gray-700 flex items-start gap-2">
                          <MapPin
                            size={18}
                            className="text-green-600 mt-1 flex-shrink-0"
                          />
                          <span>
                            {property.address}
                            {property.locality && `, ${property.locality}`}
                            <br />
                            {property.city && `${property.city}, `}
                            {property.district && `${property.district}, `}
                            {property.state}
                            {property.pincode && ` - ${property.pincode}`}
                          </span>
                        </p>
                      </div>
                    )}

                    {property.mapLink && (
                      <a
                        href={property.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition mb-4"
                      >
                        <ExternalLink size={18} />
                        Open in Google Maps
                      </a>
                    )}

                    {property.latitude && property.longitude && (
                      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 mt-4">
                        <iframe
                          src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          aria-hidden="false"
                          tabIndex="0"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Contact Sidebar - ✅ Only show if contact info exists */}
              {(property.contactName || property.contactPhone || property.contactEmail) && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Contact Agent
                    </h3>

                    {/* Agent Info */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={32} className="text-white" />
                        </div>
                        <div>
                          {property.contactName && (
                            <h4 className="font-bold text-gray-900 text-lg">
                              {property.contactName}
                            </h4>
                          )}
                          {property.postedByType && (
                            <p className="text-sm text-gray-600">
                              {property.postedByType}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Phone - ✅ Only show if exists */}
                        {property.contactPhone && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Phone size={18} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600">Phone</p>
                              <a
                                href={`tel:${property.contactPhone}`}
                                className="font-semibold text-gray-900 hover:text-green-600 transition truncate block"
                              >
                                {property.contactPhone}
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Email - ✅ Only show if exists */}
                        {property.contactEmail && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Mail size={18} className="text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600">Email</p>
                              <a
                                href={`mailto:${property.contactEmail}`}
                                className="font-semibold text-gray-900 hover:text-green-600 transition truncate block text-sm"
                              >
                                {property.contactEmail}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {property.contactPhone && (
                        <a
                          href={`tel:${property.contactPhone}`}
                          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <Phone size={20} />
                          Call Now
                        </a>
                      )}
                      {property.contactEmail && (
                        <a
                          href={`mailto:${property.contactEmail}`}
                          className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:border-green-600 hover:text-green-600 transition flex items-center justify-center gap-2"
                        >
                          <Mail size={20} />
                          Send Email
                        </a>
                      )}
                    </div>

                    {/* Property ID */}
                    {property.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Property ID</p>
                        <p className="font-bold text-gray-900">#{property.id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && hasImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
            >
              <X size={32} />
            </button>

            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={allImages[selectedImage]}
                alt="Property"
                className="max-w-full max-h-full object-contain"
              />

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 bg-white/20 hover:bg-white/30 p-3 rounded-full transition backdrop-blur-sm"
                  >
                    <ChevronLeft size={32} className="text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 bg-white/20 hover:bg-white/30 p-3 rounded-full transition backdrop-blur-sm"
                  >
                    <ChevronRight size={32} className="text-white" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                {selectedImage + 1} / {allImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper Component
function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
