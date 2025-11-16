// src/components/SmallAdd.jsx
import React, { useState } from "react";
import { X as CloseIcon } from "lucide-react";

export default function SmallAdd({
  position = "bottom-right",
  ad,
  open = true,
  onClose,
}) {
  const [localOpen, setLocalOpen] = useState(open);

  if (!localOpen || !ad || !ad.bannerUrl || !ad.title) return null;

  const handleGo = () => {
    if (ad.destinationUrl) {
      window.open(ad.destinationUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleClose = () => {
    setLocalOpen(false);
    if (onClose) onClose();
  };

  // Only change: top offset for "top-right" so it appears just under the navbar
  const containerStyle =
    position === "top-right"
      ? { position: "fixed", top: "70px", right: "12px", zIndex: 50 } // under navbar
      : { position: "fixed", bottom: "22px", right: "12px", zIndex: 50 };

  return (
    <div style={containerStyle} className="max-w-[95vw] pointer-events-auto">
      <div className="relative bg-white rounded-lg shadow-xl border border-blue-200 flex flex-col overflow-hidden p-0 w-[170px] sm:w-[160px] max-w-full transition-all">
        <button
          aria-label="Close Ad"
          className="absolute top-1 right-1 text-white/90 hover:text-red-400 bg-black/30 transition-colors p-1 rounded-full z-10"
          onClick={handleClose}
        >
          <CloseIcon size={15} />
        </button>
        <div
          onClick={handleGo}
          className="cursor-pointer w-full flex flex-col relative select-none"
          tabIndex={0}
          role="button"
          title={ad.title}
        >
          <img
            src={ad.bannerUrl}
            alt={ad.title}
            className="w-full h-[80px] xs:h-[95px] sm:h-[95px] object-cover"
            draggable={false}
            style={{ userSelect: "none" }}
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 w-full py-1 px-2 flex items-end bg-gradient-to-t from-black/85 via-black/55 to-transparent">
            <span className="w-full text-xs font-bold opacity-55 text-white truncate drop-shadow">
             Advertisement
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
