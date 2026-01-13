import React from "react";

export default function CommunitySkeleton() {
  // We render 3 skeleton cards to simulate a full feed
  const skeletonCards = [1, 2, 3];

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. SEARCH BAR SKELETON 
         Matches the dimensions of the Green Search Header 
         (max-w-5xl md:max-w-7xl)
      */}
      {/* Note: In your main file, the Search Bar is rendered outside the loading check. 
          If you want the search bar to ALSO be a skeleton during load, you can move 
          the real search bar inside the !loading check. 
          For now, I am assuming this Skeleton replaces ONLY the feed content area.
      */}

      {/* DESKTOP LAYOUT: Grid to match the 2/3 Feed + 1/3 Ads layout */}
      <div className="w-full max-w-7xl md:grid md:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: FEED POSTS --- */}
        <div className="md:col-span-2 flex flex-col gap-4 w-full">
          {skeletonCards.map((i) => (
            <div
              key={i}
              className="w-full rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="flex flex-col w-full">
                {/* Header: Avatar + Name + Date */}
                <div className="flex items-center justify-between px-4 pt-4">
                  <div className="flex items-center gap-3 w-full">
                    {/* Circle Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                    
                    {/* Name and Date Lines */}
                    <div className="flex flex-col gap-2 w-full max-w-[150px]">
                      <div className="h-3 w-full bg-gray-200 rounded-full" />
                      <div className="h-2 w-1/2 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Content: Title & Text lines */}
                <div className="px-4 pt-4 space-y-3">
                  {/* Fake Title */}
                  <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
                  
                  {/* Fake Paragraph */}
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-100 rounded-full" />
                    <div className="h-3 w-full bg-gray-100 rounded-full" />
                    <div className="h-3 w-2/3 bg-gray-100 rounded-full" />
                  </div>
                </div>

                {/* Image Placeholder (Only on 1st and 3rd skeleton to vary look) */}
                {i % 2 !== 0 && (
                  <div className="mt-4 w-full h-64 bg-gray-200" />
                )}

                {/* Footer: Comment Button */}
                <div className="flex items-center justify-end px-4 py-3 mt-2">
                  <div className="h-4 w-20 bg-emerald-50/50 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- RIGHT COLUMN: ADS (Desktop Only) --- */}
        <div className="hidden md:flex flex-col gap-6 w-full">
          {/* Matches sticky top-28 */}
          <div className="sticky top-28 w-full flex flex-col gap-6">
            
            {/* Ad Skeleton 1 */}
            <div className="w-full h-[240px] rounded-2xl bg-white shadow-md border border-gray-100 animate-pulse p-4 flex flex-col justify-center items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
              <div className="w-3/4 h-4 bg-gray-200 rounded-full mb-2" />
              <div className="w-1/2 h-3 bg-gray-100 rounded-full" />
            </div>

            {/* Ad Skeleton 2 */}
            <div className="w-full h-[240px] rounded-2xl bg-white shadow-md border border-gray-100 animate-pulse p-4 relative">
               <div className="absolute inset-0 bg-gray-200/50" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}