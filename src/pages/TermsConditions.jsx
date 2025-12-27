// src/pages/TermsConditions.jsx

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaFileContract,
  FaUserCheck,
  FaCopyright,
  FaCheckSquare,
  FaExclamationTriangle,
  FaBan,
  FaLink,
  FaShieldAlt,
  FaGavel,
  FaEdit,
  FaTimesCircle,
  FaFileAlt,
  FaEnvelope,
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
    id: "introduction",
    icon: FaFileContract,
    title: "1. Introduction",
    content:
      "These Terms and Conditions ('Terms') govern your access to and use of the website operated by Updates Ventures Private Limited ('Jharkhand Updates,' 'we,' 'us,' or 'our'), a company incorporated under the Companies Act, 2013, having its registered office at H No 02, PS Sec 9, Madhudih Vill, Ranipokhar, Bokaro, Jharkhand, India, 827009.",
    extra:
      "Jharkhand Updates is engaged in the business of digital news media content production, publishing, distribution, and promotion (the 'Business').",
  },
  {
    id: "eligibility",
    icon: FaUserCheck,
    title: "2. Eligibility & User Declaration",
    list: [
      "You are at least 18 years old and legally capable of entering into a binding contract",
      "All information you provide is accurate, complete, and current",
      "You will maintain the accuracy of such information and update it as necessary",
      "You will comply with all applicable laws and regulations",
    ],
    note: "You authorize us to collect and process personal data you provide in accordance with our Privacy Policy.",
  },
  {
    id: "ownership",
    icon: FaCopyright,
    title: "3. Ownership of Content",
    content:
      "All Content on the Website is the exclusive property of Jharkhand Updates, its affiliates, licensors, or content providers, and is protected under applicable intellectual property laws, including copyright and trademark laws.",
    prohibitions: [
      "Copy, reproduce, distribute, republish, download, display, post, or transmit any Content",
      "Modify or create derivative works of the Content",
      "Use the Content for commercial purposes without authorization",
    ],
  },
  {
    id: "permitted",
    icon: FaCheckSquare,
    title: "4. Permitted Use",
    content:
      "You are granted a limited, revocable, non-exclusive, and non-transferable license to access and use the Website for lawful personal, non-commercial purposes only.",
    mustNot: [
      "Use for any unlawful purpose",
      "Violate the rights of others, including intellectual property, privacy, or contractual rights",
      "Upload malicious software or code",
      "Collect personal data without consent",
      "Post false, misleading, defamatory, obscene, or discriminatory content",
      "Interfere with the security, functionality, or availability of the Website",
    ],
  },
  {
    id: "disclaimer",
    icon: FaExclamationTriangle,
    title: "5. Disclaimer of Warranties",
    content:
      "The Website and Content are provided on an 'as is' and 'as available' basis without warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, completeness, or non-infringement.",
  },
  {
    id: "liability",
    icon: FaBan,
    title: "6. Limitation of Liability",
    content:
      "To the fullest extent permitted by law, Jharkhand Updates, its directors, officers, employees, affiliates, and agents shall not be liable for any indirect, incidental, consequential, punitive, or special damages arising out of or in connection with your use of the Website, even if advised of the possibility of such damages.",
  },
  {
    id: "thirdparty",
    icon: FaLink,
    title: "7. Third-Party Links and Services",
    content:
      "The Website may contain links to third-party websites or services. We do not control, endorse, or assume responsibility for the content, policies, or practices of such third parties. Your dealings with third parties are solely between you and the relevant third party.",
  },
  {
    id: "indemnification",
    icon: FaShieldAlt,
    title: "8. Indemnification",
    content:
      "You agree to indemnify, defend, and hold harmless Jharkhand Updates, its affiliates, licensors, and service providers from and against all claims, damages, liabilities, costs, and expenses (including legal fees) arising out of or related to:",
    list: ["Your use of the Website", "Your violation of these Terms", "Your infringement of any third-party rights"],
  },
  {
    id: "governing",
    icon: FaGavel,
    title: "9. Governing Law and Jurisdiction",
    content:
      "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Bokaro, Jharkhand.",
  },
  {
    id: "changes",
    icon: FaEdit,
    title: "10. Changes to the Terms",
    content:
      "We reserve the right to modify these Terms at any time without prior notice. Updated Terms will be posted on the Website with the 'Last Updated' date. Continued use of the Website after changes are posted constitutes your acceptance of the revised Terms.",
  },
  {
    id: "termination",
    icon: FaTimesCircle,
    title: "11. Termination",
    content:
      "We may suspend or terminate your access to the Website at any time, with or without cause, without liability to you. Upon termination, your right to use the Website shall immediately cease.",
  },
  {
    id: "entire",
    icon: FaFileAlt,
    title: "12. Entire Agreement",
    content:
      "These Terms, together with our Privacy Policy and any additional terms posted on the Website, constitute the entire agreement between you and Jharkhand Updates regarding your use of the Website and supersede all prior agreements or understandings, whether written or oral.",
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
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

export default function TermsConditions() {
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
            <FaFileContract className="text-6xl md:text-7xl text-yellow-300 mx-auto drop-shadow-xl" />
          </motion.div>

          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg"
          >
            Terms & <span className="text-yellow-300">Conditions</span>
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/95 font-light leading-relaxed max-w-3xl mx-auto"
          >
            Understanding your rights and responsibilities
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-white/90 text-sm"
          >
            <p>
              <strong>Last Updated:</strong> 14 August 2025
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </motion.section>

      {/* Legal Notice */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="max-w-6xl mx-auto px-6 py-16"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-3xl p-10 md:p-14 shadow-xl border-2 border-red-200"
        >
          <h2 className="text-3xl font-bold mb-4 text-center text-red-700">THIS IS A LEGALLY BINDING AGREEMENT</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-justify mb-4">
            By accessing or using the Jharkhand Updates website, you agree to comply with and be bound by these Terms
            and Conditions. <strong className="text-red-600">If you do not agree, you must immediately discontinue use of the website.</strong>
          </p>
          <p className="text-gray-600 text-justify">
            This document is an electronic record generated under the provisions of the Information Technology Act,
            2000, and the rules made thereunder. It does not require any physical or digital signatures.
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

              {section.content && <p className="text-gray-700 leading-relaxed text-justify ml-2 mb-4">{section.content}</p>}

              {section.extra && <p className="text-gray-700 leading-relaxed text-justify ml-2 mb-4">{section.extra}</p>}

              {section.prohibitions && (
                <div className="ml-2 mb-4">
                  <p className="font-semibold text-red-600 mb-2">Except as expressly permitted in writing by us, you may not:</p>
                  <ul className="space-y-2">
                    {section.prohibitions.map((item, pidx) => (
                      <li key={pidx} className="flex items-start gap-3">
                        <span className="text-red-500">✗</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.mustNot && (
                <div className="ml-2 mb-4">
                  <p className="font-semibold text-red-600 mb-2">You must not use the Website:</p>
                  <ul className="space-y-2">
                    {section.mustNot.map((item, midx) => (
                      <li key={midx} className="flex items-start gap-3">
                        <span className="text-red-500">✗</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm italic text-gray-600 mt-4 border-l-4 border-yellow-400 pl-4">
                    We reserve the right to suspend or terminate your access for any violation of these Terms.
                  </p>
                </div>
              )}

              {section.list && (
                <div className="ml-2">
                  <ul className="space-y-2">
                    {section.list.map((item, lidx) => (
                      <li key={lidx} className="flex items-start gap-3">
                        <span className="text-green-500">•</span>
                        <span className="text-gray-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.note && (
                <p className="mt-4 text-sm italic text-gray-600 border-l-4 border-yellow-400 pl-4 ml-2">
                  <strong>Note:</strong> {section.note}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="bg-gradient-to-br from-yellow-50 to-green-50 py-16 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-3xl p-10 md:p-14 shadow-2xl border-t-4 border-green-500"
          >
            <div className="text-center mb-6">
              <FaEnvelope className="text-6xl mx-auto mb-4" style={{ color: COLORS.secondary }} />
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: COLORS.dark }}>
                13. Contact Us
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-4 text-center">
              If you have any questions or concerns about these Terms, you may contact us at:
            </p>
            <div className="text-center text-gray-700 space-y-2">
              <p className="font-bold text-green-700">Updates Ventures Private Limited</p>
              <p>H No 02, PS Sec 9, Madhudih Vill, Ranipokhar</p>
              <p>Bokaro, Jharkhand, India, 827009</p>
              <p className="text-green-600 font-semibold mt-4">
                📧{" "}
                <a href="mailto:support@jharkhandupdates.com" className="underline hover:text-green-700">
                  support@jharkhandupdates.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 py-16 px-6 text-center text-white"
      >
        <motion.h2 whileHover={{ scale: 1.05 }} className="text-3xl md:text-5xl font-bold mb-6">
          Ready to <span className="text-yellow-300">Get Started?</span>
        </motion.h2>
        <motion.p whileHover={{ scale: 1.02 }} className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light leading-relaxed">
          Join our community and stay informed with news that matters.
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
