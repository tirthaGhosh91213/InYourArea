import React from 'react';

const StateNewsLoader = () => {
  return (
    <div className="w-full max-w-6xl animate-pulse">
      {/* --- MOBILE LAYOUT (Hidden on LG) --- */}
      <div className="flex flex-col gap-6 lg:hidden">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="w-full bg-gray-200 rounded-3xl"
            style={{ height: "350px" }}
          ></div>
        ))}
      </div>

      {/* --- DESKTOP LAYOUT (Hidden on Mobile) --- */}
      <div className="hidden lg:grid grid-cols-[2fr_1fr] gap-6 items-start">
        
        {/* Left Column (Big Cards) */}
        <div className="flex flex-col gap-6">
          {/* Top 2 Big Cards */}
          <div className="w-full bg-gray-200 rounded-3xl" style={{ height: "520px" }}></div>
          <div className="w-full bg-gray-200 rounded-3xl" style={{ height: "520px" }}></div>
          {/* Ad Placeholder */}
          <div className="w-full bg-gray-100 rounded-3xl border border-gray-200" style={{ height: "520px" }}></div>
        </div>

        {/* Right Column (Small Cards ONLY) */}
        <div className="flex flex-col gap-6 sticky top-24">
          {/* Card 1 */}
          <div className="w-full bg-gray-200 rounded-2xl" style={{ height: "220px" }}></div>
          
          {/* Card 2 */}
          <div className="w-full bg-gray-200 rounded-2xl" style={{ height: "220px" }}></div>
          
          {/* REMOVED EXTRA PLACEHOLDERS HERE */}
        </div>

      </div>
    </div>
  );
};

export default StateNewsLoader;