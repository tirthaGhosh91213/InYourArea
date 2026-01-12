import React from 'react';

const StateNewsDetailsLoader = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden animate-pulse">
      <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
        
        {/* Back Button Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="w-16 h-4 bg-gray-300 rounded"></div>
        </div>

        {/* Main Card Skeleton */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-4 md:p-6 space-y-6 border border-gray-200">
          
          {/* Media Player Skeleton */}
          <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-2xl"></div>

          {/* Author Info & Share Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar */}
              <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
              
              {/* Name & Date */}
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Location & Share Button */}
            <div className="flex items-center gap-3 justify-between sm:justify-end">
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
              <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
            </div>
          </div>

          {/* Title Skeleton */}
          <div className="space-y-2">
            <div className="w-3/4 h-8 bg-gray-300 rounded"></div>
            <div className="w-1/2 h-8 bg-gray-300 rounded"></div>
          </div>

          {/* Content Skeleton (Paragraphs) */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
          </div>

          {/* Comments Section Skeleton */}
          <div className="pt-6 border-t border-gray-200">
            <div className="w-32 h-6 bg-gray-300 rounded mb-4"></div>
            
            {/* Input Box */}
            <div className="flex gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
                <div className="flex-1 h-10 bg-gray-100 rounded-lg"></div>
            </div>

            {/* Comment List */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-9 h-9 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                            <div className="w-40 h-4 bg-gray-200 rounded"></div>
                            <div className="w-full h-3 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default StateNewsDetailsLoader;