// src/components/LargeAd.jsx
import React from "react";
import { X, ExternalLink } from "lucide-react";

export default function LargeAd({ ad, onClose }) {
  if (!ad) return null;

  const handleClick = () => {
    if (ad.destinationUrl) {
      window.open(ad.destinationUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="relative group rounded-2xl overflow-hidden cursor-pointer border border-gray-200 bg-black/5 hover:shadow-2xl transition-shadow duration-300"
      onClick={handleClick}
    >
      {/* Background image fills entire card */}
      <div className="relative w-full h-64 sm:h-72 md:h-80">
        <img
          src={ad.bannerUrl}
          alt={ad.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

        {/* Top bar: Sponsored + Close */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/15 text-white border border-white/30 backdrop-blur">
            Sponsored
          </span>

          {onClose && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border border-white/20 text-gray-100 hover:bg-black/70 hover:text-white transition backdrop-blur"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bottom content overlay */}
        <div className="absolute inset-x-3 bottom-3 z-20">
          <div className="rounded-2xl bg-black/55 backdrop-blur px-4 py-3 border border-white/15">
            <h2 className="text-base sm:text-lg font-semibold text-white line-clamp-2">
              {ad.title}
            </h2>

            {ad.description && (
              <p className="mt-1 text-xs sm:text-sm text-gray-100/80 line-clamp-2">
                {ad.description}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wide text-gray-300">
                Advertisement
              </span>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500 text-white text-xs sm:text-sm font-medium shadow-md hover:bg-blue-600 transition"
              >
                <span>Learn more</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
