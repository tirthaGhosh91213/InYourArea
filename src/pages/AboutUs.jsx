// src/pages/AboutUs.jsx

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaHandshake,
  FaUsers,
  FaBalanceScale,
  FaBullhorn,
  FaNewspaper,
  FaLeaf,
  FaShieldAlt,
  FaGraduationCap,
  FaPlane,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
} from "react-icons/fa";


const COLORS = {
  primary: "#0ea77a",
  secondary: "#fbbf24",
  accent: "#10b981",
  dark: "#193c3a",
  light: "#f0fdf4",
  white: "#ffffff",
};

const values = [
  { icon: FaHeart, title: "Empathy", desc: "Understanding and caring for our community" },
  { icon: FaHandshake, title: "Coexistence", desc: "Celebrating diversity and unity" },
  { icon: FaUsers, title: "Volunteerism", desc: "Driven by passion, not profit" },
  { icon: FaBalanceScale, title: "Equal Rights", desc: "Justice and fairness for all" },
  { icon: FaBullhorn, title: "Free Expression", desc: "Amplifying voices that matter" },
];

const coverage = [
  { icon: FaBalanceScale, title: "Citizenship & Governance" },
  { icon: FaLeaf, title: "Environment & Social Awareness" },
  { icon: FaShieldAlt, title: "Online Crime & Technology" },
  { icon: FaGraduationCap, title: "Education, Weather, Events & Lifestyle" },
  { icon: FaPlane, title: "Travel & Health Care" },
];

const founders = [
  {
    name: "Mithilesh Kumar Singh",
    role: "Co-Founder",
    image: "/mithileshsingh.png",
    bio: "Visionary leader passionate about bringing authentic stories from Jharkhand to the world.",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "mailto:mithilesh@jhupdates.com",
    },
  },
  {
    name: "Shailesh Kumar Singh",
    role: "Co-Founder",
    image: "/saileshsingh.png",
    bio: "Dedicated to building a media platform that empowers communities and inspires change.",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "mailto:shailesh@jhupdates.com",
    },
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

