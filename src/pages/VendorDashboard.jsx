import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Eye, EyeOff, Package, Loader2, AlertTriangle, Edit, X, Settings, Camera, Store, Share2, Image as ImageIcon, MapPin, Maximize2, Truck, IndianRupee } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet";
import { AnimatePresence, motion } from "framer-motion";

const BASE_URL = "https://api.jharkhandbiharupdates.com/api/v1";

export default function VendorDashboard() {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [listingQuota, setListingQuota] = useState(100); 
  const [loading, setLoading] = useState(true);

  // Vendor Profile State
  const [vendorDetails, setVendorDetails] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Profile Form Data
  const [profileForm, setProfileForm] = useState({
    shopName: "",
    shopDescription: "",
    vendorPhone: "",
    shopAddress: "",
    deliveryType: "FREE",
    deliveryCharge: "",
    minFreeDeliveryAmount: ""
  });

  // Image States for Upload
  const [profileImage, setProfileImage] = useState(null); 
  const [previewImage, setPreviewImage] = useState(null); 
  
  const [coverImage, setCoverImage] = useState(null);     
  const [previewCover, setPreviewCover] = useState(null); 

  // Loaders
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Fullscreen Image State
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Product Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Product Form State
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    stockStatus: "IN_STOCK",
    hasDiscount: false
  });
  const [imageFile, setImageFile] = useState(null);

  // --- API CALLS ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [productsRes, userRes, vendorRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/products/my-products`, config),
        axios.get(`${BASE_URL}/users/my-profile`, config),
        axios.get(`${BASE_URL}/vendors/me`, config) 
      ]);

      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value.data.data);
      }

      if (userRes.status === 'fulfilled') {
        const quota = userRes.value.data.data?.listing_quota;
        if (quota) setListingQuota(quota);
      }

      if (vendorRes.status === 'fulfilled') {
        setVendorDetails(vendorRes.value.data.data);
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- SHARE FUNCTION ---
  const handleShareShop = async () => {
    if (!vendorDetails) return;
    const shopUrl = `${window.location.origin}/shop/${vendorDetails.vendorSlug}`;
    const shareData = {
        title: vendorDetails.shopName,
        text: `Check out ${vendorDetails.shopName} on Jharkhand Bihar Updates!`,
        url: shopUrl,
    };

    if (navigator.share) {
        try { await navigator.share(shareData); } catch (err) { console.log("Share cancelled", err); }
    } else {
        navigator.clipboard.writeText(shopUrl);
        toast.success("Shop link copied to clipboard!");
    }
  };

  // --- HELMET SEO DATA ---
  const shopUrl = vendorDetails ? `${window.location.origin}/shop/${vendorDetails.vendorSlug}` : window.location.href;
  const shopName = vendorDetails?.shopName || "Vendor Shop";
  const shopDesc = vendorDetails?.shopDescription || `Check out ${shopName} on Jharkhand Bihar Updates! Best deals and offers available now.`;
  const shopImage = vendorDetails?.shopCoverUrl || vendorDetails?.shopLogoUrl || `${window.location.origin}/banner.jpg`; 

  // --- PROFILE MANAGEMENT ---
  const openProfileModal = () => {
    if (vendorDetails) {
        setProfileForm({
            shopName: vendorDetails.shopName,
            shopDescription: vendorDetails.shopDescription || "",
            vendorPhone: vendorDetails.vendorPhone,
            shopAddress: vendorDetails.shopAddress || "",
            deliveryType: vendorDetails.deliveryType || "FREE",
            deliveryCharge: vendorDetails.deliveryCharge || "",
            minFreeDeliveryAmount: vendorDetails.minFreeDeliveryAmount || ""
        });
        setPreviewImage(vendorDetails.shopLogoUrl);
        setPreviewCover(vendorDetails.shopCoverUrl); 
    }
    setProfileImage(null);
    setCoverImage(null);
    setShowProfileModal(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    const token = localStorage.getItem("accessToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const multiPartConfig = { 
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        } 
    };

    try {
        if (profileForm.deliveryType === 'FIXED' && !profileForm.deliveryCharge) {
            toast.error("Please enter delivery charge");
            setProfileLoading(false);
            return;
        }
        if (profileForm.deliveryType === 'CONDITIONAL') {
            if (!profileForm.deliveryCharge) {
                toast.error("Please enter delivery charge");
                setProfileLoading(false);
                return;
            }
            if (!profileForm.minFreeDeliveryAmount) {
                toast.error("Please enter minimum order amount");
                setProfileLoading(false);
                return;
            }
        }

        await axios.put(`${BASE_URL}/vendors/me/details`, profileForm, config);
        
        if (profileImage) {
            const formData = new FormData();
            formData.append("shopLogo", profileImage);
            await axios.put(`${BASE_URL}/vendors/me/logo`, formData, multiPartConfig);
        }

        if (coverImage) {
            const formData = new FormData();
            formData.append("shopCover", coverImage);
            await axios.put(`${BASE_URL}/vendors/me/cover`, formData, multiPartConfig);
        }

        toast.success("Shop profile updated successfully!");
        setShowProfileModal(false);
        fetchData(); 

    } catch (error) {
        const msg = error.response?.data?.message || "Failed to update profile";
        toast.error(msg);
    } finally {
        setProfileLoading(false);
    }
  };

  const handleLogoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setProfileImage(file);
          setPreviewImage(URL.createObjectURL(file));
      }
  };

  const handleCoverChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setCoverImage(file);
          setPreviewCover(URL.createObjectURL(file));
      }
  };

  // --- PRODUCT MANAGEMENT ---
  const handleOpenAddModal = () => {
    if (products.length >= listingQuota) {
      toast.error(`Quota Limit Reached! (${listingQuota} products max)`);
      return;
    }
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      productName: "",
      description: "",
      originalPrice: "",
      discountedPrice: "",
      stockStatus: "IN_STOCK",
      hasDiscount: false
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setIsEditing(true);
    setEditingId(product.id);
    setFormData({
      productName: product.productName,
      description: product.description,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice || "",
      stockStatus: product.stockStatus || "IN_STOCK",
      hasDiscount: product.hasDiscount
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const payload = {
          productName: formData.productName,
          description: formData.description,
          originalPrice: formData.originalPrice,
          discountedPrice: formData.discountedPrice,
          stockStatus: formData.stockStatus,
          hasDiscount: formData.hasDiscount
        };

        const res = await axios.put(`${BASE_URL}/products/${editingId}`, payload, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        setProducts(prev => prev.map(p => p.id === editingId ? res.data.data : p));
        toast.success("Product updated successfully!");

      } else {
        if (!imageFile) {
          toast.error("Please upload an image");
          setIsSubmitting(false);
          return;
        }

        const data = new FormData();
        data.append("product", JSON.stringify(formData));
        data.append("productImage", imageFile);

        const res = await axios.post(`${BASE_URL}/products`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });

        const createdProduct = res.data.data; 
        setProducts(prev => [...prev, createdProduct]);
        toast.success("Product created successfully!");
      }

      setShowModal(false);

    } catch (error) {
      const msg = error.response?.data?.message || "Operation failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    setStatusLoadingId(id);
    const token = localStorage.getItem("accessToken");
    
    try {
      await axios.patch(`${BASE_URL}/products/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, isActive: !p.isActive } : p
      ));

      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setStatusLoadingId(null);
    }
  };

  const initiateDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem("accessToken");

    try {
      await axios.delete(`${BASE_URL}/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));

      toast.success("Product deleted");
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      
      {/* --- REACT HELMET --- */}
      <Helmet>
        <title>{shopName} - Dashboard | JHARKHAND BIHAR UPDATES</title>
        <meta name="description" content={shopDesc} />
        <link rel="canonical" href={shopUrl} />
        <meta property="fb:app_id" content="1234567890" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={shopUrl} />
        <meta property="og:title" content={`${shopName} - Best Offers Visit This Link`} />
        <meta property="og:description" content={shopDesc} />
        <meta property="og:site_name" content="JHARKHAND BIHAR UPDATES" />
        <meta property="og:image" content={shopImage} />
        <meta property="og:image:secure_url" content={shopImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${shopName} - Best Offers`} />
        <meta name="twitter:description" content={shopDesc} />
        <meta name="twitter:image" content={shopImage} />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
            
            {/* Cover Photo */}
            <div 
                className="h-32 md:h-64 bg-gray-200 w-full relative group cursor-pointer"
                onClick={() => vendorDetails?.shopCoverUrl && setFullscreenImage(vendorDetails.shopCoverUrl)}
            >
                {vendorDetails?.shopCoverUrl ? (
                    <img src={vendorDetails.shopCoverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#006A4E] to-emerald-800 flex items-center justify-center">
                        <Store size={48} className="text-white opacity-20 md:w-16 md:h-16" />
                    </div>
                )}
                {/* Overlay Icon */}
                {vendorDetails?.shopCoverUrl && (
                    <div className="absolute top-4 right-4 bg-black/30 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 size={20} />
                    </div>
                )}
            </div>

            <div className="px-4 md:px-6 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 -mt-10 md:-mt-12">
                    {/* Shop Info & Logo */}
                    <div className="flex items-end gap-3 md:gap-4">
                        {/* Profile Image */}
                        <div 
                            className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0 z-10 cursor-pointer relative"
                            onClick={() => vendorDetails?.shopLogoUrl && setFullscreenImage(vendorDetails.shopLogoUrl)}
                        >
                            {vendorDetails?.shopLogoUrl ? (
                                <img src={vendorDetails.shopLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Store className="text-gray-400" size={32} />
                            )}
                        </div>

                        {/* FIXED: Added mt-4 for mobile spacing on name */}
                        <div className="mb-1 md:mb-3 mt-14 md:mt-0">
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900 line-clamp-1">
                               {vendorDetails?.shopName || "My Shop"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs md:text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {vendorDetails?.shopAddress || "Local Vendor"}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span>{vendorDetails?.vendorPhone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 md:mb-1">
                        <button 
                            onClick={handleShareShop}
                            className="p-2 md:p-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all flex items-center justify-center bg-white shadow-sm"
                            title="Share Shop Link"
                        >
                            <Share2 size={18} />
                        </button>

                        <button 
                            onClick={openProfileModal}
                            className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-medium flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all bg-white shadow-sm flex-1 md:flex-none justify-center"
                        >
                            <Settings size={16} /> Edit Shop
                        </button>

                        <button 
                            onClick={handleOpenAddModal}
                            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-medium flex items-center gap-2 shadow-lg transition-all text-white flex-1 md:flex-none justify-center
                            ${products.length >= listingQuota ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            <Plus size={18} /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
             <div className="p-10 text-center text-gray-500 flex justify-center items-center gap-2">
               <Loader2 className="animate-spin" /> Loading inventory...
             </div>
          ) : products.length === 0 ? (
             <div className="p-10 text-center text-gray-500">You haven't added any products yet.</div>
          ) : (
            <>
              {/* --- MOBILE VIEW --- */}
              <div className="md:hidden">
                <div className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <div key={p.id} className="p-4 flex gap-3 relative">
                      <div className="shrink-0">
                         <img src={p.imageUrl} alt="" className="w-20 h-20 rounded-lg bg-gray-100 object-cover border" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug mb-1">
                            {p.productName}
                          </h3>
                        </div>

                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-900">₹{p.effectivePrice || p.originalPrice}</span>
                            {p.hasDiscount && (
                                <span className="text-xs text-gray-400 line-through">₹{p.originalPrice}</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                           <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${p.stockStatus === 'IN_STOCK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {p.stockStatus === 'IN_STOCK' ? 'In Stock' : 'No Stock'}
                           </div>

                           <div className="flex gap-2">
                               <button 
                                 onClick={() => toggleStatus(p.id, p.isActive)}
                                 disabled={statusLoadingId === p.id}
                                 className={`p-1.5 rounded-lg border ${p.isActive ? "text-green-600 border-green-200 bg-green-50" : "text-gray-400 border-gray-200 bg-gray-50"}`}
                               >
                                  {statusLoadingId === p.id ? <Loader2 className="animate-spin h-4 w-4" /> : (p.isActive ? <Eye size={16} /> : <EyeOff size={16} />)}
                               </button>
                               <button onClick={() => handleOpenEditModal(p)} className="p-1.5 rounded-lg border border-blue-100 text-blue-600 bg-blue-50">
                                 <Edit size={16} />
                               </button>
                               <button onClick={() => initiateDelete(p)} className="p-1.5 rounded-lg border border-red-100 text-red-600 bg-red-50">
                                 <Trash2 size={16} />
                               </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- DESKTOP VIEW --- */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition group">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-lg bg-gray-100 object-cover border" />
                            <div>
                              <div className="font-semibold text-gray-800">{p.productName}</div>
                              <div className={`text-xs font-medium px-2 py-0.5 rounded inline-block mt-1 ${p.stockStatus === 'IN_STOCK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {p.stockStatus ? p.stockStatus.replace("_", " ") : "IN STOCK"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-900">₹{p.effectivePrice || p.originalPrice}</td>
                        <td className="p-4">
                          {p.hasDiscount ? (
                            <div className="text-xs">
                               <span className="line-through text-gray-400">₹{p.originalPrice}</span>
                               <span className="block text-green-600 font-bold">On Sale</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => toggleStatus(p.id, p.isActive)}
                            disabled={statusLoadingId === p.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border 
                              ${p.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}
                            `}
                          >
                            {statusLoadingId === p.id ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : (p.isActive ? <Eye size={14} /> : <EyeOff size={14} />)}
                            {statusLoadingId === p.id ? "Wait..." : (p.isActive ? "Live" : "Hidden")}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleOpenEditModal(p)} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg transition hover:bg-blue-50">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => initiateDelete(p)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg transition hover:bg-red-50">
                                <Trash2 size={18} />
                              </button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* --- ADD/EDIT PRODUCT MODAL --- */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
              <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                 <h2 className="text-lg font-bold text-gray-800">{isEditing ? "Edit Product" : "Add New Product"}</h2>
                 <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="3"
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.stockStatus} onChange={e => setFormData({...formData, stockStatus: e.target.value})}>
                      <option value="IN_STOCK">In Stock</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                      <input required type="number" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                      <input type="number" disabled={!formData.hasDiscount} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        value={formData.discountedPrice} onChange={e => setFormData({...formData, discountedPrice: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input type="checkbox" id="hasDiscount" className="w-4 h-4 text-blue-600"
                      checked={formData.hasDiscount} onChange={e => setFormData({...formData, hasDiscount: e.target.checked})} />
                    <label htmlFor="hasDiscount" className="text-sm text-gray-700 select-none">Enable Discount Price?</label>
                  </div>

                  {!isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer relative bg-gray-50">
                          <input required type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={e => setImageFile(e.target.files[0])} />
                          <div className="text-gray-500 text-sm">
                              {imageFile ? <span className="text-blue-600 font-medium">{imageFile.name}</span> : "Click to upload image"}
                          </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setShowModal(false)} className="py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md flex justify-center items-center gap-2">
                      {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />} {isEditing ? "Update Product" : "Create Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* --- EDIT SHOP PROFILE & DELIVERY SETTINGS MODAL --- */}
        {showProfileModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                    <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Edit Shop & Settings</h2>
                        <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>

                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        <form onSubmit={handleProfileUpdate} className="space-y-5">
                            
                            {/* --- IMAGES --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cover Photo</label>
                                    <div className="relative h-24 bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-500 transition">
                                        {previewCover ? (
                                            <img src={previewCover} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-400 group-hover:text-blue-500" />
                                        )}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleCoverChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Logo</label>
                                    <div className="relative h-24 w-24 mx-auto bg-gray-100 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-500 transition">
                                        {previewImage ? (
                                            <img src={previewImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="text-gray-400 group-hover:text-blue-500" />
                                        )}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoChange} />
                                    </div>
                                </div>
                            </div>

                            {/* --- BASIC INFO --- */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                <input required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={profileForm.shopName} onChange={e => setProfileForm({...profileForm, shopName: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input required type="tel" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={profileForm.vendorPhone} onChange={e => setProfileForm({...profileForm, vendorPhone: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
                                <textarea required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows="2"
                                    value={profileForm.shopAddress} onChange={e => setProfileForm({...profileForm, shopAddress: e.target.value})} 
                                    placeholder="e.g. Main Road, Ranchi"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="3"
                                    value={profileForm.shopDescription} onChange={e => setProfileForm({...profileForm, shopDescription: e.target.value})} />
                            </div>

                            <hr className="border-gray-200" />

                            {/* --- DELIVERY SETTINGS --- */}
                            <div>
                                <h3 className="text-md font-bold text-gray-800 flex items-center gap-2 mb-3">
                                    <Truck size={18} /> Delivery Settings
                                </h3>
                                
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {['FREE', 'FIXED', 'CONDITIONAL'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setProfileForm({...profileForm, deliveryType: type})}
                                            className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                                                profileForm.deliveryType === type 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {type === 'FREE' ? 'Free Delivery' : type === 'FIXED' ? 'Fixed Charge' : 'Conditional'}
                                        </button>
                                    ))}
                                </div>

                                {profileForm.deliveryType === 'FREE' && (
                                    <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 text-center font-medium">
                                        🎉 Customers get free delivery on all orders.
                                    </div>
                                )}

                                {profileForm.deliveryType === 'FIXED' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500">Delivery Charge (₹)</label>
                                        <div className="relative">
                                            <IndianRupee size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input 
                                                type="number" 
                                                className="w-full pl-9 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                                placeholder="e.g. 40"
                                                value={profileForm.deliveryCharge} 
                                                onChange={e => setProfileForm({...profileForm, deliveryCharge: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                )}

                                {profileForm.deliveryType === 'CONDITIONAL' && (
                                    <div className="space-y-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600">Standard Delivery Charge (₹)</label>
                                            <input 
                                                type="number" 
                                                className="w-full p-2 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none" 
                                                placeholder="Amount to charge (e.g. 40)"
                                                value={profileForm.deliveryCharge} 
                                                onChange={e => setProfileForm({...profileForm, deliveryCharge: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600">Free Delivery Above Order Value (₹)</label>
                                            <input 
                                                type="number" 
                                                className="w-full p-2 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none" 
                                                placeholder="Min total for free delivery (e.g. 500)"
                                                value={profileForm.minFreeDeliveryAmount} 
                                                onChange={e => setProfileForm({...profileForm, minFreeDeliveryAmount: e.target.value})}
                                            />
                                        </div>
                                        <p className="text-xs text-blue-600 mt-1">
                                            ℹ️ Customers pay ₹{profileForm.deliveryCharge || 0} unless their total is above ₹{profileForm.minFreeDeliveryAmount || 0}.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setShowProfileModal(false)} className="py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={profileLoading} className="py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md flex justify-center items-center gap-2">
                                    {profileLoading && <Loader2 className="animate-spin h-4 w-4" />} Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        {/* --- FULLSCREEN IMAGE MODAL --- */}
        <AnimatePresence>
            {fullscreenImage && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
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

        {/* --- DELETE CONFIRMATION MODAL (FIXED) --- */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Are you sure you want to delete <span className="font-bold text-gray-800">"{productToDelete?.productName}"</span>? This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-md flex justify-center items-center gap-2"
                  >
                    {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 size={18} />}
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}