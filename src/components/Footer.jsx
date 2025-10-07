import React from "react";

const Footer = () => {
  const popularAreas = [
    ["Aberdeen", "Bath", "Birmingham", "Bradford"],
    ["Brighton", "Bristol", "Cambridge", "Cardiff"],
    ["Chichester", "Coventry", "Derby", "Edinburgh"],
    ["Glasgow", "Gloucester", "Leeds", "Leicester"],
    ["Liverpool", "London", "Manchester", "Newcastle"],
    ["Norwich", "Nottingham", "Oxford", "Plymouth"],
    ["Portsmouth", "Salford", "Salisbury", "Sheffield"],
    ["Southampton", "Stoke-on-Trent", "Sunderland", "Swansea"],
    ["Wakefield", "Wolverhampton", "York", "View all areas"],
  ];

  const countriesCovered = ["England", "Scotland", "Wales", "Northern Ireland"];

  const footerLinks = [
    "Community Standards",
    "Terms & Conditions",
    "Privacy Statement",
    "AI Notice",
    "Cookie Policy",
    "Property powered by Zoopla",
    "Business data © Central Index and third parties.",
    "Icons",
  ];

  return (
    <footer className="bg-gray-50 text-gray-800 pt-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <h1 className="text-green-500 text-lg font-bold mb-4">InYourArea</h1>
            <ul className="space-y-2 text-sm">
              <li>Get the app</li>
              <li>Advertise with us</li>
              <li>Frequently asked questions</li>
              <li>Meet the team</li>
              <li>InYourArea for publishers</li>
              <li>How to Complain</li>
              <li>Contact Us</li>
              <li>Privacy Settings</li>
            </ul>
          </div>

          {popularAreas.map((column, idx) => (
            <div key={idx} className="text-sm space-y-2">
              {column.map((area, index) => (
                <div
                  key={index}
                  className={area === "View all areas" ? "font-bold cursor-pointer" : ""}
                >
                  {area}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Countries Covered */}
        <div className="mt-10">
          <h2 className="font-bold mb-4">Countries Covered</h2>
          <div className="flex flex-wrap gap-8 text-sm">
            {countriesCovered.map((country) => (
              <div key={country}>{country}</div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between text-xs text-gray-500">
          <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
            {footerLinks.map((link, idx) => (
              <span key={idx}>{link}</span>
            ))}
          </div>
          <div>© 2025 Copyright</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
