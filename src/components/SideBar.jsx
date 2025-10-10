import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Radio, Newspaper, Users, Home, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PostcodeDropdown from "../pages/PostcodeDropdown";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: "Local News", icon: Radio, path: "/localnews" },
    { name: "Jobs", icon: Newspaper, path: "/jobs" },
    { name: "Community", icon: Users, path: "/community" },
    { name: "Events", icon: Home, path: "/events" },
  ];

  const handleOptionClick = (type) => {
    const token = localStorage.getItem("accessToken");
    setShowModal(false);
    if (token) {
      navigate(`/create-post/${type.toLowerCase()}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <aside className="w-64 px-10 py-5 bg-gradient-to-b from-white/90 via-white/80 to-white/70 backdrop-blur-lg border-r border-gray-200 shadow-lg flex flex-col justify-between transition-all duration-500 hover:shadow-2xl ">
        <div>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 py-6 border-b border-gray-200"
          >
            <span className="text-green-600 text-3xl font-extrabold tracking-tight select-none">
              InYourArea
            </span>
          </motion.div>

          {/* Postcode Dropdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="py-4"
          >
            <PostcodeDropdown initialPostcode="SW1A1AA" />
          </motion.div>

          {/* Sidebar Menu */}
          <nav className="flex flex-col gap-3 mt-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.button
                  key={item.name}
                  onClick={() => navigate(item.path)}
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

            {/* Divider Line */}
            <div className="border-t border-gray-200 my-3"></div>

            {/* Post Button */}
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

            {/* Divider Line Below */}
            <div className="border-t border-gray-200 my-3"></div>
          </nav>
        </div>
      </aside>

      {/* Popup Modal */}
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
                {["Local News", "Jobs", "Events", "Community"].map((type) => (
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
    </>
  );
}
