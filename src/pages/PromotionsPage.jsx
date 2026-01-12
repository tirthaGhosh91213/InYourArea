import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Store, LogOut, Search, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const BASE_URL = "https://api.jharkhandbiharupdates.com/api/v1";

// --- CUSTOM COMPONENTS ---

// 1. Loading Skeleton (Initial Load)
const ShopSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[300px] animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-5 space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export default function PromotionsPage() {
  const navigate = useNavigate();
  
  // State for Data
  const [vendorProfile, setVendorProfile] = useState(null);
  const [shops, setShops] = useState([]);
  
  // State for Pagination & UI
  const [loading, setLoading] = useState(true); // Initial full page load
  const [loadingMore, setLoadingMore] = useState(false); // Bottom scroll loader
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");

  // Observer for Infinite Scroll
  const observer = useRef();

  // --- 1. FETCH USER PROFILE (ONCE) ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const res = await axios.get(`${BASE_URL}/vendors/me`, {
           headers: { Authorization: `Bearer ${token}` },
        });
        setVendorProfile(res.data.data);
      } catch (error) {
        console.warn("User not logged in or token expired");
      }
    };
    fetchUserProfile();
  }, []);

  // --- 2. FETCH SHOPS (PAGINATED) ---
  const fetchShops = async (pageNum) => {
    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      // Call API with pagination params
      const res = await axios.get(`${BASE_URL}/vendors`, {
        params: { 
            page: pageNum, 
            size: 9 // Fetch 9 items (looks good on 3-col grid)
        }
      });

      const responseData = res.data.data;
      
      // Handle response structure (Page object)
      const newShops = responseData.content || [];
      const isLastPage = responseData.last;

      setShops((prev) => {
        // If page 0, replace. If > 0, append.
        return pageNum === 0 ? newShops : [...prev, ...newShops];
      });

      setHasMore(!isLastPage);
    } catch (error) {
      console.error("Error loading shops:", error);
      toast.error("Failed to load shops");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Trigger fetch when 'page' changes
  useEffect(() => {
    fetchShops(page);
  }, [page]);

  // --- 3. INFINITE SCROLL LOGIC ---
  const lastShopElementRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        // Increment page number to trigger useEffect
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);


  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Client-side filtering on loaded shops
  const filteredShops = shops.filter((shop) =>
    shop.shopName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-green-100">
      <Toaster position="top-center" />
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="bg-[#006A4E] p-2 rounded-lg text-white group-hover:rotate-12 transition-transform shadow-md">
                <Store size={24} />
            </div>
          </div>
          
          <div className="flex gap-2 md:gap-4 items-center">
            {/* Manage Shop Button */}
            {vendorProfile?.vendorStatus === "ACCEPTED" && (
              <button
                onClick={() => navigate("/vendor/dashboard")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs md:text-sm font-bold hover:bg-blue-100 transition border border-blue-200"
              >
                <Store size={16} /> 
                <span>Manage Shop</span>
              </button>
            )}

            {/* Auth Buttons */}
            {localStorage.getItem("accessToken") ? (
              <button
                onClick={handleLogout}
                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 bg-[#006A4E] text-white rounded-full text-sm font-bold hover:bg-[#00553e] transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#006A4E] pt-16 pb-24 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
          >
            Discover Local Shops & <span className="text-yellow-300">Trusted Vendors</span>
          </motion.h1>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Find the best products, services, and deals from verified sellers in your neighborhood.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-lg group-hover:bg-white/30 transition-all"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-2xl p-2 transform group-hover:scale-[1.01] transition-transform">
                <Search className="ml-4 text-gray-400" size={24} />
                <input
                    type="text"
                    placeholder="Search shops..."
                    className="w-full pl-4 pr-4 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="bg-[#006A4E] text-white px-6 py-3 rounded-full font-bold hover:bg-[#00553e] transition-colors hidden sm:block">
                    Search
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <main className="max-w-7xl mx-auto px-4 pb-20 -mt-10 relative z-10">
        
        {/* Initial Loading State */}
        {loading && shops.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => <ShopSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {filteredShops.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No shops found</h3>
                <p className="text-gray-500 mt-2">Try searching for a different name.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredShops.map((shop, index) => {
                   // Check if it's the last element to attach the observer
                   if (shops.length === index + 1) {
                      return (
                        <div ref={lastShopElementRef} key={shop.id}>
                           <ShopCard shop={shop} navigate={navigate} />
                        </div>
                      );
                   } else {
                      return <ShopCard key={shop.id} shop={shop} navigate={navigate} />;
                   }
                })}
              </div>
            )}

            {/* Bottom Loader for Infinite Scroll */}
            {loadingMore && (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-[#006A4E]" size={32} />
                </div>
            )}
            
            {/* End of List Message */}
            {!hasMore && shops.length > 0 && (
                <div className="text-center py-8 text-gray-400 text-sm font-medium">
                    You have reached the end of the list.
                </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <div className="text-center py-8 text-gray-400 text-sm">
        &copy; 2026 Jharkhand Bihar Updates. Connecting local buyers & sellers.
      </div>
    </div>
  );
}

// Extracted Component for cleaner loop
const ShopCard = ({ shop, navigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8 }}
    className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer flex flex-col h-full"
    onClick={() => navigate(`/shop/${shop.vendorSlug}`)}
  >
    <div className="aspect-video bg-gray-50 relative border-b border-gray-100 p-6 flex items-center justify-center overflow-hidden">
      {shop.shopLogoUrl ? (
        <img
          src={shop.shopLogoUrl}
          alt={shop.shopName}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-300">
            <Store size={64} className="mb-2" />
            <span className="text-sm font-medium">No Image</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
    </div>

    <div className="p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-[#006A4E] transition-colors">
          {shop.shopName}
        </h3>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-green-50 text-[#006A4E] text-xs px-2.5 py-1 rounded-md font-bold border border-green-100 flex items-center gap-1">
          <Store size={10} /> Verified Seller
        </span>
        <span className="text-gray-400 text-xs px-2 py-1">•</span>
        <span className="text-gray-500 text-xs font-medium">
          {shop.productsCount} Products
        </span>
      </div>

      <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
        {shop.shopDescription || "Visit this shop to see their amazing products and deals."}
      </p>
      
      <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 text-gray-400 text-xs">
            <MapPin size={14} />
            <span>Local Vendor</span>
        </div>
        <div className="flex items-center text-[#006A4E] text-sm font-bold gap-1 group-hover:gap-2 transition-all">
          Visit Store <ArrowRight size={16} />
        </div>
      </div>
    </div>
  </motion.div>
);