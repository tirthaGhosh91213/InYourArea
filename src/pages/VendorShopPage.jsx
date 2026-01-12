import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCart, Plus, Loader2, MapPin, Star, Store, Share2, Tag, ShoppingBag, CheckCircle, Percent, X, Maximize2 } from "lucide-react"; 
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import CartDrawer from "./CartDrawer"; 
import { AnimatePresence, motion } from "framer-motion";

const BASE_URL = "https://api.jharkhandbiharupdates.com/api/v1";

// --- SKELETON LOADER (Updated for FB Style Layout) ---
const ShopSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    {/* Cover Skeleton */}
    <div className="h-48 md:h-80 bg-gray-200 w-full"></div>
    
    <div className="max-w-7xl mx-auto px-4 relative z-10 -mt-16 md:-mt-20 mb-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        {/* Profile Pic Skeleton (Left Aligned) */}
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 border-4 border-white shrink-0 shadow-sm"></div>
        
        {/* Info Skeleton */}
        <div className="flex-1 space-y-3 pb-2 w-full pt-2 md:pt-0">
           <div className="h-8 bg-gray-300 rounded w-3/4 md:w-1/3"></div>
           <div className="h-4 bg-gray-200 rounded w-1/2 md:w-1/4"></div>
        </div>
      </div>
    </div>

    {/* Description Skeleton */}
    <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="h-24 bg-white rounded-xl border border-gray-100"></div>
    </div>

    {/* Products Skeleton */}
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 h-40 flex gap-4">
            <div className="w-32 bg-gray-200 rounded-xl shrink-0"></div>
            <div className="flex-1 space-y-3 py-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-8 bg-gray-200 rounded w-20 mt-auto"></div>
            </div>
          </div>
        ))}
    </div>
  </div>
);

