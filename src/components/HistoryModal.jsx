// src/pages/History.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History as HistoryIcon, Trash2, Clock, Eye, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

export default function History() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchHistory = async (pageNum = 0) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `https://api.jharkhandbiharupdates.com/api/v1/history/state-news?page=${pageNum}&size=20`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const result = response.data?.data;
      setHistoryData(result?.content || []);
      setTotalPages(result?.totalPages || 0);
      setTotalCount(result?.totalElements || 0);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load history');
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = async (newsId) => {
    setShowDeleteModal(false);
    setDeletingItemId(newsId);
    setDeleting(true);

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `https://api.jharkhandbiharupdates.com/api/v1/history/state-news/${newsId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Item removed from history');
      fetchHistory(page);
    } catch (error) {
      console.error('Failed to delete history item:', error);
      toast.error('Failed to delete item');
    } finally {
      setDeleting(false);
      setDeletingItemId(null);
      setItemToDelete(null);
    }
  };

  const handleClearAll = async () => {
    setShowClearAllModal(false);
    setDeleting(true);

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        'https://api.jharkhandbiharupdates.com/api/v1/history/state-news/clear',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('History cleared successfully');
      setHistoryData([]);
      setTotalCount(0);
      setPage(0);
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('Failed to clear history');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (newsId) => {
    setItemToDelete(newsId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const openClearAllModal = () => {
    setShowClearAllModal(true);
  };

  const closeClearAllModal = () => {
    setShowClearAllModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  useEffect(() => {
    fetchHistory(0);
  }, []);

  if (loading && historyData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 pb-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold mb-3 transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-emerald-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 bg-emerald-100 rounded-xl">
                  <HistoryIcon className="w-6 h-6 md:w-8 md:h-8 text-emerald-700" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                    Your History
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'} viewed
                  </p>
                </div>
              </div>

              {historyData.length > 0 && (
                <button
                  onClick={openClearAllModal}
                  disabled={deleting}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Clearing...</span>
                    </>
                  ) : (
                    'Clear All'
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : historyData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
              <div className="inline-flex p-6 bg-gray-100 rounded-full mb-6">
                <Eye className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No history yet</h2>
              <p className="text-gray-600 mb-6">
                News you view will appear here
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition"
              >
                Explore News
              </button>
            </div>
          ) : (
            <>
              {/* History List */}
              <div className="space-y-3">
                {historyData.map((item, index) => {
                  const news = item.contentDetails;
                  if (!news) return null;

                  const isDeleting = deletingItemId === news.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 hover:border-emerald-300 transition-all overflow-hidden ${
                        isDeleting ? 'opacity-60 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex gap-3 p-3 md:p-4">
                        {/* Thumbnail */}
                        <a
                          href={`/statenews/details/${news.id}`}
                          className="flex-shrink-0"
                        >
                          {news.imageUrls && news.imageUrls.length > 0 ? (
                            <img
                              src={news.imageUrls[0]}
                              alt={news.title}
                              className="w-20 h-20 md:w-28 md:h-28 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                              <Eye className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
                            </div>
                          )}
                        </a>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <a
                            href={`/statenews/details/${news.id}`}
                            className="block font-bold text-gray-900 hover:text-emerald-700 transition line-clamp-2 text-sm md:text-base mb-2"
                          >
                            {news.title}
                          </a>
                          
                          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 md:w-4 md:h-4" />
                              <span>{formatDate(item.viewedAt)}</span>
                            </div>
                            {news.stateName && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600 font-semibold truncate">
                                  {news.stateName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Delete Button - Shows loader when deleting */}
                        <button
                          onClick={() => openDeleteModal(news.id)}
                          disabled={deleting}
                          className="flex-shrink-0 p-2 h-fit md:opacity-0 md:group-hover:opacity-100 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Remove from history"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-red-600 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => fetchHistory(Math.max(0, page - 1))}
                    disabled={page === 0 || loading}
                    className="px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-semibold bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                  >
                    Previous
                  </button>
                  
                  <span className="text-xs md:text-sm text-gray-600 font-medium px-2 md:px-4">
                    Page {page + 1} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => fetchHistory(page + 1)}
                    disabled={page >= totalPages - 1 || loading}
                    className="px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-semibold bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Delete Single Item Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Delete this item from history?
              </h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDeleteModal}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSingle(itemToDelete)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear All History Modal */}
      <AnimatePresence>
        {showClearAllModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeClearAllModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Clear all history?
              </h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all {totalCount} items from your history. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeClearAllModal}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
