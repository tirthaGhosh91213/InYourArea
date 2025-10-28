import React, { useState } from "react";
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
  linkedin: "https://linkedin.com/company/meraki-private-limited",
  twitter: "https://twitter.com/meraki_company",
  instagram: "https://instagram.com/meraki_company",
  website: "https://merakiprivate.com"
};

const quickLinks = [
  "Advertise with us",
  "FAQ",
  "Contact Us",
  "Community Terms",
  "Privacy Policy",
  "Cookie Policy",
  "How to Complain"
];

export default function Footer() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", message: "" });

  const handleConnectChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleConnectSubmit = e => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 1300);
    setForm({ email: "", name: "", message: "" });
  };

  return (
    <footer className="relative bg-gray-50 text-gray-800 pt-4 overflow-hidden">
      {/* Powered by Meraki top right */}
      <div className="w-full max-w-7xl mx-auto flex justify-end px-4">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-green-700 mb-2 drop-shadow">
            Powered by Meraki Private Limited
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-4">
        {/* Logo & Company Links */}
        <div className="flex flex-col items-start gap-2">
          <img src={logo} alt="Local News Logo" className="h-20 mb-1 drop-shadow" draggable={false} />
          <span className="text-green-600 text-base font-bold">Jharkhand & Bihar Local News</span>
          {/* <div className="mt-2 flex items-center gap-2">
            <a href={companyLinks.linkedin} target="_blank" rel="noopener" title="LinkedIn" className="hover:scale-110 transition"><FaLinkedin size={18} /></a>
            <a href={companyLinks.website} target="_blank" rel="noopener" title="Website" className="hover:scale-110 transition"><FaGlobe size={18} /></a>
            <a href={companyLinks.twitter} target="_blank" rel="noopener" title="Twitter" className="hover:scale-110 transition"><FaTwitter size={18} /></a>
            <a href={companyLinks.instagram} target="_blank" rel="noopener" title="Instagram" className="hover:scale-110 transition"><FaInstagram size={18} /></a>
          </div> */}
          <ul className="space-y-1 mt-3 text-sm">
            {quickLinks.map((link, i) => (
              <li key={i}>{link}</li>
            ))}
          </ul>
        </div>

        {/* JH Districts */}
        <div>
          <h2 className="font-semibold text-green-700 mb-2 text-base text-center lg:text-left animate-fade-in">Jharkhand Districts</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-center lg:text-left">
            {jharkhandAreas.map(area => <span key={area}>{area}</span>)}
          </div>
        </div>

        {/* Bihar Districts */}
        <div>
          <h2 className="font-semibold text-green-700 mb-2 text-base text-center lg:text-left animate-fade-in">Bihar Districts</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-center lg:text-left">
            {biharAreas.map(area => <span key={area}>{area}</span>)}
          </div>
        </div>

        {/* Admin & Company Socials, Rate Us, Connect Us */}
        <div className="flex flex-col justify-start items-center lg:items-end gap-4 h-full">
          {/* Admin Socials */}
          <div className="w-full">
            <h2 className="font-semibold text-green-700 mb-2 text-base text-center lg:text-right animate-fade-in">
              Admin Media Links
            </h2>
            <div className="flex justify-center lg:justify-end gap-4 mb-2 animate-pop-in">
              <a href={adminLinks.instagram} aria-label="Instagram" target="_blank" rel="noopener" className="hover:scale-110 transition"><FaInstagram size={21} /></a>
              <a href={adminLinks.facebook} aria-label="Facebook" target="_blank" rel="noopener" className="hover:scale-110 transition"><FaFacebookF size={21} /></a>
              <a href={adminLinks.twitter} aria-label="Twitter" target="_blank" rel="noopener" className="hover:scale-110 transition"><FaTwitter size={21} /></a>
              <a href={adminLinks.youtube} aria-label="YouTube" target="_blank" rel="noopener" className="hover:scale-110 transition"><FaYoutube size={21} /></a>
            </div>
          </div>
          {/* Company Socials */}
          <div className="w-full">
            <h2 className="font-semibold text-green-700 mb-2 text-base text-center lg:text-right animate-fade-in">
              Meraki Private Limited Media Links
            </h2>
            <div className="flex justify-center lg:justify-end gap-4 mb-2 animate-pop-in">
              <a href={companyLinks.linkedin} target="_blank" rel="noopener" title="LinkedIn" className="hover:scale-110 transition"><FaLinkedin size={20} /></a>
              <a href={companyLinks.website} target="_blank" rel="noopener" title="Website" className="hover:scale-110 transition"><FaGlobe size={20} /></a>
              <a href={companyLinks.twitter} target="_blank" rel="noopener" title="Twitter" className="hover:scale-110 transition"><FaTwitter size={20} /></a>
              <a href={companyLinks.instagram} target="_blank" rel="noopener" title="Instagram" className="hover:scale-110 transition"><FaInstagram size={20} /></a>
            </div>
          </div>
          {/* Rate Us */}
          <div className="w-full flex flex-col items-center lg:items-end p-3 rounded-lg bg-white/70 shadow-sm animate-fade-in">
            <span className="font-semibold text-gray-700 mb-1">Rate Us</span>
            <div className="flex gap-1 mb-1">
              {[1,2,3,4,5].map(star => (
                <FaStar
                  key={star}
                  size={22}
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
          {/* Connect Us */}
          <form onSubmit={handleConnectSubmit} className="w-full max-w-xs mt-1 p-3 bg-white/70 rounded-lg shadow-md animate-pop-in">
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

      {/* Bottom section */}
      <div className="mt-8 border-t border-gray-200 pt-5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 px-4">
        <div>
          Jharkhand & Bihar Local News &copy; 2025. All rights reserved.
        </div>
        <div className="mt-2 md:mt-0">
          Powered by <span className="font-semibold text-green-700">Meraki Private Limited</span>
        </div>
      </div>
      {/* Animations (simple fade-in and pop-in) */}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease; }
        .animate-pop-in { animation: popIn .6s cubic-bezier(.67,-0.02,.52,1.42);}
        @keyframes fadeIn { from{opacity:0}to{opacity:1}}
        @keyframes popIn { 0%{transform:scale(.7);opacity:0}80%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
      `}</style>
    </footer>
  );
}
