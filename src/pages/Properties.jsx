import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Home,
  Building2,
  ChevronDown,
  Filter,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    propertyType: "ALL",
    location: "ALL",
    minPrice: "",
    maxPrice: "",
    bedrooms: "ALL",
    propertyStatus: "ALL",
  });
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters, searchQuery, sortBy]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://api.jharkhandbiharupdates.com/api/v1/properties?t=${timestamp}`
      );
      const data = await response.json();

      if (data.success) {
        const approved = (data.data || []).filter(
          (prop) => prop.status === "APPROVED"
        );
        console.log("✅ Fetched properties:", approved);
        setProperties(approved);
        setFilteredProperties(approved);
      } else {
        setError("Failed to load properties");
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check if property is sold/rented
  const isSoldOrRented = (property) => {
    const status = property.propertyStatus?.toUpperCase();
    return status === "SOLD" || status === "RENTED";
  };

  // ✅ FIXED: Proper filtering and sorting with SOLD/RENTED at bottom
  const applyFilters = () => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (prop) =>
          prop.title?.toLowerCase().includes(query) ||
          prop.city?.toLowerCase().includes(query) ||
          prop.district?.toLowerCase().includes(query) ||
          prop.locality?.toLowerCase().includes(query) ||
          prop.address?.toLowerCase().includes(query)
      );
    }

    // Property Type filter
    if (filters.propertyType !== "ALL") {
      filtered = filtered.filter(
        (prop) => prop.propertyType === filters.propertyType
      );
    }

    // Location filter
    if (filters.location !== "ALL") {
      filtered = filtered.filter(
        (prop) =>
          prop.city === filters.location || prop.district === filters.location
      );
    }

    // Price filter
    if (filters.minPrice) {
      filtered = filtered.filter(
        (prop) => parseFloat(prop.price) >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (prop) => parseFloat(prop.price) <= parseFloat(filters.maxPrice)
      );
    }

    // Bedrooms filter
    if (filters.bedrooms !== "ALL") {
      filtered = filtered.filter(
        (prop) => prop.bedrooms === parseInt(filters.bedrooms)
      );
    }

    // Property Status filter
    if (filters.propertyStatus !== "ALL") {
      filtered = filtered.filter(
        (prop) => prop.propertyStatus === filters.propertyStatus
      );
    }

    // ✅ CRITICAL FIX: Separate available and sold/rented properties
    const available = filtered.filter((prop) => !isSoldOrRented(prop));
    const soldOrRented = filtered.filter((prop) => isSoldOrRented(prop));

    // ✅ Sort each group independently
    if (sortBy === "price-low") {
      available.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      soldOrRented.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "price-high") {
      available.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      soldOrRented.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === "recent") {
      available.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      soldOrRented.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    // ✅ Combine: Available properties FIRST, then Sold/Rented LAST
    filtered = [...available, ...soldOrRented];

    // Debug log
    console.log("🔍 Properties after filtering:", {
      total: filtered.length,
      available: available.length,
      soldOrRented: soldOrRented.length,
      firstProperty: filtered[0]
        ? `${filtered[0].title} - ${filtered[0].propertyStatus}`
        : "None",
      lastProperty: filtered[filtered.length - 1]
        ? `${filtered[filtered.length - 1].title} - ${filtered[filtered.length - 1].propertyStatus}`
        : "None",
    });

    setFilteredProperties(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      propertyType: "ALL",
      location: "ALL",
      minPrice: "",
      maxPrice: "",
      bedrooms: "ALL",
      propertyStatus: "ALL",
    });
    setSearchQuery("");
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    const num = parseFloat(price);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const getUniqueLocations = () => {
    const locations = new Set();
    properties.forEach((prop) => {
      if (prop.city) locations.add(prop.city);
      if (prop.district && prop.district !== prop.city)
        locations.add(prop.district);
    });
    return Array.from(locations).sort();
  };

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar />
      </div>

      <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl md:text-5xl font-extrabold">
                  Find the space <span className="inline-block">🏡</span>
                </h1>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-green-100 mb-4">
                that feels like home!
              </h2>
              <p className="text-lg text-white/90 max-w-3xl">
                Welcome to our full collection of verified properties — updated
                daily, priced transparently, and ready to view. Use the smart
                filters to narrow your search by location, price, size, or
                features, and book tours instantly with just a few clicks.
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white shadow-md border-b border-gray-200 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Looking for (Property Type) */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Looking for
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) =>
                      handleFilterChange("propertyType", e.target.value)
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 appearance-none cursor-pointer bg-white"
                  >
                    <option value="ALL">All Types</option>
                    <option value="HOUSE">House</option>
                    <option value="FLAT">Flat</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa</option>
                    <option value="PLOT">Plot</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-9 text-gray-500 pointer-events-none"
                    size={18}
                  />
                </div>

                {/* Location */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 appearance-none cursor-pointer bg-white"
                  >
                    <option value="ALL">All Locations</option>
                    {getUniqueLocations().map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-9 text-gray-500 pointer-events-none"
                    size={18}
                  />
                </div>

                {/* Price */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Features (Bedrooms) */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) =>
                      handleFilterChange("bedrooms", e.target.value)
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 appearance-none cursor-pointer bg-white"
                  >
                    <option value="ALL">Any</option>
                    <option value="1">1 Bed</option>
                    <option value="2">2 Beds</option>
                    <option value="3">3 Beds</option>
                    <option value="4">4+ Beds</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-9 text-gray-500 pointer-events-none"
                    size={18}
                  />
                </div>

                {/* Status */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.propertyStatus}
                    onChange={(e) =>
                      handleFilterChange("propertyStatus", e.target.value)
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 appearance-none cursor-pointer bg-white"
                  >
                    <option value="ALL">All Status</option>
                    <option value="FOR_SALE">For Sale</option>
                    <option value="FOR_RENT">For Rent</option>
                    {/* <option value="SOLD">Sold</option>
                    <option value="RENTED">Rented</option> */}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-9 text-gray-500 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* Search & Clear */}
              <div className="flex gap-3 mt-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by title, location, locality..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                >
                  <X size={18} /> Clear
                </button>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Properties in{" "}
                  {filters.location !== "ALL"
                    ? filters.location
                    : "All Locations"}
                </h3>
                <p className="text-gray-600">
                  ({filteredProperties.length} results)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">
                  Sort by
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 cursor-pointer bg-white"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl">
                {error}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredProperties.length === 0 && (
              <div className="text-center py-20">
                <Building2 className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Property Grid */}
            {!loading && !error && filteredProperties.length > 0 && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredProperties.map((property) => {
                  const soldOrRented = isSoldOrRented(property);

                  return (
                    <motion.div
                      key={property.id}
                      whileHover={{ y: soldOrRented ? 0 : -5 }}
                      className={`bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer border border-gray-100 transition-all duration-300 ${
                        soldOrRented
                          ? "opacity-60 hover:shadow-lg"
                          : "hover:shadow-2xl"
                      }`}
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      {/* Property Image */}
                      <div className="relative h-64 overflow-hidden bg-gray-200">
                        {property.imageUrls && property.imageUrls.length > 0 ? (
                          <img
                            src={property.imageUrls[0]}
                            alt={property.title}
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                              soldOrRented
                                ? "grayscale-[50%] brightness-90"
                                : "hover:scale-110"
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 ${
                              soldOrRented ? "grayscale-[50%]" : ""
                            }`}
                          >
                            <Home size={64} className="text-gray-400" />
                          </div>
                        )}

                        {/* ✅ Diagonal Stamp for SOLD/RENTED */}
                        {soldOrRented && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div
                              className={`${
                                property.propertyStatus?.toUpperCase() === "SOLD"
                                  ? "bg-red-600"
                                  : "bg-orange-600"
                              } text-white font-black text-3xl md:text-4xl px-8 md:px-12 py-2 md:py-3 rotate-[-30deg] shadow-2xl border-4 border-white opacity-95`}
                              style={{
                                letterSpacing: "0.2em",
                                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                              }}
                            >
                              {property.propertyStatus?.toUpperCase() === "SOLD"
                                ? "SOLD"
                                : "RENTED"}
                            </div>
                          </div>
                        )}

                        {/* Status Badge - Only for FOR_SALE/FOR_RENT */}
                        {!soldOrRented && (
                          <div className="absolute top-4 right-4 z-10">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                                property.propertyStatus === "FOR_SALE"
                                  ? "bg-blue-600 text-white"
                                  : "bg-orange-600 text-white"
                              }`}
                            >
                              {property.propertyStatus === "FOR_SALE"
                                ? "For Sale"
                                : "For Rent"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="p-5">
                        {/* Title */}
                        <h3
                          className={`text-xl font-bold mb-2 break-words line-clamp-2 ${
                            soldOrRented ? "text-gray-500" : "text-gray-800"
                          }`}
                        >
                          {property.title}
                        </h3>

                        {/* Location */}
                        <div
                          className={`flex items-center mb-4 ${
                            soldOrRented ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <MapPin
                            size={16}
                            className={`mr-1 flex-shrink-0 ${
                              soldOrRented ? "text-gray-400" : "text-green-600"
                            }`}
                          />
                          <span className="text-sm line-clamp-1">
                            {property.city}, {property.district}
                          </span>
                        </div>

                        {/* Property Features */}
                        <div
                          className={`flex items-center gap-4 text-sm mb-4 flex-wrap ${
                            soldOrRented ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {property.totalArea && (
                            <div className="flex items-center gap-1">
                              <Square
                                size={16}
                                className={
                                  soldOrRented
                                    ? "text-gray-400"
                                    : "text-green-600"
                                }
                              />
                              <span>{property.totalArea} sq.ft</span>
                            </div>
                          )}
                          {property.bedrooms && (
                            <div className="flex items-center gap-1">
                              <Bed
                                size={16}
                                className={
                                  soldOrRented
                                    ? "text-gray-400"
                                    : "text-green-600"
                                }
                              />
                              <span>{property.bedrooms} Beds</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center gap-1">
                              <Bath
                                size={16}
                                className={
                                  soldOrRented
                                    ? "text-gray-400"
                                    : "text-green-600"
                                }
                              />
                              <span>{property.bathrooms} Baths</span>
                            </div>
                          )}
                        </div>

                        {/* Price & Button */}
                        <div className="flex items-center justify-between">
                          {/* Price with strikethrough if sold/rented */}
                          <div
                            className={`text-2xl font-bold ${
                              soldOrRented
                                ? "text-gray-400 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {formatPrice(property.price)}
                          </div>
                          <button
                            className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-full transition ${
                              soldOrRented
                                ? "bg-gray-200 text-gray-500 cursor-default"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            View Details
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
