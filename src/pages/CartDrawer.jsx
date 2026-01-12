import React, { useState } from "react";
import { X, Trash2, MapPin, MessageCircle, ShoppingBag, Truck, Crosshair, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = "https://api.jharkhandbiharupdates.com/api/v1";

export default function CartDrawer({ isOpen, onClose, cart, refreshCart }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    mapLink: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // --- STATE FOR DELETE ANIMATION ---
  const [deletingItemId, setDeletingItemId] = useState(null);

  if (!isOpen || !cart) return null;

  const updateQty = async (itemId, newQty) => {
    try {
      if (newQty < 1) return;
      await axios.put(`${BASE_URL}/cart/${cart.sessionId}/items/${itemId}?quantity=${newQty}`);
      refreshCart();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const removeItem = async (itemId) => {
    // 1. Start Animation
    setDeletingItemId(itemId);

    try {
      const res = await axios.delete(`${BASE_URL}/cart/${cart.sessionId}/items/${itemId}`);
      
      if (res.data.data && (!res.data.data.sessionId || res.data.data.items.length === 0)) {
         toast.success("Cart is now empty");
         onClose(); 
         refreshCart(); 
      } else {
         refreshCart(); 
      }
    } catch (error) {
      if (error.response?.data?.message === "Cart is now empty") {
         onClose();
         refreshCart();
      } else {
         toast.error("Failed to remove item");
      }
    } finally {
      setDeletingItemId(null);
    }
  };

  // --- NEW: DETECT LOCATION FUNCTION ---
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, mapLink: mapsLink }));
        toast.success("Location detected successfully!");
        setLocationLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Unable to retrieve your location. Please enter manually.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        sessionId: cart.sessionId,
        customerName: formData.name,
        customerPhone: formData.phone,
        deliveryAddress: formData.address,
        exactLocation: formData.mapLink
      };

      const res = await axios.post(`${BASE_URL}/whatsapp/generate-order`, payload);
      const { whatsappUrl } = res.data.data;
      
      localStorage.removeItem("cart_session_id");
      
      window.open(whatsappUrl, "_blank");
      onClose(); 
      window.location.reload(); 
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <ShoppingBag size={20} /> Your Cart
            </h2>
            <p className="text-xs text-gray-500">Ordering from {cart.vendor?.shopName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Items List */}
          <div className="space-y-4">
            {cart.items.map((item) => {
              const isDeleting = deletingItemId === item.itemId;

              return (
                <div 
                  key={item.itemId} 
                  className={`flex gap-3 border-b border-gray-100 pb-4 last:border-0 transition-all duration-500 ease-out 
                    ${isDeleting ? "opacity-40 grayscale scale-95 pointer-events-none bg-gray-50" : "opacity-100 scale-100"}
                  `}
                >
                  <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 relative">
                      <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                      {isDeleting && <div className="absolute inset-0 bg-white/50"></div>}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm text-gray-800 line-clamp-1">{item.productName}</p>
                      <p className="font-bold text-sm text-gray-900">₹{item.subtotal}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">₹{item.priceAtAddition} / unit</p>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border rounded-md bg-white">
                        <button 
                          onClick={() => updateQty(item.itemId, item.quantity - 1)} 
                          className="px-2 py-1 hover:bg-gray-50 text-gray-600 disabled:text-gray-300"
                          disabled={isDeleting}
                        >-</button>
                        <span className="px-2 text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQty(item.itemId, item.quantity + 1)} 
                          className="px-2 py-1 hover:bg-gray-50 text-gray-600 disabled:text-gray-300"
                          disabled={isDeleting}
                        >+</button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.itemId)} 
                        disabled={isDeleting}
                        className={`p-1 transition-colors ${isDeleting ? "text-gray-300" : "text-red-400 hover:text-red-600"}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Form */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Delivery Details</h3>
            <form id="checkoutForm" onSubmit={handleCheckout} className="space-y-3">
              <input 
                required
                placeholder="Your Name" 
                className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <input 
                required
                type="tel"
                placeholder="Phone Number" 
                className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <textarea 
                required
                placeholder="Full Delivery Address (House No, Street, Landmark)" 
                className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 min-h-[80px]"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
              
              {/* --- NEW: DETECT LOCATION BUTTON --- */}
              <div className="relative">
                <button 
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locationLoading}
                    className="absolute right-2 top-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-3 py-1.5 rounded-md flex items-center gap-1 transition-all z-10 font-medium"
                >
                    {locationLoading ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
                    {locationLoading ? "Detecting..." : "Detect Location"}
                </button>
                
                <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <input 
                        placeholder="Location Link (Auto-fills or Paste)" 
                        className="w-full pl-9 pr-28 p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        value={formData.mapLink}
                        onChange={e => setFormData({...formData, mapLink: e.target.value})}
                        readOnly={false} 
                    />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 ml-1">
                 *Click 'Detect Location' to share your exact GPS spot for faster delivery.
              </p>

            </form>
          </div>
        </div>

        {/* Footer (PRICE BREAKDOWN) */}
        <div className="p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
          
          <div className="space-y-2 mb-4">
             {/* Delivery Message (if exists) */}
             {cart.deliveryMessage && (
                <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg mb-2 text-center font-medium border border-blue-100 flex items-center justify-center gap-2">
                   <Truck size={14} /> {cart.deliveryMessage}
                </div>
             )}

             <div className="flex justify-between text-gray-600 text-sm">
                <span>Item Total</span>
                <span>₹{cart.itemTotal}</span>
             </div>
             
             <div className="flex justify-between text-gray-600 text-sm">
                <span>Delivery Charge</span>
                <span className={cart.deliveryCharge > 0 ? "text-gray-800" : "text-green-600 font-bold"}>
                   {cart.deliveryCharge > 0 ? `+ ₹${cart.deliveryCharge}` : "FREE"}
                </span>
             </div>

             <div className="border-t border-dashed border-gray-300 my-1"></div>

             <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total Amount</span>
                <span>₹{cart.totalAmount}</span>
             </div>
          </div>

          <button 
            type="submit" 
            form="checkoutForm"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {submitting ? "Processing..." : (
              <>
                <MessageCircle size={20} />
                Send Order on WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}