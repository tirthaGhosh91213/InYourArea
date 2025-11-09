import React, { useState, useRef } from "react";
import logo from "../assets/logo.png";
import {
  FaInstagram, FaFacebookF, FaTwitter, FaYoutube, FaLinkedin, FaGlobe, FaStar
} from "react-icons/fa";

const jharkhandAreas = [
  "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka",
  "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla",
  "Hazaribagh", "Jamtara", "Jamshedpur", "Khunti", "Koderma",
  "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh",
  "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum",
];

const biharAreas = [
  "Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar",
  "Darbhanga","East Champaran (Motihari)","Gaya","Gopalganj","Jamui","Jehanabad",
  "Kaimur (Bhabua)","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura",
  "Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas",
  "Saharsa","Samastipur","Saran (Chhapra)","Sheikhpura","Sheohar","Sitamarhi",
  "Siwan","Supaul","Vaishali","West Champaran (Bettiah)",
];

const adminLinks = {
  instagram: "https://instagram.com/admin_username",
  facebook: "https://facebook.com/admin_username",
  twitter: "https://twitter.com/admin_username",
  youtube: "https://youtube.com/channel/admin_id"
};

const companyLinks = {
  linkedin: "https://www.linkedin.com/company/ulmind/",
  twitter: "https://twitter.com/meraki_company",
  instagram: "https://www.instagram.com/ulmind__official",
  website: "https://www.ulmind.com"
};

const quickLinks = [
  { label: "Advertise with us", anchor: "advertise" },
  { label: "FAQ", anchor: "faq" },
  { label: "Contact Us", anchor: "contact" },
  { label: "Community Terms", anchor: "community" },
  { label: "Privacy Policy", anchor: "privacy" },
  { label: "Cookie Policy", anchor: "cookie" },
  { label: "How to Complain", anchor: "complain" }
];

