// src/components/EmailService.jsx
import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EmailService({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const showToast = (msg, type = "success") =>
    toast[type](msg, {
      position: "top-center",
      autoClose: 2000,
      theme: "colored",
    });

  // Subscribe
  const handleSubscribe = async () => {
    if (!email || !password) {
      showToast("Please enter both email and password.", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/subscribe?email=${encodeURIComponent(email)}`,
        { email, password }
      );
      if (res.data.success) {
        showToast("Subscribed successfully!");
        setSubscribed(true);
      } else {
        showToast(res.data.message || "Subscription failed.", "error");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        showToast("You're already subscribed!", "info");
        setSubscribed(true);
      } else {
        showToast("Something went wrong. Try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Unsubscribe
  const handleUnsubscribe = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `http://localhost:8000/api/v1/subscribe?email=${encodeURIComponent(email)}`
      );
      if (res.data.success) {
        showToast("Unsubscribed successfully!");
        setSubscribed(false);
        setEmail("");
        setPassword("");
      } else {
        showToast(res.data.message || "Unsubscribe failed.", "error");
      }
    } catch {
      showToast("Unable to process unsubscribe request.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <ToastContainer />
      <motion.div
        className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 sm:p-10 text-center flex flex-col items-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-3">
            {subscribed ? "Manage Subscription" : "Email Subscription"}
          </h2>

          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {subscribed
              ? "You are already subscribed. You can unsubscribe below."
              : "Enter your email and password to subscribe for updates."}
          </p>

          {!subscribed && (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-5 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </>
          )}

          {loading ? (
            <div className="flex flex-col items-center gap-2 mt-4">
              <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
              <p className="text-sm text-emerald-700 font-medium">
                Processing... Please wait
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full mt-2">
              {subscribed ? (
                <button
                  onClick={handleUnsubscribe}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
                >
                  Unsubscribe
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all"
                >
                  Subscribe
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