// --- PRODUCT CARD ---
const ProductCard = ({ product, addToCart, addingToCartId }) => {
  const isOutOfStock = product.stockStatus !== "IN_STOCK" && product.stockStatus !== "In Stock";

  return (
    <div className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 group transition-all duration-300 hover:shadow-lg hover:border-green-100 relative overflow-hidden ${isOutOfStock ? 'opacity-70' : ''}`}>
      
      {/* Image Section */}
      <div className="w-28 h-28 md:w-36 md:h-36 bg-gray-50 rounded-xl overflow-hidden shrink-0 relative">
        <img 
          src={product.imageUrl} 
          alt={product.productName} 
          className={`w-full h-full object-cover transition-transform duration-700 ${isOutOfStock ? 'grayscale' : 'group-hover:scale-110'}`} 
        />
        {/* Discount Badge */}
        {product.hasDiscount && !isOutOfStock && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] px-2 py-1 font-bold rounded-br-lg shadow-sm flex items-center gap-0.5 z-10">
             <Percent size={10} /> OFF
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="font-bold text-gray-900 line-clamp-2 text-[15px] md:text-lg leading-snug group-hover:text-[#006A4E] transition-colors">
            {product.productName}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed font-medium">
            {product.description}
          </p>
        </div>

        <div className="flex items-end justify-between mt-3">
          {/* Price */}
          <div className="flex flex-col">
            {product.hasDiscount && (
              <span className="text-xs text-gray-400 line-through mb-0.5">₹{product.originalPrice}</span>
            )}
            <span className="font-extrabold text-lg text-gray-900">
              ₹{product.effectivePrice || product.originalPrice}
            </span>
          </div>

          {/* Add Button */}
          {!isOutOfStock ? (
            <button 
              onClick={() => addToCart(product)}
              disabled={addingToCartId === product.id}
              className="h-9 px-4 bg-green-50 text-[#006A4E] hover:bg-[#006A4E] hover:text-white rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 border border-green-200 hover:shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {addingToCartId === product.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Add <Plus size={16} strokeWidth={3} /></>
              )}
            </button>
          ) : (
            <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-md border border-red-100 whitespace-nowrap">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function VendorShopPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);
  
  // State for Fullscreen Image View
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const getSessionId = () => localStorage.getItem("cart_session_id") || "";

  const getBackendErrorMessage = (error) => {
      if (!error.response) return "Network Error. Check your connection.";
      if (!error.response.data) return "Server Error. Please try again.";
      return error.response.data.message || error.response.data.error || error.response.data.detail || JSON.stringify(error.response.data);
  };

  const handleShare = async () => {
    const shareData = {
      title: vendor?.shopName,
      text: `Check out ${vendor?.shopName} on Jharkhand Bihar Updates!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log("Share failed:", err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Shop link copied to clipboard!");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const vendorRes = await axios.get(`${BASE_URL}/vendors/${slug}`);
        setVendor(vendorRes.data.data);

        const prodRes = await axios.get(`${BASE_URL}/products/vendor/${slug}`);
        setProducts(prodRes.data.data);

        const sessionId = getSessionId();
        if (sessionId) await refreshCart(sessionId);
      } catch (error) {
        console.error("Error loading shop:", error);
        toast.error(getBackendErrorMessage(error)); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const refreshCart = async (sessionId) => {
    if (!sessionId) { setCart(null); return; }
    try {
      const res = await axios.get(`${BASE_URL}/cart/${sessionId}`);
      setCart(res.data.data); 
    } catch (err) {
      console.warn("Cart session expired");
      setCart(null); 
      localStorage.removeItem("cart_session_id"); 
      setIsCartOpen(false); 
    }
  };

  const addToCart = async (product) => {
    setAddingToCartId(product.id);
    try {
      let activeSessionId = getSessionId();
      const payload = { productId: product.id, quantity: 1, sessionId: activeSessionId };

      const res = await axios.post(`${BASE_URL}/cart/add`, payload);
      const responseData = res.data.data;
      
      if (!activeSessionId && responseData.sessionId) {
        localStorage.setItem("cart_session_id", responseData.sessionId);
        activeSessionId = responseData.sessionId; 
      }

      await refreshCart(activeSessionId);
      toast.success("Added to cart");
    } catch (error) {
      toast.error(getBackendErrorMessage(error)); 
    } finally {
      setAddingToCartId(null);
    }
  };

  // --- FILTER LOGIC ---
  const discountedProducts = products.filter(p => p.hasDiscount);
  const regularProducts = products.filter(p => !p.hasDiscount);

  if (loading) return <ShopSkeleton />;

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-28 font-sans">
      
      <Toaster position="top-center" />

      {/* --- 1. COVER PHOTO --- */}
      <div 
        className="w-full h-60 md:h-[400px] relative bg-gray-300 overflow-hidden group cursor-pointer"
        onClick={() => vendor?.shopCoverUrl && setFullscreenImage(vendor.shopCoverUrl)}
      >
          {vendor?.shopCoverUrl ? (
              <img src={vendor.shopCoverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#006A4E] to-emerald-800 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 pattern-grid-lg"></div>
                  <Store size={64} className="text-white opacity-20" />
              </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          {vendor?.shopCoverUrl && (
             <div className="absolute top-4 right-4 bg-black/30 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={20} />
             </div>
          )}
      </div>

      {/* --- 2. PROFILE INFO SECTION (Facebook Style) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 md:-mt-10 gap-4 md:gap-6">
              
              {/* Profile Image (Left Aligned) */}
              <div 
                className="relative group cursor-pointer shrink-0 z-20"
                onClick={() => vendor?.shopLogoUrl && setFullscreenImage(vendor.shopLogoUrl)}
              >
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[4px] border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
                      {vendor?.shopLogoUrl ? (
                          <img src={vendor.shopLogoUrl} alt={vendor.shopName} className="w-full h-full object-cover" />
                      ) : (
                          <Store size={48} className="text-gray-400" />
                      )}
                  </div>
                  <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
                      <CheckCircle size={14} className="md:w-5 md:h-5" />
                  </div>
              </div>

              {/* Text Info & Actions */}
              <div className="flex-1 w-full pt-2 md:pb-4">
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                      {/* Name & Details */}
                      <div>
                          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                              {vendor?.shopName}
                          </h1>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-sm text-gray-500 font-medium">
                              <span className="flex items-center gap-1">
                                  <MapPin size={16} className="text-gray-400" /> 
                                  {vendor?.shopAddress || "Local Vendor"}
                              </span>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-green-600 font-bold">
                                  Open Now
                              </span>
                          </div>
                      </div>

                      {/* Action Buttons (Fixed Mobile Layout) */}
                      <div className="flex gap-3 mt-2 md:mt-0 w-full md:w-auto">
                          <button 
                              onClick={handleShare}
                              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
                          >
                              <Share2 size={18} /> Share
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {/* Description Box */}
          <div className="mt-6 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-2">About Shop</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {vendor?.shopDescription || "Welcome to our shop! We provide high-quality products for our local community. Browse our collection below."}
              </p>
          </div>
      </div>

      {/* --- 3. PRODUCTS LISTING --- */}
      <div className="max-w-7xl mx-auto px-4 space-y-10 mt-8">
        
        {products.length === 0 && (
           <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="text-gray-300" size={40} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">No products found</h3>
              <p className="text-gray-500 text-sm">This shop hasn't added any products yet.</p>
           </div>
        )}

        {/* Best Offers (Clean Headers - No BG Box) */}
        {discountedProducts.length > 0 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
               <span className="bg-red-50 text-red-600 p-2 rounded-lg"><Tag size={24} /></span>
               Best Offers 
               <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold">{discountedProducts.length}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {discountedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  addToCart={addToCart} 
                  addingToCartId={addingToCartId} 
                />
              ))}
            </div>
          </div>
        )}

        {/* All Products (Clean Headers - No BG Box) */}
        {regularProducts.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
               <span className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                 <ShoppingBag size={24} />
               </span>
               All Products 
               <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-bold">{regularProducts.length}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {regularProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  addToCart={addToCart} 
                  addingToCartId={addingToCartId} 
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- FLOATING CART BUTTON --- */}
      {cart && cart.totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 animate-bounce-in">
          <button
            onClick={() => setIsCartOpen(true)}
            className="group bg-[#006A4E]/95 backdrop-blur-md hover:bg-[#00553e] text-white pl-5 pr-6 py-3.5 rounded-full shadow-2xl shadow-green-900/40 flex items-center gap-4 transition-all transform active:scale-95 hover:scale-105 border border-white/20"
          >
            <div className="bg-white text-[#006A4E] px-2.5 py-0.5 rounded-full text-sm font-extrabold shadow-sm group-hover:scale-110 transition-transform">
                {cart.totalItems}
            </div>
            <div className="flex flex-col items-start leading-tight">
               <span className="font-bold text-sm">View Cart</span>
               <span className="text-green-100 text-xs font-medium">Total: ₹{cart.totalAmount}</span>
            </div>
            <ShoppingCart size={20} className="ml-1 opacity-90" />
          </button>
        </div>
      )}

      {/* --- FULLSCREEN IMAGE MODAL --- */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <motion.button 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-6 right-6 bg-white/10 p-2 rounded-full text-white hover:bg-white/20 transition z-50"
            >
              <X size={24} />
            </motion.button>
            <motion.img 
              src={fullscreenImage} 
              alt="Fullscreen" 
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} refreshCart={() => refreshCart(localStorage.getItem("cart_session_id"))} />
    </div>
  );
}