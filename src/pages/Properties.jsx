import React, { useEffect, useState } from "react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import { useNavigate } from "react-router-dom";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      "https://api.jharkhandbiharupdates.com/api/v1/properties/recent?days=15"
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch properties");
        }
        return res.json();
      })
      .then((data) => {
        const allProps = data.properties || data.data || [];
        // Only show approved properties
        const approved = allProps.filter(
          (prop) =>
            prop.status === "APPROVED" ||
            !prop.status ||
            prop.status.toLowerCase() === "approved"
        );
        setProperties(approved);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar />
      </div>

      <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-100 overflow-hidden pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 relative">
          {/* Soft floating shapes in background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-16 left-0 w-52 h-52 bg-sky-200/40 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="relative z-10 max-w-xl w-full">
            <div className="mx-auto flex flex-col items-center text-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-50 px-6 py-10 sm:px-10 sm:py-12">
              {/* Glowing pill */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 border border-emerald-100 shadow-sm animate-bounce">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  New feature
                </span>
              </div>

              {/* Main animated heading */}
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                Properties is coming soon
              </h1>

              {/* Friendly subtext */}
              <p className="text-sm sm:text-base text-slate-600 mb-6 max-w-md">
                A fresh experience to explore, list, and discover local properties 
                is being crafted with care. Sit tight, this space will be worth the wait.
              </p>

              {/* Animated dots loader */}
              <div className="flex items-center gap-1 mb-8">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.2s]" />
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.1s]" />
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-bounce" />
              </div>

              {/* Optional: back button */}
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-sm font-semibold px-5 py-2 shadow-md hover:bg-emerald-700 transition-transform transform hover:-translate-y-0.5"
              >
                ← Go back
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
