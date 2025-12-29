import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  ArrowLeftCircle,
  LogOut,
  Filter,
  Download,
  Search,
  ChevronDown,
  X,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase,
  Users,
  TrendingUp,
  FileText,
  ExternalLink,
  Car,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const BASE_API = "https://api.jharkhandbiharupdates.com/api/v1";

export default function AllPropertiesAdmin() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/login");
    fetchProperties();
  }, [page, filterStatus]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `${BASE_API}/properties/admin/properties/all-with-creators?page=${page}&size=20&status=${filterStatus}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data.data;
      setProperties(data.content || []);
      setTotalPages(data.totalPages || 0);

      const total = data.totalElements || 0;
      const approved = data.content?.filter((p) => p.approvalStatus === "APPROVED").length || 0;
      const pending = data.content?.filter((p) => p.approvalStatus === "PENDING").length || 0;
      setStats({ total, approved, pending });
    } catch (error) {
      toast.error("Failed to fetch properties");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "ID",
        "Title",
        "Price",
        "Location",
        "Address",
        "Pincode",
        "Creator Name",
        "Creator Email",
        "Contact Name",
        "Contact Phone",
        "Posted By",
        "Status",
        "Created",
      ],
      ...filteredProperties.map((prop) => [
        prop.propertyId,
        prop.title,
        prop.price,
        `${prop.city}, ${prop.state}`,
        prop.address || "N/A",
        prop.pincode || "N/A",
        prop.creator?.name || "N/A",
        prop.creator?.email || "N/A",
        prop.contact?.name || "N/A",
        prop.contact?.phone || "N/A",
        prop.contact?.postedByType || "N/A",
        prop.approvalStatus,
        new Date(prop.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `properties-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const filteredProperties = properties.filter((prop) =>
    [
      prop.title,
      prop.city,
      prop.state,
      prop.address,
      prop.pincode,
      prop.creator?.name,
      prop.creator?.email,
      prop.contact?.name,
      prop.contact?.phone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      APPROVED: "bg-green-100 text-green-700 border-green-300",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
      REJECTED: "bg-red-100 text-red-700 border-red-300",
    };

    const icons = {
      APPROVED: <CheckCircle size={14} />,
      PENDING: <Clock size={14} />,
      REJECTED: <XCircle size={14} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
      >
        {icons[status]}
        {status}
      </span>
    );
  };

  const getPostedByBadge = (type) => {
    const styles = {
      OWNER: "bg-blue-100 text-blue-700",
      AGENT: "bg-purple-100 text-purple-700",
      BUILDER: "bg-orange-100 text-orange-700",
      DEALER: "bg-pink-100 text-pink-700",
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
        {type}
      </span>
    );
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    const priceNum = Number(price);
    if (priceNum >= 10000000) return `₹${(priceNum / 10000000).toFixed(2)}Cr`;
    if (priceNum >= 100000) return `₹${(priceNum / 100000).toFixed(2)}L`;
    return `₹${priceNum.toLocaleString()}`;
  };

  if (loading && page === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-gray-700 hover:text-blue-700 transition-colors"
            >
              <ArrowLeftCircle size={26} className="mr-2" />
              <span className="hidden sm:inline font-semibold">Back</span>
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-800">All Properties</h1>
              <p className="text-sm text-gray-600">View properties with creator & contact details</p>
            </div>
          </div>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-lg shadow-sm font-medium transition-all"
          >
            <LogOut size={18} className="mr-1" /> Logout
          </motion.button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Properties</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                <p className="text-xs opacity-75 mt-1">All listings</p>
              </div>
              <Home size={40} className="opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Approved</p>
                <p className="text-3xl font-bold mt-1">{stats.approved}</p>
                <p className="text-xs opacity-75 mt-1">Live on site</p>
              </div>
              <CheckCircle size={40} className="opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending</p>
                <p className="text-3xl font-bold mt-1">{stats.pending}</p>
                <p className="text-xs opacity-75 mt-1">Awaiting approval</p>
              </div>
              <Clock size={40} className="opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by property, creator, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            <motion.button
              onClick={exportToCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
            >
              <Download size={18} />
              Export CSV
            </motion.button>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-blue-500">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-blue-500">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-blue-500">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-blue-500">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-blue-500">
                    Creator
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-blue-500">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-blue-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                      <Home size={48} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No properties found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((property, index) => (
                    <motion.tr
                      key={property.propertyId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 border-r border-gray-200">
                        #{property.propertyId}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <div className="flex items-center gap-3">
                          {property.mainImageUrl ? (
                            <img
                              src={property.mainImageUrl}
                              alt={property.title}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                              <Home size={24} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {property.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{property.propertyType}</span>
                              {property.contact?.postedByType && (
                                <>{getPostedByBadge(property.contact.postedByType)}</>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                          <DollarSign size={14} className="text-green-600" />
                          {formatPrice(property.price)}
                        </div>
                        {property.negotiable && (
                          <span className="text-xs text-green-600">Negotiable</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <div className="flex items-start gap-1">
                          <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-gray-700">
                            <p className="font-medium">{property.city}</p>
                            <p className="text-xs text-gray-500">{property.state}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            <User size={12} className="text-blue-600" />
                            {property.creator?.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            <Mail size={12} className="text-gray-400" />
                            {property.creator?.email || "N/A"}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            {property.creator?.role || "USER"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{property.contact?.name || "N/A"}</p>
                          {property.contact?.phone ? (
                            <a
                              href={`tel:${property.contact.phone}`}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                            >
                              <Phone size={12} />
                              {property.contact.phone}
                            </a>
                          ) : (
                            <p className="text-xs text-gray-400 mt-1">No phone</p>
                          )}
                          {property.contact?.email && (
                            <p className="text-xs text-gray-600 mt-1">{property.contact.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <div className="flex flex-col gap-2">
                          {getStatusBadge(property.approvalStatus)}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye size={12} />
                            {property.viewCount || 0} views
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <motion.button
                            onClick={() => {
                              setSelectedProperty(property);
                              setShowDetailsModal(true);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedProperty && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProperty.title}</h2>
                  <p className="text-sm opacity-90 mt-1">Property ID: #{selectedProperty.propertyId}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Property Images Gallery */}
                {selectedProperty.imageUrls && selectedProperty.imageUrls.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="text-blue-600" size={20} />
                      Property Images
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedProperty.imageUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Property ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(selectedProperty.price)}</p>
                    {selectedProperty.negotiable && (
                      <span className="text-xs text-green-600 font-medium">✓ Negotiable</span>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProperty.city}, {selectedProperty.state}
                    </p>
                    <p className="text-sm text-gray-600">{selectedProperty.district}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Type</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedProperty.propertyType}</p>
                    <p className="text-sm text-gray-600">{selectedProperty.propertyStatus}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    {getStatusBadge(selectedProperty.approvalStatus)}
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                      <Eye size={14} />
                      {selectedProperty.viewCount || 0} views
                    </p>
                  </div>
                </div>

                {/* 🆕 FULL ADDRESS & PINCODE SECTION */}
                {(selectedProperty.address || selectedProperty.pincode || selectedProperty.locality) && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="text-red-600" size={20} />
                      Full Address Details
                    </h3>
                    <div className="bg-red-50 p-4 rounded-lg space-y-3">
                      {selectedProperty.address && (
                        <div>
                          <p className="text-xs text-gray-600 uppercase font-semibold">Complete Address</p>
                          <p className="text-gray-900 font-medium mt-1">{selectedProperty.address}</p>
                        </div>
                      )}
                      {selectedProperty.locality && (
                        <div>
                          <p className="text-xs text-gray-600 uppercase font-semibold">Locality</p>
                          <p className="text-gray-900 font-medium mt-1">{selectedProperty.locality}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-red-200">
                        {selectedProperty.city && (
                          <div>
                            <p className="text-xs text-gray-600">City</p>
                            <p className="font-semibold text-gray-900">{selectedProperty.city}</p>
                          </div>
                        )}
                        {selectedProperty.district && (
                          <div>
                            <p className="text-xs text-gray-600">District</p>
                            <p className="font-semibold text-gray-900">{selectedProperty.district}</p>
                          </div>
                        )}
                        {selectedProperty.state && (
                          <div>
                            <p className="text-xs text-gray-600">State</p>
                            <p className="font-semibold text-gray-900">{selectedProperty.state}</p>
                          </div>
                        )}
                        {selectedProperty.pincode && (
                          <div>
                            <p className="text-xs text-gray-600">Pincode</p>
                            <p className="font-semibold text-gray-900">{selectedProperty.pincode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 🆕 MAP SECTION - PropertyDetails Style */}
                {(selectedProperty.mapLink || (selectedProperty.latitude && selectedProperty.longitude)) && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="text-blue-600" size={20} />
                      Location
                    </h3>

                    {selectedProperty.mapLink && (
                      <a
                        href={selectedProperty.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition mb-4"
                      >
                        <ExternalLink size={18} />
                        Open in Google Maps
                      </a>
                    )}

                    {selectedProperty.latitude && selectedProperty.longitude && (
                      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 mt-4">
                        <iframe
                          src={`https://maps.google.com/maps?q=${selectedProperty.latitude},${selectedProperty.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          title="Property Location"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Property Specifications */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="text-purple-600" size={20} />
                    Property Specifications
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedProperty.bedrooms && (
                      <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-200">
                        <p className="text-2xl font-bold text-purple-600">{selectedProperty.bedrooms}</p>
                        <p className="text-xs text-gray-600 mt-1">Bedrooms</p>
                      </div>
                    )}
                    {selectedProperty.bathrooms && (
                      <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                        <p className="text-2xl font-bold text-blue-600">{selectedProperty.bathrooms}</p>
                        <p className="text-xs text-gray-600 mt-1">Bathrooms</p>
                      </div>
                    )}
                    {selectedProperty.totalArea && (
                      <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                        <p className="text-2xl font-bold text-green-600">{selectedProperty.totalArea}</p>
                        <p className="text-xs text-gray-600 mt-1">Sq.ft Area</p>
                      </div>
                    )}
                    {selectedProperty.parkingSpaces && (
                      <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-200">
                        <p className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                          <Car size={20} /> {selectedProperty.parkingSpaces}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Parking</p>
                      </div>
                    )}
                    {selectedProperty.totalFloors && (
                      <div className="bg-indigo-50 p-3 rounded-lg text-center border border-indigo-200">
                        <p className="text-2xl font-bold text-indigo-600 flex items-center justify-center gap-1">
                          <Layers size={20} /> {selectedProperty.totalFloors}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Total Floors</p>
                      </div>
                    )}
                    {selectedProperty.floorNumber && (
                      <div className="bg-pink-50 p-3 rounded-lg text-center border border-pink-200">
                        <p className="text-2xl font-bold text-pink-600">{selectedProperty.floorNumber}</p>
                        <p className="text-xs text-gray-600 mt-1">Floor No.</p>
                      </div>
                    )}
                    {selectedProperty.propertyAge && (
                      <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-200">
                        <p className="text-2xl font-bold text-orange-600">{selectedProperty.propertyAge}</p>
                        <p className="text-xs text-gray-600 mt-1">Years Old</p>
                      </div>
                    )}
                    {selectedProperty.facingDirection && (
                      <div className="bg-teal-50 p-3 rounded-lg text-center border border-teal-200">
                        <p className="text-sm font-bold text-teal-600">{selectedProperty.facingDirection}</p>
                        <p className="text-xs text-gray-600 mt-1">Facing</p>
                      </div>
                    )}
                  </div>

                  {/* Additional Property Details */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {selectedProperty.furnishingStatus && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">Furnishing Status</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedProperty.furnishingStatus}</p>
                      </div>
                    )}
                    {selectedProperty.availabilityStatus && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">Availability</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedProperty.availabilityStatus}</p>
                      </div>
                    )}
                    {selectedProperty.parkingAvailable !== undefined && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">Parking Available</p>
                        <p className={`font-semibold mt-1 ${selectedProperty.parkingAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProperty.parkingAvailable ? '✓ Yes' : '✗ No'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Amenities & Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-300"
                        >
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Floor Plans */}
                {selectedProperty.floorPlanUrls && selectedProperty.floorPlanUrls.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Floor Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedProperty.floorPlanUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Floor Plan ${idx + 1}`}
                          className="w-full rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-all cursor-pointer"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Creator Info */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="text-blue-600" size={20} />
                    Posted By (Creator)
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedProperty.creator?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedProperty.creator?.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <span className="inline-block mt-1 px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full font-medium">
                          {selectedProperty.creator?.role || "USER"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Phone className="text-green-600" size={20} />
                    Contact Details (Property Owner/Agent)
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedProperty.contact?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        {selectedProperty.contact?.phone ? (
                          <a
                            href={`tel:${selectedProperty.contact.phone}`}
                            className="font-semibold text-green-600 hover:text-green-800 mt-1 inline-block"
                          >
                            📞 {selectedProperty.contact.phone}
                          </a>
                        ) : (
                          <p className="text-gray-400 mt-1">Not provided</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedProperty.contact?.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Posted By Type</p>
                        <div className="mt-1">
                          {selectedProperty.contact?.postedByType && (
                            <>{getPostedByBadge(selectedProperty.contact.postedByType)}</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedProperty.description && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {selectedProperty.description}
                    </p>
                  </div>
                )}

                {/* Dates */}
                <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-xs">Created Date</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {new Date(selectedProperty.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-xs">Last Updated</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {new Date(selectedProperty.updatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl flex gap-3 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                {selectedProperty.contact?.phone && (
                  <a
                    href={`tel:${selectedProperty.contact.phone}`}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <Phone size={18} />
                    Call Owner
                  </a>
                )}
                {selectedProperty.mapLink && (
                  <a
                    href={selectedProperty.mapLink}
                    target="__blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <MapPin size={18} />
                    View Map
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
