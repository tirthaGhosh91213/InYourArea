// src/pages/CodeOfEthics.jsx

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaBalanceScale,
  FaComments,
  FaCheckCircle,
  FaClock,
  FaPen,
  FaUsers,
  FaUnlock,
  FaEye,
  FaExclamationTriangle,
  FaShieldAlt,
  FaBookOpen,
  FaHeart,
} from "react-icons/fa";
import logo from "../../public/logo.png";

const COLORS = {
  primary: "#0ea77a",
  secondary: "#fbbf24",
  accent: "#10b981",
  dark: "#193c3a",
  light: "#f0fdf4",
  white: "#ffffff",
};

const principles = [
  {
    icon: FaBalanceScale,
    title: "Neutrality & Dialogue",
    points: [
      "Serve as a neutral platform that welcomes voices from different backgrounds and political viewpoints.",
      "Encourage constructive dialogue and problem-solving on issues that matter most.",
    ],
  },
  {
    icon: FaCheckCircle,
    title: "Accuracy Over Speed",
    points: [
      "Present only the most accurate and important information available at the time of reporting.",
      "Avoid speculation; if information is incomplete, we wait before publishing.",
    ],
  },
  {
    icon: FaPen,
    title: "Credit & Originality",
    points: [
      "Always credit sources where applicable.",
      "Plagiarism in any form is strictly prohibited.",
    ],
  },
  {
    icon: FaUsers,
    title: "Balance & Fairness",
    points: [
      "Strive for unbiased and logical opinions.",
      "Include diverse voices in our stories to ensure fairness and depth.",
    ],
  },
  {
    icon: FaUnlock,
    title: "Editorial Independence",
    points: [
      "Keep business interests separate from editorial decisions.",
      "Never allow commercial priorities to influence news coverage.",
    ],
  },
  {
    icon: FaEye,
    title: "Transparency in Content",
    points: [
      "Clearly label sponsored, advertorial, or promotional content.",
      "Ensure readers can distinguish editorial content from advertisements.",
    ],
  },
  {
    icon: FaExclamationTriangle,
    title: "Accountability",
    points: [
      "Publicly acknowledge and correct errors when they occur.",
      "Issue formal apologies where necessary and update the record.",
    ],
  },
  {
    icon: FaShieldAlt,
    title: "Courage Under Pressure",
    points: [
      "Remain steadfast in the face of political, corporate, or legal pressure.",
      "Stand by our editorial team in cases of harassment or disputes.",
    ],
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function CodeOfEthics() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="w-full bg-white scroll-smooth">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 50%, ${COLORS.secondary} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="mb-6 flex justify-center"
          >
            <img
              src={logo}
              alt="Jharkhand Updates Logo"
              className="h-20 md:h-28 drop-shadow-2xl cursor-pointer transition-all duration-300"
            />
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <FaBookOpen className="text-6xl md:text-7xl text-yellow-300 mx-auto drop-shadow-xl" />
          </motion.div>

          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg"
          >
            Code of <span className="text-yellow-300">Ethics</span>
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/95 font-light leading-relaxed max-w-3xl mx-auto"
          >
            Our commitment to transparency, integrity, and dignified conduct
          </motion.p>
        </div>
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </motion.section>

      {/* Introduction */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="max-w-5xl mx-auto px-6 py-16"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-3xl p-10 md:p-14 shadow-xl border border-green-100"
        >
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-justify mb-6">
            At <strong className="text-green-700">Jharkhand Updates</strong> (Updates Ventures Private Limited), we are
            committed to <strong>transparency</strong>, <strong>integrity</strong>, and{" "}
            <strong>dignified conduct</strong> in every aspect of our work. Guided by our mission to bring reliable,
            balanced, and meaningful journalism to the people of Jharkhand, our Code of Ethics serves as the foundation
            for all our decisions and actions.
          </p>
        </motion.div>
      </motion.section>

      {/* Premise */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="bg-gradient-to-r from-green-600 to-emerald-500 py-16 px-6"
      >
        <div className="max-w-5xl mx-auto text-white">
          <motion.div whileHover={{ scale: 1.1, rotate: 10 }} transition={{ duration: 0.3 }}>
            <FaHeart className="text-6xl mx-auto mb-6 text-yellow-300 cursor-pointer" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">Our Premise</h2>
          <p className="text-lg md:text-xl leading-relaxed mb-4 text-justify">
            Jharkhand Updates was founded to bridge the gap between mainstream media narratives and public understanding.
            We believe in <strong className="text-yellow-300">slowing down the rush for "breaking news"</strong> to
            ensure that the information we share is accurate, verified, and impactful.
          </p>
          <p className="text-lg md:text-xl leading-relaxed text-justify">
            Our vision is to be the <strong className="text-yellow-300">most trusted platform</strong> for news and
            information that truly matters to the people of Jharkhand — and to uphold the highest standards of ethical
            journalism.
          </p>
        </div>
      </motion.section>

      {/* Ethical Principles */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-6 py-20"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center" style={{ color: COLORS.dark }}>
          Our Ethical <span style={{ color: COLORS.primary }}>Principles</span>
        </h2>
        <p className="text-center text-gray-600 mb-12 text-lg max-w-3xl mx-auto">
          These principles guide every decision we make and every story we tell.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {principles.map((principle, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02, boxShadow: "0 20px 40px rgba(14,167,122,0.2)" }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-100 hover:border-green-400 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: `${COLORS.primary}15`, color: COLORS.primary }}
                >
                  <principle.icon className="text-4xl" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.dark }}>
                    {principle.title}
                  </h3>
                </div>
              </div>
              <ul className="space-y-3 ml-2">
                {principle.points.map((point, pidx) => (
                  <li key={pidx} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 flex-shrink-0">
                      <FaCheckCircle className="text-lg" />
                    </span>
                    <span className="text-gray-700 leading-relaxed text-justify">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Promise Statement */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="bg-gradient-to-br from-yellow-50 to-green-50 py-16 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-10 md:p-14 shadow-2xl border-t-4 border-yellow-400"
          >
            <div className="text-center mb-6">
              <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.3 }}>
                <FaShieldAlt className="text-6xl mx-auto mb-4" style={{ color: COLORS.secondary }} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: COLORS.dark }}>
                Our <span style={{ color: COLORS.secondary }}>Promise</span>
              </h2>
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-justify">
              This Code of Ethics is <strong className="text-green-700">not just a policy</strong> — it's our{" "}
              <strong className="text-yellow-600">promise</strong> to our readers, contributors, and partners that every
              piece of content from Jharkhand Updates will be guided by{" "}
              <strong className="text-green-700">truth</strong>, <strong className="text-green-700">fairness</strong>,
              and <strong className="text-green-700">responsibility</strong>.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 py-16 px-6 text-center text-white"
      >
        <motion.h2 whileHover={{ scale: 1.05 }} className="text-3xl md:text-5xl font-bold mb-6">
          Trust in <span className="text-yellow-300">Ethical Journalism</span>
        </motion.h2>
        <motion.p whileHover={{ scale: 1.02 }} className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light leading-relaxed">
          Join thousands who rely on us for news that matters — news you can trust.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          className="px-10 py-4 bg-yellow-400 text-gray-900 font-bold text-lg rounded-full shadow-lg hover:bg-yellow-300 transition-all duration-300"
        >
          Get Started
        </motion.button>
      </motion.section>
    </div>
  );
}
