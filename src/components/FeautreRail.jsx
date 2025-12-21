// src/components/FeatureRailSmall.jsx

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import img1 from "../assets/locanewsPost.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/jobPostmain.png";
import img4 from "../assets/communityPost.png";

const ACCENT = {
  soft: "#f6f8fa", // updated to match bg
  deep: "#0ea77a",
  text: "#193c3a",
  shadow: "0 8px 32px rgba(14,167,122,0.12)",
  border: "#e4e7ea",
  gradient: "linear-gradient(95deg, #ffffff 75%, #f4f6f8 100%)",
  grayBg: "#f4f6f8", // use as main background
};

const features = [
  {
    icon: "📰",
    title: "Local News",
    text: "Quickly browse essential updates, right from your neighborhood—never miss what matters, no clutter.",
    img: img1,
  },
  {
    icon: "👥",
    title: "Community",
    text: "Share, ask, belong. A place to see, support, and celebrate locals—together.",
    img: img2,
  },
  {
    icon: "💼",
    title: "Jobs",
    text: "Roles close to home, surfaced simply—find your next step, easily and quickly.",
    img: img3,
  },
  {
    icon: "📅",
    title: "Events",
    text: "The market, the meetup, the moment. All organized, simply. For you.",
    img: img4,
  },
];

function FeatureCard({ icon, title, text, img, flip, onClick }) {
  return (
    <motion.section
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.8 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  className={`flex flex-col md:flex-row ${
    flip ? "md:flex-row-reverse" : ""
  } items-center gap-8 md:gap-16 rounded-3xl p-6 md:p-12 cursor-pointer
  bg-transparent shadow-none`}   // no bg, no shadow
  style={{
    // remove these two completely
    // boxShadow: ACCENT.shadow,
    // background: ACCENT.gradient,
    // optionally also remove border if you want zero card feel:
    // border: `1.5px solid ${ACCENT.border}`,
    marginTop: "0.5rem",
    marginBottom: "2.6rem",
  }}
  onClick={onClick}
>
      <motion.div
        className="w-full md:w-2/5 flex justify-center items-center"
        initial={{ scale: 0.97, opacity: 0.75 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, type: "spring", bounce: 0.44 }}
      >
        <img
          src={img}
          alt={title}
          className="max-w-[210px] md:max-w-xs rounded-2xl border-2 border-[#e4e7ea] shadow-md"
          style={{
            boxShadow: "0 4px 32px rgba(95,209,158,0.09)",
            background: ACCENT.soft,
          }}
        />
      </motion.div>
      <div className="flex-1 flex flex-col items-center md:items-start">
        <motion.div
          className="flex items-center justify-center md:justify-start gap-3 mb-2"
          initial={{ scale: 0.93, rotate: -8, opacity: 0 }}
          whileInView={{ scale: 1.13, rotate: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 110, delay: 0.12 }}
        >
          <span
            className="h-11 w-11 rounded-xl flex items-center justify-center text-2xl md:text-3xl
            font-bold shadow bg-[#f2f5f7] text-[#0ea77a] border border-[#d4dade]"
          >
            {icon}
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{
              color: ACCENT.text,
              background: "linear-gradient(90deg, #12b37b 30%, #0ea77a 70%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </h2>
        </motion.div>
        <motion.p
          className="mt-2 text-lg md:text-xl text-[#4b5a57] text-center md:text-left font-semibold opacity-90"
          transition={{ duration: 0.5, delay: 0.07 }}
        >
          {text}
        </motion.p>
      </div>
    </motion.section>
  );
}

export default function FeatureRailSmall() {
  const navigate = useNavigate();
  const [showDistrictPopup, setShowDistrictPopup] = useState(false);
  const topRef = useRef(null);

  const handleFeatureClick = (title) => {
    if (title === "Community") {
      navigate("/community");
      return;
    }
    if (title === "Jobs") {
      navigate("/jobs");
      return;
    }
    if (title === "Events") {
      navigate("/events");
      return;
    }
    if (title === "Local News") {
      // Scroll to top
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Show popup
      setShowDistrictPopup(true);
    }
  };

  return (
    <main
      ref={topRef}
      className="w-full min-h-screen flex flex-col items-center justify-center py-6 px-3 md:px-0 relative"
      style={{ background: ACCENT.grayBg }}
    >
      {/* Simple popup / modal */}
      {showDistrictPopup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl px-6 py-5 md:px-8 md:py-6 max-w-sm w-[90%]">
            <h3 className="text-xl font-bold mb-3 text-[#193c3a] text-center">
              select a district
            </h3>
            <p className="text-sm text-[#4b5a57] text-center mb-4">
              Please select a district to see local news tailored to your area.
            </p>
            <button
              onClick={() => setShowDistrictPopup(false)}
              className="mt-1 w-full rounded-xl bg-[#0ea77a] text-white font-semibold py-2.5 text-sm shadow-md hover:bg-[#0c9068] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <header className="mb-8 md:mt-7 flex flex-col items-center">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "circOut" }}
          style={{
            color: ACCENT.text,
            letterSpacing: "0.01em",
          }}
        >
          Discover Local <span style={{ color: ACCENT.deep }}>Life</span>
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-[#537170]/80 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.3 }}
        >
          Your home for news, jobs, connection—and belonging.
        </motion.p>
      </header>

      <section className="w-full max-w-4xl">
        {features.map((f, i) => (
          <FeatureCard
            {...f}
            flip={i % 2 === 1}
            key={f.title}
            onClick={() => handleFeatureClick(f.title)}
          />
        ))}
      </section>
    </main>
  );
}
