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
  Building2, // you can choose a suitable icon from lucide-react or your icon library
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const districts = [
  "----------- Jharkhand -----------",
  "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Jamshedpur", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh",
  "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum",
  "----------- Bihar -----------",
  "Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar", "Darbhanga","East Champaran (Motihari)","Gaya","Gopalganj","Jamui","Jehanabad", "Kaimur (Bhabua)","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura", "Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas", "Saharsa","Samastipur","Saran (Chhapra)","Sheikhpura","Sheohar","Sitamarhi", "Siwan","Supaul","Vaishali","West Champaran (Bettiah)",
];

const MERAKI_LINK = "https://www.ulmind.com";

export default function Sidebar({ sidebarOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    const saved = localStorage.getItem("district");
    if (saved && !saved.startsWith("-")) return saved;
    return districts.find((d) => !d.startsWith("-")) || "";
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);

    const onStorageChange = (e) => {
      if (e.key === "district" && e.newValue && e.newValue !== selectedDistrict) {
        setSelectedDistrict(e.newValue);
        if (location.pathname.startsWith("/localnews")) {
          window.location.replace(`/localnews/${encodeURIComponent(e.newValue)}`);
        }
      }
    };
    window.addEventListener("storage", onStorageChange);
    return () => {
      window.removeEventListener("storage", onStorageChange);
    };
  }, [selectedDistrict, location.pathname]);

  const handleDistrictSelect = (district) => {
    if (district.startsWith("-")) return;
    setSelectedDistrict(district);
    setDropdownOpen(false);
    localStorage.setItem("district", district);
    window.location.replace(`/localnews/${encodeURIComponent(district)}`);
  };

  useEffect(() => {
    if (!selectedDistrict.startsWith("-"))
      localStorage.setItem("district", selectedDistrict);
    if (
      location.pathname.startsWith("/localnews") &&
      !selectedDistrict.startsWith("-")
    ) {
      navigate(`/localnews/${encodeURIComponent(selectedDistrict)}`, { replace: true });
    }
  }, [selectedDistrict, location.pathname, navigate]);

  const isActive = (path) =>
    path === "/localnews"
      ? location.pathname.startsWith("/localnews")
      : location.pathname === path;

  const menuItems = [
    {
      name: "Local News",
      icon: Radio,
      path: `/localnews/${encodeURIComponent(selectedDistrict)}`,
    },
    { name: "Jobs", icon: Newspaper, path: "/jobs" },
    { name: "Community", icon: Users, path: "/community" },
    { name: "Events", icon: Home, path: "/events" },
    { name: "Properties", icon: Building2, path: "/properties" }, // New Section
  ];

  const getPostOptions = () => {
    if (role === "admin") return ["Local News", "Jobs", "Events", "Community"];
    return ["Jobs", "Events", "Community"];
  };

  const handleOptionClick = (type) => {
    const token = localStorage.getItem("accessToken");
    setShowModal(false);
    if (!token) {
      navigate("/login");
      return;
    }
    switch (type) {
      case "Jobs": navigate("/create/jobs"); break;
      case "Local News": navigate("/create/localnews"); break;
      case "Community": navigate("/create/community"); break;
      case "Events": navigate("/create/events"); break;
      default: break;
    }
  };

  const handleMenuClick = (item) => {
    if (item.name === "Local News") {
      if (!selectedDistrict) {
        setDropdownOpen(true);
        return;
      }
      navigate(`/localnews/${encodeURIComponent(selectedDistrict)}`);
    } else {
      navigate(item.path);
    }
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          exit={{ x: -250 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="fixed top-0 left-0 h-screen w-64 px-8 py-14 bg-gradient-to-b from-white/90 via-white/80 to-white/70 backdrop-blur-lg border-r border-gray-200 shadow-lg flex flex-col justify-between z-40"
        >
          <div>
            <div className="flex items-center justify-between ">
              <img
                src={logo}
                alt="Logo"
                className="max-h-32 w-auto mt-3 select-none sm:max-h-28 md:max-h-28"
                style={{ marginLeft: '40px' }}
                draggable={false}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X size={24} />
              </motion.button>
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
                className="w-full flex items-center justify-between px-6 py-2 border-2 border-gray-300 rounded-full shadow hover:border-green-600 transition relative bg-white"
              >
                <span className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                  <MapPin className="text-green-600" size={20} />
                  {
                    selectedDistrict.startsWith("-")
                      ? "Select District"
                      : selectedDistrict
                  }
                </span>
                <ChevronDown className="text-gray-500" size={20} />
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 right-0 z-40 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                  {districts.map((district) =>
                    district.startsWith("-----------") ? (
                      <div
                        key={district}
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
                        {district}
                      </div>
                    ) : (
                      <button
                        key={district}
                        onClick={() => handleDistrictSelect(district)}
                        disabled={district.startsWith("-")}
                        className={`w-full text-left px-6 py-3 hover:bg-green-100 text-gray-700 font-medium ${
                          selectedDistrict === district
                            ? "bg-green-50 text-green-700"
                            : ""
                        }`}
                      >
                        {district}
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
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-lg transition-all duration-300
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
                className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-full py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                + Post
              </motion.button>
              <motion.button
                onClick={() => navigate("/emailservice")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold rounded-full py-3 shadow-md hover:bg-blue-600 transition-all"
              >
                <Mail size={18} /> Email Service
              </motion.button>
              <div className="w-full mt-3 flex justify-center">
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
      )}
    </AnimatePresence>
  );
}
