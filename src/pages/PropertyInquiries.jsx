import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  User,
  Home,
  Calendar,
  Eye,
  ArrowLeftCircle,
  LogOut,
  Filter,
  Download,
  Search,
  ChevronDown,
  MessageSquare,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const BASE_API = "https://api.jharkhandbiharupdates.com/api/v1";

export default function PropertyInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ newCount: 0, clickedCount: 0 });
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/login");
    fetchInquiries();
    fetchStats();
  }, [page, filterStatus]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      let endpoint = `${BASE_API}/admin/inquiries?page=${page}&size=20`;
      if (filterStatus !== "ALL") {
        endpoint = `${BASE_API}/admin/inquiries/status/${filterStatus}?page=${page}&size=20`;
      }

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInquiries(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (error) {
      toast.error("Failed to fetch inquiries");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${BASE_API}/admin/inquiries/counts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data.data || { newCount: 0, clickedCount: 0 });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleStatusUpdate = async (inquiryId, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `${BASE_API}/admin/inquiries/${inquiryId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Status updated successfully!");
      fetchInquiries();
      fetchStats();
      setShowStatusModal(false);
      setSelectedInquiry(null);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleDelete = async (inquiryId) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${BASE_API}/admin/inquiries/${inquiryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Inquiry deleted!");
      fetchInquiries();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete inquiry");
      console.error(error);
    }
  };

  // ✅ FIXED: Updated to use direct fields
  const exportToCSV = () => {
    const csvContent = [
      ["ID", "User Name", "User Email", "Phone", "Property", "Status", "Date"],
      ...filteredInquiries.map((inq) => [
        inq.id,
        inq.userName || "N/A",
        inq.userEmail || "N/A",
        inq.phoneNumber || "Not Provided",
        inq.propertyTitle || "N/A",
        inq.status,
        new Date(inq.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `property-inquiries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // ✅ FIXED: Updated to use direct fields
  const filteredInquiries = inquiries.filter((inq) =>
    [
      inq.userName,
      inq.userEmail,
      inq.phoneNumber,
      inq.propertyTitle,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      NEW: "bg-green-100 text-green-700 border-green-300",
      CLICKED: "bg-yellow-100 text-yellow-700 border-yellow-300",
      CONTACTED: "bg-blue-100 text-blue-700 border-blue-300",
      INTERESTED: "bg-purple-100 text-purple-700 border-purple-300",
      NOT_INTERESTED: "bg-gray-100 text-gray-700 border-gray-300",
      CLOSED: "bg-red-100 text-red-700 border-red-300",
    };

    const icons = {
      NEW: <AlertCircle size={14} />,
      CLICKED: <Eye size={14} />,
      CONTACTED: <Phone size={14} />,
      INTERESTED: <TrendingUp size={14} />,
      NOT_INTERESTED: <X size={14} />,
      CLOSED: <Check size={14} />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {icons[status]}
        {status.replace("_", " ")}
      </span>
    );
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
              className="flex items-center text-gray-700 hover:text-green-700 transition-colors"
            >
              <ArrowLeftCircle size={26} className="mr-2" />
              <span className="hidden sm:inline font-semibold">Back</span>
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-green-800">
                Property Inquiries
              </h1>
              <p className="text-sm text-gray-600">
                Manage and track all property leads
              </p>
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

      {/* ✅ FIXED: Stats Cards - Only 3 cards now */}
      <div className="px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">New Inquiries</p>
                <p className="text-3xl font-bold mt-1">{stats.newCount}</p>
                <p className="text-xs opacity-75 mt-1">With phone numbers</p>
              </div>
              <Users size={40} className="opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Just Clicked</p>
                <p className="text-3xl font-bold mt-1">{stats.clickedCount}</p>
                <p className="text-xs opacity-75 mt-1">No phone yet</p>
              </div>
              <Eye size={40} className="opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Leads</p>
                <p className="text-3xl font-bold mt-1">{stats.newCount + stats.clickedCount}</p>
                <p className="text-xs opacity-75 mt-1">All inquiries</p>
              </div>
              <FileText size={40} className="opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone, or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Filter Status */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="NEW">New</option>
                <option value="CLICKED">Clicked</option>
                <option value="CONTACTED">Contacted</option>
                <option value="INTERESTED">Interested</option>
                <option value="NOT_INTERESTED">Not Interested</option>
                <option value="CLOSED">Closed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* Export Button */}
            <motion.button
              onClick={exportToCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
            >
              <Download size={18} />
              Export CSV
            </motion.button>
          </div>
        </div>

        {/* Excel-Style Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-green-500">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-green-500">
                    User Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-green-500">
                    Phone Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-green-500">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-green-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-green-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                      <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No inquiries found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry, index) => (
                    <motion.tr
                      key={inquiry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-green-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 border-r border-gray-200">
                        #{inquiry.id}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {/* ✅ FIXED: Use userName directly */}
                            {inquiry.userName ? inquiry.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NA'}
                          </div>
                          <div className="min-w-0">
                            {/* ✅ FIXED: Use userName and userEmail directly */}
                            <p className="font-semibold text-gray-900 text-sm">
                              {inquiry.userName || "No name"}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {inquiry.userEmail || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {inquiry.phoneNumber ? (
                          <a
                            href={`tel:${inquiry.phoneNumber}`}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            <Phone size={14} />
                            {inquiry.phoneNumber}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Not provided yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <div className="max-w-xs">
                          {/* ✅ FIXED: Use propertyTitle, propertyCity, propertyState directly */}
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {inquiry.propertyTitle || "N/A"}
                          </p>
                          {inquiry.propertyCity && inquiry.propertyState && (
                            <p className="text-xs text-gray-600">
                              {inquiry.propertyCity}, {inquiry.propertyState}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {getStatusBadge(inquiry.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(inquiry.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setShowStatusModal(true);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <MessageSquare size={16} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(inquiry.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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

      {/* ✅ FIXED: Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && selectedInquiry && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Update Status</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">User:</p>
                {/* ✅ FIXED: Use userName directly */}
                <p className="font-semibold">
                  {selectedInquiry.userName || "No name"}
                </p>
                <p className="text-sm text-gray-600 mt-2 mb-1">Property:</p>
                {/* ✅ FIXED: Use propertyTitle directly */}
                <p className="font-semibold">{selectedInquiry.propertyTitle || "N/A"}</p>
              </div>

              <div className="space-y-2">
                {["NEW", "CONTACTED", "INTERESTED", "NOT_INTERESTED", "CLOSED"].map((status) => (
                  <motion.button
                    key={status}
                    onClick={() => handleStatusUpdate(selectedInquiry.id, status)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-3 rounded-lg border-2 font-medium transition-all ${
                      selectedInquiry.status === status
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "bg-white border-gray-200 hover:border-green-400 text-gray-700"
                    }`}
                  >
                    {status.replace("_", " ")}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
