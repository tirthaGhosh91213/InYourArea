import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Radio,
  Newspaper,
  Users,
  Home,
  X,
  Mail,
  MapPin,
  ChevronDown,
  Building2,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const states = [
  "----------- States -----------",
  "Bihar",
  "Jharkhand",
];

const MERAKI_LINK = "https://www.ulmind.com";

export default function Sidebar({ sidebarOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState(null);
  
  const [selectedState, setSelectedState] = useState(() => {
    const saved = localStorage.getItem("state");
    if (saved && !saved.startsWith("-")) return saved;
    return states.find((s) => !s.startsWith("-")) || "";
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);

    const onStorageChange = (e) => {
      if (e.key === "state" && e.newValue && e.newValue !== selectedState) {
        setSelectedState(e.newValue);
        if (location.pathname.startsWith("/statenews")) {
          window.location.replace(`/statenews/${encodeURIComponent(e.newValue)}`);
        }
      }
    };
    window.addEventListener("storage", onStorageChange);
    return () => {
      window.removeEventListener("storage", onStorageChange);
    };
  }, [selectedState, location.pathname]);

  const handleStateSelect = (state) => {
    if (state.startsWith("-")) return;
    setSelectedState(state);
    setDropdownOpen(false);
    localStorage.setItem("state", state);
    window.location.replace(`/statenews/${encodeURIComponent(state)}`);
  };

  useEffect(() => {
    if (!selectedState.startsWith("-"))
      localStorage.setItem("state", selectedState);
    if (
      location.pathname.startsWith("/statenews") &&
      !selectedState.startsWith("-")
    ) {
      navigate(`/statenews/${encodeURIComponent(selectedState)}`, { replace: true });
    }
  }, [selectedState, location.pathname, navigate]);

  const isActive = (path) =>
    path.startsWith("/statenews")
      ? location.pathname.startsWith("/statenews")
      : location.pathname === path;

  const menuItems = [
    {
      name: "State News",
      icon: Radio,
      path: `/statenews/${encodeURIComponent(selectedState)}`,
    },
    { name: "Jobs", icon: Newspaper, path: "/jobs" },
    { name: "Events", icon: Home, path: "/events" },
    { name: "Community", icon: Users, path: "/community" },
    { name: "Properties", icon: Building2, path: "/properties" },
    { name: "Promotions", icon: ShoppingBag, path: "/promotions" }, 
  ];

  const getPostOptions = () => {
    if (role === "admin") return ["Local News", "Jobs", "Events", "Community", "Properties", "Promotion"];
    return ["Jobs", "Events", "Community", "Properties", "Promotion"];
  };

  const handleOptionClick = (type) => {
    setShowModal(false);
    switch (type) {
      case "Jobs":
        navigate("/create/jobs");
        break;
      case "Local News":
        navigate("/create/localnews");
        break;
      case "Community":
        navigate("/create/community");
        break;
      case "Events":
        navigate("/create/events");
        break;
      case "Properties":
        navigate("/create/properties");
        break;
      case "Promotion":
        navigate("/create/promotion");
        break;
      default:
        break;
    }
  };

  const handleMenuClick = (item) => {
    if (item.name === "State News") {
      if (!selectedState) {
        setDropdownOpen(true);
        return;
      }
      navigate(`/statenews/${encodeURIComponent(selectedState)}`);
    } else {
      navigate(item.path);
    }
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* ✅ BACKDROP with HIGH Z-INDEX (z-[998]) */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-[998]"
          />
          
          {/* ✅ SIDEBAR with HIGHEST Z-INDEX (z-[999]) */}
          <motion.aside
            key="sidebar"
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            // Added 'overflow-y-auto' for scrolling on small phones
            // Changed 'py-14' to 'pt-6 pb-6' to move content upper
            className="fixed top-0 left-0 h-screen w-64 px-8 pt-6 pb-6 bg-gradient-to-b from-white/90 via-white/80 to-white/70 backdrop-blur-lg border-r border-gray-200 shadow-lg flex flex-col z-[999] overflow-y-auto relative"
          >
            {/* --- CLOSE BUTTON FIXED AT CORNER --- */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              // Positioned absolutely at top right corner
              className="absolute top-4 right-4 lg:hidden p-2 rounded-full hover:bg-gray-100 transition cursor-pointer text-gray-600 hover:text-red-500 z-50"
            >
              <X size={24} />
            </motion.button>

            <div>
              {/* --- LOGO SECTION CENTERED AND SMALLER --- */}
              <div className="flex flex-col items-center justify-center w-full mb-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="cursor-pointer flex justify-center"
                >
                  <img
                    src={logo}
                    alt="Logo"
                    // Changed size to w-28 (approx 7rem) to make it "thora small"
                    // Removed marginLeft to center it properly
                    className="w-28 object-contain select-none"
                    draggable={false}
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="py-3 relative"
              >
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-6 py-2 border-2 border-gray-300 rounded-full shadow hover:border-green-600 transition relative bg-white cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                    <MapPin className="text-green-600" size={20} />
                    {selectedState.startsWith("-") ? "Select State" : selectedState}
                  </span>
                  <ChevronDown className="text-gray-500" size={20} />
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 right-0 z-40 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto cursor-pointer">
                    {states.map((state) =>
                      state.startsWith("-----------") ? (
                        <div
                          key={state}
                          className="w-full px-6 py-3 font-bold text-green-600 bg-gray-50 cursor-not-allowed select-none"
                          style={{
                            fontWeight: "bold",
                            color: "#10b981",
                            background: "#f1f5f9",
                            fontSize: "1rem",
                            letterSpacing: "2px",
                          }}
                          tabIndex={-1}
                        >
                          {state}
                        </div>
                      ) : (
                        <button
                          key={state}
                          onClick={() => handleStateSelect(state)}
                          disabled={state.startsWith("-")}
                          className={`w-full text-left px-6 py-3 hover:bg-green-100 text-gray-700 font-medium cursor-pointer ${
                            selectedState === state
                              ? "bg-green-50 text-green-700"
                              : ""
                          }`}
                        >
                          {state}
                        </button>
                      )
                    )}
                  </div>
                )}
              </motion.div>
              <nav className="flex flex-col gap-3 mt-4">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <motion.button
                      key={item.name}
                      onClick={() => handleMenuClick(item)}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-lg transition-all duration-300 cursor-pointer
                      ${
                        active
                          ? "bg-red-500 text-white shadow-lg"
                          : "text-gray-700 hover:bg-green-100 hover:text-green-700"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={`${active ? "text-white" : "text-green-600"}`}
                      />
                      {item.name}
                    </motion.button>
                  );
                })}
                <div className="border-t border-gray-200 my-2"></div>
                <motion.button
                  onClick={() => setShowModal(true)}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 20px rgba(34,197,94,0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-full py-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  + Post
                </motion.button>
                <motion.button
                  onClick={() => navigate("/emailservice")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold rounded-full py-3 shadow-md hover:bg-blue-600 transition-all cursor-pointer"
                >
                  <Mail size={18} /> Email Service
                </motion.button>
                <div className="w-full mt-3 flex justify-center pb-4">
                  <p className="text-xs">
                    <span className="text-gray-600 font-semibold">Powered by </span>
                    <a
                      href={MERAKI_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 font-bold underline hover:text-green-800 transition"
                    >
                      ULMiND
                    </a>
                  </p>
                </div>
              </nav>
            </div>
            <AnimatePresence>
              {showModal && (
                <motion.div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-2xl w-80 p-6 text-center relative"
                  >
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                    <h2 className="text-2xl font-semibold text-green-600 mb-4">
                      Choose Post Type
                    </h2>
                    <div className="flex flex-col gap-3">
                      {getPostOptions().map((type) => (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleOptionClick(type)}
                          className="py-2 bg-green-100 text-green-700 font-medium rounded-xl hover:bg-green-200 transition-all"
                        >
                          {type}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}