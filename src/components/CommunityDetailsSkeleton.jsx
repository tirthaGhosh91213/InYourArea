import React from "react";

export default function CommunityDetailsSkeleton() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
        
        {/* 1. Back Button Skeleton */}
        <div className="flex items-center gap-2 mb-4 w-24 h-6 bg-gray-200 rounded animate-pulse" />

        {/* 2. Main Card Skeleton */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-4 md:p-6 space-y-6 border border-gray-100 animate-pulse">
          
          {/* --- Image Area --- */}
          {/* Matches the aspect ratio of a typical post image */}
          <div className="w-full h-64 md:h-96 bg-gray-200 rounded-2xl" />

          {/* --- Author Info & Share Row --- */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              
              {/* Left Side: Avatar + Text */}
              <div className="flex flex-row items-center gap-3 flex-1">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                
                {/* Name & Date */}
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
                </div>
              </div>

              {/* Right Side: Share Button */}
              <div className="flex items-center justify-end">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100/50 rounded-full flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* --- Title Skeleton --- */}
          <div className="space-y-2">
            <div className="h-6 w-11/12 bg-gray-200 rounded-full" />
            <div className="h-6 w-2/3 bg-gray-200 rounded-full" />
          </div>

          {/* --- Description Content Skeleton --- */}
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full bg-gray-100 rounded-full" />
            <div className="h-4 w-full bg-gray-100 rounded-full" />
            <div className="h-4 w-full bg-gray-100 rounded-full" />
            <div className="h-4 w-full bg-gray-100 rounded-full" />
            <div className="h-4 w-4/5 bg-gray-100 rounded-full" />
          </div>

          {/* --- Comments Section Skeleton --- */}
          <div className="pt-6 border-t border-gray-100">
            {/* "Comments" Title */}
            <div className="h-6 w-32 bg-gray-200 rounded-full mb-4" />

            {/* Comment Input Skeleton */}
            <div className="flex gap-3 mb-6 pb-6 border-b border-gray-100">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-3">
                <div className="w-full h-10 bg-gray-100 rounded-lg" />
                <div className="self-end w-16 h-8 bg-green-100/50 rounded-md" />
              </div>
            </div>

            {/* List of 2-3 Fake Comments */}
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                     <div className="flex items-center gap-2">
                        <div className="h-3 w-24 bg-gray-200 rounded-full" />
                        <div className="h-3 w-12 bg-gray-100 rounded-full" />
                     </div>
                     <div className="h-3 w-full bg-gray-100 rounded-full" />
                     <div className="h-3 w-2/3 bg-gray-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}