// src/pages/PrivacyPolicy.jsx

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaUserShield,
  FaCookie,
  FaDatabase,
  FaLock,
  FaExchangeAlt,
  FaUserCheck,
  FaEnvelope,
  FaGlobe,
  FaInfoCircle,
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

const sections = [
  {
    id: "acceptance",
    icon: FaUserCheck,
    title: "1. Acceptance of Policy",
    content:
      "By accessing, browsing, or using our Website, you agree to be bound by the terms of this Privacy Policy and consent to the collection, use, and disclosure of your information in accordance with it. If you do not agree, please discontinue use of the Website immediately.",
  },
  {
    id: "definitions",
    icon: FaInfoCircle,
    title: "2. Definitions",
    definitions: [
      {
        term: "Personal Information",
        definition:
          "Information that identifies you as an individual, such as your name, address, contact number, or email address.",
      },
      {
        term: "User Information",
        definition:
          "Any data submitted by you to the Website, including but not limited to Personal Information, social media profile details, or other content provided for identification or verification.",
      },
    ],
  },
  {
    id: "collection",
    icon: FaDatabase,
    title: "3. Information We Collect",
    subsections: [
      {
        subtitle: "3.1 Information Provided by You",
        text: "Name, email address, phone number, and any other details you voluntarily submit through forms, uploads, or communication with us. Content you publish, upload, or submit to our Website.",
      },
      {
        subtitle: "3.2 Information Collected Automatically",
        text: "IP address, browser type, operating system, and internet service provider details; Pages visited, time and date of visit, and duration of your session; Other technical and navigational data for analytics and security purposes.",
      },
      {
        subtitle: "3.3 Third-Party Data",
        text: "We may receive information about you from publicly available sources or third-party service providers (e.g., Google Analytics, Google AdSense, Hotjar).",
      },
    ],
  },
  {
    id: "cookies",
    icon: FaCookie,
    title: "4. Use of Cookies",
    content:
      "We use cookies and similar technologies to enhance your browsing experience, store user preferences, and analyse traffic patterns. You can control or disable cookies through your browser settings; however, some features of the Website may not function properly without them.",
  },
  {
    id: "purpose",
    icon: FaUserShield,
    title: "5. Purpose of Data Collection",
    list: [
      "Verifying your identity",
      "Personalising Website content",
      "Responding to queries or complaints",
      "Delivering updates, notifications, and newsletters",
      "Improving our Website's functionality and content",
      "Preventing fraud, abuse, and security threats",
      "Complying with legal obligations",
    ],
    note: "We do not sell or rent your personal data to third parties.",
  },
  {
    id: "sharing",
    icon: FaExchangeAlt,
    title: "6. Sharing of Information",
    list: [
      "Service providers, contractors, or affiliates who assist in our operations and are bound by confidentiality obligations",
      "Advertisers or research organisations (only in anonymised or aggregated form)",
      "Authorities or regulators when required by law or to protect our legal rights",
      "Successors or acquirers in case of a merger, acquisition, or sale of assets",
    ],
  },
  {
    id: "security",
    icon: FaLock,
    title: "7. Data Storage & Security",
    content:
      "Your information is stored on secure servers (including cloud services such as Aruba Cloud) with appropriate physical, electronic, and managerial safeguards. While we employ industry-standard protection, no system is completely secure, and we cannot guarantee absolute security of data transmitted over the internet. We retain your data only for as long as necessary to provide services, plus an additional 30 days thereafter, after which it is permanently deleted.",
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
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export default function PrivacyPolicy() {
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
            <FaShieldAlt className="text-6xl md:text-7xl text-yellow-300 mx-auto drop-shadow-xl" />
          </motion.div>

          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg"
          >
            Privacy <span className="text-yellow-300">Policy</span>
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/95 font-light leading-relaxed max-w-3xl mx-auto"
          >
            Your privacy matters to us. Learn how we protect your data.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-white/90 text-sm"
          >
            <p>
              <strong>Effective Date:</strong> 14 August 2025
            </p>
            <p>
              <strong>Last Updated:</strong> 14 August 2025
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </motion.section>

      {/* Introduction */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="max-w-6xl mx-auto px-6 py-16"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-3xl p-10 md:p-14 shadow-xl border border-green-100"
        >
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-justify mb-4">
            This Privacy Policy is published in compliance with the provisions of the{" "}
            <strong className="text-green-700">Information Technology Act, 2000</strong> and applicable rules
            thereunder. This document is an electronic record generated by a computer system and does not require any
            physical or digital signatures.
          </p>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-justify">
            <strong className="text-green-700">Jharkhand Updates</strong> ("we", "us", "our") is committed to
            safeguarding the privacy of visitors, users, and contributors ("you" or "your") to our website{" "}
            <a
              href="https://www.jharkhandupdates.com"
              className="text-green-600 underline hover:text-green-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.jharkhandupdates.com
            </a>{" "}
            ("Website"). This Privacy Policy outlines how we collect, use, store, and protect your personal data, as
            well as your rights in relation to it.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Sections */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        className="max-w-6xl mx-auto px-6 py-10"
      >
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              variants={fadeInUp}
              whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(14,167,122,0.15)" }}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-100 hover:border-green-300 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className="p-4 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: `${COLORS.primary}15`, color: COLORS.primary }}
                >
                  <section.icon className="text-3xl" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.dark }}>
                  {section.title}
                </h2>
              </div>

              {section.content && <p className="text-gray-700 leading-relaxed text-justify ml-2">{section.content}</p>}

              {section.definitions && (
                <div className="space-y-3 ml-2">
                  {section.definitions.map((item, iidx) => (
                    <div key={iidx} className="border-l-4 border-green-300 pl-4">
                      <p className="font-bold text-green-700">{item.term}</p>
                      <p className="text-gray-700 text-justify">{item.definition}</p>
                    </div>
                  ))}
                </div>
              )}

              {section.subsections && (
                <div className="space-y-4 ml-2">
                  {section.subsections.map((sub, sidx) => (
                    <div key={sidx}>
                      <h3 className="font-bold text-lg mb-2" style={{ color: COLORS.accent }}>
                        {sub.subtitle}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-justify">{sub.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {section.list && (
                <div className="ml-2">
                  <ul className="space-y-2">
                    {section.list.map((item, lidx) => (
                      <li key={lidx} className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-gray-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {section.note && (
                    <p className="mt-4 text-sm italic text-gray-600 border-l-4 border-yellow-400 pl-4">
                      <strong>Note:</strong> {section.note}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Additional Sections */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="bg-gradient-to-br from-yellow-50 to-green-50 py-16 px-6"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-100"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: COLORS.dark }}>
              <FaGlobe style={{ color: COLORS.secondary }} />
              8. Public Forums
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Any information disclosed in public forums (blogs, chat rooms, bulletin boards) on the Website becomes
              public information. Exercise caution before sharing personal data in these spaces.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-100"
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.dark }}>
              9. Changes to this Policy
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              We reserve the right to amend this Privacy Policy at any time without prior notice. Updated versions will
              be posted on this page, and continued use of the Website will constitute acceptance of the revised terms.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-8 shadow-lg border-2 border-yellow-300"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: COLORS.dark }}>
              <FaEnvelope style={{ color: COLORS.secondary }} />
              10. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              For questions regarding this Privacy Policy or your data, please contact:
            </p>
            <p className="text-green-600 font-semibold">
              📧{" "}
              <a href="mailto:support@jharkhandupdates.com" className="underline hover:text-green-700">
                support@jharkhandupdates.com
              </a>
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-100">
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.dark }}>
              11. Email Opt-Out
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              You may opt out of receiving promotional emails by writing to{" "}
              <a
                href="mailto:editor@jharkhandupdates.com"
                className="text-green-600 underline hover:text-green-700 font-semibold"
              >
                editor@jharkhandupdates.com
              </a>
              . Please allow up to 10 days for processing.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-100">
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.dark }}>
              12. Rights of EU Residents
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify mb-3">
              If you are a resident of the European Union, you have the rights to:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-3">
                <span className="text-green-500">•</span>
                <span className="text-gray-700">Access, correct, or delete your personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500">•</span>
                <span className="text-gray-700">Restrict or object to processing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500">•</span>
                <span className="text-gray-700">Request data portability</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500">•</span>
                <span className="text-gray-700">Withdraw consent at any time</span>
              </li>
            </ul>
            <p className="text-sm italic text-gray-600 mt-4 border-l-4 border-yellow-400 pl-4">
              If you are under 16 years of age, parental or guardian consent is required before submitting any Personal
              Information.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer Note */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 py-16 px-6 text-center text-white"
      >
        <p className="text-lg md:text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
          This Privacy Policy is designed to provide transparency while meeting the requirements of the{" "}
          <strong className="text-yellow-300">Information Technology Act, 2000</strong>, the{" "}
          <strong className="text-yellow-300">General Data Protection Regulation (GDPR)</strong> (where applicable), and
          other relevant data protection laws.
        </p>
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