export default function AboutUs() {
  const navigate = useNavigate();

  const handleGetInvolved = () => {
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
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 50%, ${COLORS.secondary} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="mb-8 flex justify-center"
          >
            <img 
              src={"/logo.png"} 
              alt="Jharkhand Updates Logo" 
              className="h-24 md:h-32 drop-shadow-2xl cursor-pointer transition-all duration-300"
            />
          </motion.div>
          
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg"
          >
            About <span className="text-yellow-300">Jharkhand Updates</span>
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/95 font-light leading-relaxed max-w-3xl mx-auto"
          >
            Stories that matter. Voices that inspire. Change that lasts.
          </motion.p>
        </div>
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </motion.section>

      {/* Main Mission */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="max-w-6xl mx-auto px-6 py-16"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-3xl p-10 md:p-16 shadow-xl border border-green-100 hover:shadow-2xl transition-shadow duration-300"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center" style={{ color: COLORS.dark }}>
            Our <span style={{ color: COLORS.primary }}>Mission</span>
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
            <p className="text-justify">
              <strong className="text-green-700">Jharkhand Updates</strong> is an independent, public-spirited digital
              media platform dedicated to telling stories that matter from every corner of Jharkhand. We bring you
              news, lifestyle, events, weather, and travel updates — all crafted to inform, inspire, and engage.
            </p>
            <p className="text-justify">
              Our stories can make you feel <em>surprised, happy, inspired, provoked, or even sad</em> — because real
              stories have the power to open hearts, change minds, and sometimes even change the world. We believe that
              a few concerned citizens, with a little love and courage, can make our state and our world a better place.
              The <strong className="text-green-700">Jharkhand Updates community</strong> is home to such socially
              conscious citizens.
            </p>
            <p className="text-justify">
              We strive to be <strong>democratized and approachable media</strong> — giving individuals, communities,
              and non-profits a platform to highlight the issues, voices, and ideas that deserve attention. Launched in{" "}
              <strong className="text-yellow-600">2018</strong>, our mission is to reach the youth of Jharkhand and
              build the most professional and impactful media outlet ever to come out of the state.
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* Why Independent Media Matters */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="bg-gradient-to-r from-green-600 to-emerald-500 py-16 px-6"
      >
        <div className="max-w-5xl mx-auto text-white">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <FaNewspaper className="text-6xl mx-auto mb-6 text-yellow-300 cursor-pointer" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">Why Independent Media Matters</h2>
          <p className="text-xl md:text-2xl leading-relaxed mb-4 font-light text-justify">
            In today's world, there's news they want you to know — and news that truly needs your attention.{" "}
            <strong>We choose the latter.</strong>
          </p>
          <p className="text-lg md:text-xl leading-relaxed mx-auto text-justify">
            Independence allows us to raise issues that matter without fear or favor. We accept{" "}
            <strong className="text-yellow-300">no funding</strong> from government bodies, political or religious
            groups, or large corporations. This keeps our work unbiased and focused on solutions, not agendas.
          </p>
        </div>
      </motion.section>

      {/* Our Values */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-6 py-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" style={{ color: COLORS.dark }}>
          Our <span style={{ color: COLORS.primary }}>Values</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ scale: 1.08, y: -10, boxShadow: "0 20px 40px rgba(14,167,122,0.3)" }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-100 hover:border-green-400 transition-all duration-300 text-center cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <value.icon className="text-5xl mx-auto mb-4" style={{ color: COLORS.secondary }} />
              </motion.div>
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.dark }}>
                {value.title}
              </h3>
              <p className="text-sm text-gray-600 text-justify">{value.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          variants={fadeInUp}
          className="mt-10 text-center text-lg text-gray-700 max-w-3xl mx-auto font-medium"
        >
          We have <strong className="text-green-700">no religious or political bias</strong> — we are{" "}
          <em className="text-yellow-600">pro-solution</em>, not pro-left, pro-right, or pro-centre.
        </motion.p>
      </motion.section>

      {/* What We Cover */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="bg-gradient-to-br from-yellow-50 to-green-50 py-16 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" style={{ color: COLORS.dark }}>
            What We <span style={{ color: COLORS.primary }}>Cover</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coverage.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -12, scale: 1.03, boxShadow: "0 15px 30px rgba(14,167,122,0.2)" }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex items-start gap-4 cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${COLORS.primary}15`, color: COLORS.primary }}
                >
                  <item.icon className="text-3xl" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How We Sustain */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="max-w-5xl mx-auto px-6 py-16"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-10 md:p-14 shadow-2xl border-t-4 border-green-500 hover:shadow-3xl transition-shadow duration-300"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center" style={{ color: COLORS.dark }}>
            How We <span style={{ color: COLORS.secondary }}>Sustain</span> Our Work
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed text-justify">
            We are currently <strong className="text-green-700">bootstrapped</strong>, generating revenue through online
            ads and sponsored articles — but always with your reading experience in mind. We only promote{" "}
            <em className="text-yellow-600">socially relevant ads</em>, clearly marked as{" "}
            <strong>"Sponsored"</strong> to keep editorial content separate and unbiased.
          </p>
        </motion.div>
      </motion.section>

      {/* Founders Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="bg-gradient-to-b from-white to-green-50 py-20 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center" style={{ color: COLORS.dark }}>
            Meet Our <span style={{ color: COLORS.primary }}>Founders</span>
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
            Founded by <strong>Mithilesh Kumar Singh</strong> and <strong>Shailesh Kumar Singh</strong> in late 2018.
            Today, we are a team of <strong className="text-green-700">11 members</strong>, supported by a network of
            passionate volunteers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
            {founders.map((founder, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -15, scale: 1.03 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-green-100 cursor-pointer"
              >
                <div
                  className="h-2"
                  style={{ background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                ></div>
                <div className="p-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="relative inline-block mb-6"
                  >
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-40"
                      style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                    ></div>
                    <img
                      src={founder.image}
                      alt={founder.name}
                      className="relative w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                    />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-1" style={{ color: COLORS.dark }}>
                    {founder.name}
                  </h3>
                  <p className="text-sm font-semibold mb-4" style={{ color: COLORS.primary }}>
                    {founder.role}
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-6 px-2 text-justify">{founder.bio}</p>
                  <div className="flex justify-center gap-4">
                    <motion.a
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      href={founder.social.linkedin}
                      className="p-3 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <FaLinkedin className="text-xl text-green-700" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      href={founder.social.twitter}
                      className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                      aria-label="Twitter"
                    >
                      <FaTwitter className="text-xl text-blue-600" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      href={founder.social.email}
                      className="p-3 rounded-full bg-yellow-100 hover:bg-yellow-200 transition-colors"
                      aria-label="Email"
                    >
                      <FaEnvelope className="text-xl text-yellow-600" />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Closing CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 py-16 px-6 text-center text-white"
      >
        <motion.h2
          whileHover={{ scale: 1.05 }}
          className="text-3xl md:text-5xl font-bold mb-6"
        >
          Join Our <span className="text-yellow-300">Community</span>
        </motion.h2>
        <motion.p
          whileHover={{ scale: 1.02 }}
          className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light leading-relaxed"
        >
          Working tirelessly to bring you stories worth your time — and to keep you safe and{" "}
          <strong className="text-yellow-300">Updated</strong>.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetInvolved}
          className="px-10 py-4 bg-yellow-400 text-gray-900 font-bold text-lg rounded-full shadow-lg hover:bg-yellow-300 transition-all duration-300"
        >
          Get Started
        </motion.button>
      </motion.section>
    </div>
  );
}