export default function Footer() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", message: "" });
  const merakiRef = useRef(null);

  // Scroll to top and highlight "Powered by Meraki"
  const handleQuickLinkClick = e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      if (merakiRef.current) {
        merakiRef.current.classList.add("highlight-meraki");
        setTimeout(() => merakiRef.current.classList.remove("highlight-meraki"), 1200);
      }
    }, 350);
  };

  const handleMerakiClick = e => {
    e.preventDefault();
    window.open(companyLinks.website, "_blank", "noopener");
  };

  const handleConnectChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleConnectSubmit = e => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 1300);
    setForm({ email: "", name: "", message: "" });
  };

  return (
    <footer className="relative bg-gray-50 text-gray-800 pt-4 pb-2 overflow-hidden w-full">
      {/* Powered by Meraki top right */}
      <div className="w-full max-w-7xl mx-auto flex justify-end px-4">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-green-700 mb-2 drop-shadow">
            Powered by <span
              ref={merakiRef}
              className="underline cursor-pointer transition hover:text-green-900"
              onClick={handleMerakiClick}
              tabIndex={0}
            >Meraki Private Limited</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 py-5">
        {/* Logo & Quick Links */}
        <div className="flex flex-col items-start gap-1">
          <img src={logo} alt="Local News Logo" className="h-16 mb-1 drop-shadow" draggable={false} />
          <span className="text-green-600 text-base font-bold tracking-tight">Jharkhand & Bihar Local News</span>
          <ul className="space-y-[2px] mt-3 text-sm w-fit">
            {quickLinks.map((link, i) => (
              <li key={link.label}>
                <a
                  href={`#${link.anchor}`}
                  onClick={handleQuickLinkClick}
                  className="transition px-1 py-[2px] rounded underline-offset-2 hover:font-bold hover:underline focus:font-bold focus:underline"
                >{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* JH Districts */}
        <div>
          <h2 className="font-semibold text-green-700 mb-2 text-base text-center lg:text-left animate-fade-in">
            Jharkhand Districts
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-center lg:text-left">
            {jharkhandAreas.map(area => <span key={area}>{area}</span>)}
          </div>
        </div>

        {/* Bihar Districts */}
        <div>
          <h2 className="font-semibold text-green-700 mb-2 text-base text-center lg:text-left animate-fade-in">
            Bihar Districts
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-center lg:text-left">
            {biharAreas.map(area => <span key={area}>{area}</span>)}
          </div>
        </div>

        {/* Admin/Company Socials, Rate Us, Contact */}
        <div className="flex flex-col justify-start items-center lg:items-end gap-4 h-full w-full">
          {/* Admin Socials */}
          <div className="w-full">
            <h2 className="font-semibold text-green-700 mb-2 text-base text-center lg:text-right animate-fade-in">
              Admin Media Links
            </h2>
            <div className="flex justify-center lg:justify-end gap-3 mb-2 animate-pop-in">
              <a href={adminLinks.instagram} aria-label="Instagram" target="_blank" rel="noopener" className="hover:scale-110 transition"><FaInstagram size={20} /></a>
              <a href={adminLinks.facebook} aria-label="Facebook" target="_blank" rel="noopener" className="hover:scale-110 transition"><FaFacebookF size={20} /></a>
              <a href={adminLinks.twitter} aria-label="Twitter" target="_blank" rel="noopener" className="hover:scale-110 transition"><FaTwitter size={20} /></a>
              <a href={adminLinks.youtube} aria-label="YouTube" target="_blank" rel="noopener" className="hover:scale-110 transition"><FaYoutube size={20} /></a>
            </div>
          </div>
          {/* Company Socials */}
          <div className="w-full">
            <h2 className="font-semibold text-green-700 mb-2 text-base text-center lg:text-right animate-fade-in">
              Meraki Private Limited Media Links
            </h2>
            <div className="flex justify-center lg:justify-end gap-3 mb-2 animate-pop-in">
              <a href={companyLinks.linkedin} target="_blank" rel="noopener" title="LinkedIn" className="hover:scale-110 transition"><FaLinkedin size={20} /></a>
              <a href={companyLinks.website} target="_blank" rel="noopener" title="Website" className="hover:scale-110 transition"><FaGlobe size={20} /></a>
              <a href={companyLinks.twitter} target="_blank" rel="noopener" title="Twitter" className="hover:scale-110 transition"><FaTwitter size={20} /></a>
              <a href={companyLinks.instagram} target="_blank" rel="noopener" title="Instagram" className="hover:scale-110 transition"><FaInstagram size={20} /></a>
            </div>
          </div>
          {/* Rate Us */}
          <div className="w-full flex flex-col items-center lg:items-end p-2 rounded-lg bg-white/70 shadow-sm animate-fade-in">
            <span className="font-semibold text-gray-700 mb-1">Rate Us</span>
            <div className="flex gap-1 mb-1">
              {[1,2,3,4,5].map(star => (
                <FaStar
                  key={star}
                  size={20}
                  className="cursor-pointer hover:scale-110 transition"
                  color={(hover || rating) >= star ? "#34d399" : "#cccccc"}
                  onMouseEnter={()=>setHover(star)}
                  onMouseLeave={()=>setHover(null)}
                  onClick={()=>setRating(star)}
                  title={`${star} Star${star>1?"s":""}`}
                />
              ))}
            </div>
            <span className="text-green-600 text-xs">
              {rating > 0 ? `Thanks for rating us ${rating} star${rating > 1 ? "s" : ""}!` : "Click to rate"}
            </span>
          </div>
          {/* Contact Form */}
          <form onSubmit={handleConnectSubmit} className="w-full max-w-xs mt-1 p-2 bg-white/70 rounded-lg shadow-md animate-pop-in">
            <span className="text-gray-800 font-semibold mb-2 block text-center">Contact Us</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleConnectChange}
              required
              placeholder="Email"
              className="w-full mb-2 px-3 py-2 rounded border border-gray-300 focus:border-green-400 outline-none text-sm transition"
            />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleConnectChange}
              required
              placeholder="Name"
              className="w-full mb-2 px-3 py-2 rounded border border-gray-300 focus:border-green-400 outline-none text-sm transition"
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleConnectChange}
              required
              placeholder="Message"
              rows={2}
              className="w-full mb-2 px-3 py-2 rounded border border-gray-300 focus:border-green-400 outline-none text-sm resize-none transition"
            />
            <button
              type="submit"
              disabled={sent}
              className={`w-full py-2 rounded bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white font-semibold transition transform hover:brightness-110 ${sent?"opacity-70":"hover:scale-105"}`}>
              {sent ? "Sent!" : "Send"}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 border-t border-gray-200 pt-5 flex flex-col gap-2 md:flex-row justify-between items-center text-xs text-gray-500 px-3">
        <div>
          Jharkhand & Bihar Local News &copy; 2025. All rights reserved.
        </div>
        <div className="mt-2 md:mt-0 text-xs">
          Powered by <span
            className="font-semibold underline text-green-700 cursor-pointer"
            ref={merakiRef}
            onClick={handleMerakiClick}
            tabIndex={0}
          >
            Meraki Private Limited
          </span>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease; }
        .animate-pop-in { animation: popIn .6s cubic-bezier(.67,-0.02,.52,1.42);}
        @keyframes fadeIn { from{opacity:0}to{opacity:1}}
        @keyframes popIn { 0%{transform:scale(.7);opacity:0}80%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
        .highlight-meraki {
          background: #e5fff8;
          color: #0ea77a !important;
          font-weight: bold;
          box-shadow: 0 1px 6px rgba(14,167,122,0.11);
          transition: all .3s;
          border-radius: 5px;
          padding: 1px 6px;
        }
        @media (max-width: 900px) {
          .max-w-7xl { max-width: 98vw !important; }
        }
        @media (max-width: 600px) {
          .grid-cols-1,
          .md\\:grid-cols-2,
          .lg\\:grid-cols-4 {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .px-4 { padding-left: 12px !important; padding-right: 12px !important;}
          .py-4, .py-5{padding:8px !important;}
          .logo img { height: 48px !important; }
        }
      `}</style>
    </footer>
  );
}
