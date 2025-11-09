import React, { useEffect, useState, useRef } from "react";
import { X as CloseIcon } from "lucide-react";

// Utility: returns a random int between min and max seconds (in ms)
function getRandomInterval(minSec = 6, maxSec = 15) {
  return Math.floor(Math.random() * (maxSec * 1000 - minSec * 1000 + 1)) + minSec * 1000;
}

/**
 * SmallAddRotate: Rotates through all small ads, showing one at a time popup.
 */
export default function SmallAdd() {
  const [ads, setAds] = useState([]);
  const [curIdx, setCurIdx] = useState(0);
  const [open, setOpen] = useState(true);
  const timerRef = useRef(null);

  // Fetch all active small ads on mount
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/banner-ads/active/small")
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          setAds(data.data);
          setOpen(true);
        }
      });
    return () => clearTimeout(timerRef.current);
  }, []);

  // When a new ad is shown, set a timer to show the next one randomly
  useEffect(() => {
    if (!open || ads.length === 0) return;
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (curIdx < ads.length - 1) {
        setCurIdx(curIdx + 1);
      } else {
        setOpen(false); // all done, close popups
      }
    }, getRandomInterval(6, 15));
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line
  }, [curIdx, open, ads]);

  if (!open || ads.length === 0) return null;

  const ad = ads[curIdx];
  // Defensive: if image/title missing, skip rendering
  if (!ad || !ad.bannerUrl || !ad.title) return null;

  const handleGo = () => {
    if (ad.destinationUrl) {
      window.open(ad.destinationUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-xl shadow-lg p-3 w-80 max-w-[90vw] border border-blue-200 flex flex-col items-center">
        <button
          aria-label="Close Ad"
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full"
          onClick={() => setOpen(false)}
        >
          <CloseIcon size={22} />
        </button>
        <div
          onClick={handleGo}
          className="cursor-pointer flex flex-col items-center w-full select-none"
          tabIndex={0}
          role="button"
          title={ad.title}
        >
          <img
            src={ad.bannerUrl}
            alt={ad.title}
            className="rounded-lg mb-2 w-40 h-24 object-cover border border-gray-200 shadow-sm"
          />
          <div className="text-base font-bold text-blue-700 text-center truncate w-full px-2">
            {ad.title}
          </div>
        </div>
      </div>
    </div>
  );
}
