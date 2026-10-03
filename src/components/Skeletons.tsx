import React from 'react';

interface SkeletonProps {
  className?: string;
}

// Reusable basic shimmer block
export const Shimmer: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`animate-shimmer bg-gray-200 dark:bg-zinc-800/80 rounded-xl ${className}`}
    />
  );
};

// Reusable Circular shimmer block
export const ShimmerCircle: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`animate-shimmer bg-gray-200 dark:bg-zinc-800/80 rounded-full ${className}`}
    />
  );
};

// High-fidelity shimmering skeleton for the Customer Web storefront
export const CustomerWebSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-[#EFF1F5] dark:bg-[#08090B] min-h-screen pb-16 transition-colors duration-200">
      {/* 1. Nav Ribbon Placeholder */}
      <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-150 dark:border-zinc-800/60 py-4 px-4 md:px-8">
        <div className="w-full px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Shimmer className="h-8 w-28 rounded-lg" />
            <div className="hidden md:flex gap-4">
              <Shimmer className="h-5 w-20" />
              <Shimmer className="h-5 w-20" />
              <Shimmer className="h-5 w-20" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ShimmerCircle className="h-8 w-8" />
            <ShimmerCircle className="h-8 w-8" />
            <ShimmerCircle className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* 2. Hero Carousel Shimmer */}
      <div className="w-full px-4 md:px-8 mt-6">
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/60 rounded-3xl p-8 md:p-14 min-h-[380px] md:min-h-[440px] flex flex-col justify-center relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
            <div className="md:col-span-6 space-y-4">
              <Shimmer className="h-5 w-24 rounded-full" />
              <Shimmer className="h-12 w-3/4 md:w-full rounded-xl" />
              <Shimmer className="h-12 w-2/3 md:w-5/6 rounded-xl" />
              <div className="space-y-2 pt-2">
                <Shimmer className="h-4 w-16" />
                <Shimmer className="h-8 w-32 rounded-lg" />
              </div>
              <div className="flex gap-3 pt-2">
                <Shimmer className="h-11 w-32 rounded-xl" />
                <Shimmer className="h-11 w-12 rounded-xl" />
              </div>
            </div>
            <div className="md:col-span-6 flex justify-center">
              <Shimmer className="h-64 w-64 md:h-80 md:w-80 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Categories Shimmer */}
      <div className="w-full px-4 md:px-8 mt-12">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <ShimmerCircle className="h-14 w-14 md:h-16 md:w-16" />
              <Shimmer className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Mini Promotional Grid Shimmer */}
      <div className="w-full px-4 md:px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/60 p-6 rounded-2xl h-36 flex items-center justify-between">
            <div className="space-y-3 w-2/3">
              <Shimmer className="h-4 w-16 rounded-full" />
              <Shimmer className="h-6 w-32" />
              <Shimmer className="h-4 w-24" />
            </div>
            <Shimmer className="h-20 w-20 rounded-xl" />
          </div>
        ))}
      </div>

      {/* 5. Main Content Grid Shimmer */}
      <div className="w-full px-4 md:px-8 mt-12">
        <div className="flex justify-between items-center mb-6">
          <Shimmer className="h-8 w-44 rounded-lg" />
          <Shimmer className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/60 rounded-2xl p-4 space-y-4 flex flex-col">
              <Shimmer className="aspect-square w-full rounded-xl" />
              <div className="space-y-2">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-5 w-full rounded" />
                <Shimmer className="h-3.5 w-1/2" />
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/40 flex justify-between items-center mt-auto">
                <Shimmer className="h-6 w-20" />
                <ShimmerCircle className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// High-fidelity shimmering skeleton for the Merchant Portal dashboard
export const MerchantPortalSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-[#EFF1F5] dark:bg-[#08090B] min-h-screen pb-16 transition-colors duration-200">
      {/* Upper Nav */}
      <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-150 dark:border-zinc-800/60 py-4 px-6 mb-8">
        <div className="w-full px-4 md:px-8 flex items-center justify-between">
          <Shimmer className="h-8 w-36 rounded-lg" />
          <div className="flex gap-3">
            <Shimmer className="h-8 w-24 rounded-lg" />
            <ShimmerCircle className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 space-y-8">
        {/* Banner/Intro */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/60 rounded-3xl p-6 flex justify-between items-center">
          <div className="space-y-3 w-1/2">
            <Shimmer className="h-8 w-48 rounded" />
            <Shimmer className="h-4 w-72" />
          </div>
          <Shimmer className="h-12 w-32 rounded-xl" />
        </div>

        {/* 4 Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/60 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <Shimmer className="h-4 w-20" />
                <ShimmerCircle className="h-8 w-8" />
              </div>
              <Shimmer className="h-8 w-24" />
              <Shimmer className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Two Columns split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/60 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between">
              <Shimmer className="h-6 w-32" />
              <Shimmer className="h-6 w-16" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center p-3 border-b border-gray-100 dark:border-zinc-850">
                  <Shimmer className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-grow">
                    <Shimmer className="h-4 w-1/3" />
                    <Shimmer className="h-3 w-1/4" />
                  </div>
                  <Shimmer className="h-6 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/60 p-6 rounded-3xl space-y-6">
            <Shimmer className="h-6 w-24" />
            <div className="space-y-3">
              <Shimmer className="h-10 w-full rounded-xl" />
              <Shimmer className="h-10 w-full rounded-xl" />
              <Shimmer className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// High-fidelity shimmering skeleton for the Admin Dashboard
export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-[#EFF1F5] dark:bg-[#08090B] min-h-screen pb-16 transition-colors duration-200">
      {/* Top Header */}
      <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-150 dark:border-zinc-800/60 py-4 px-6 mb-8">
        <div className="w-full px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shimmer className="h-8 w-8 rounded-lg" />
            <Shimmer className="h-6 w-32" />
          </div>
          <Shimmer className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      <div className="w-full px-4 md:px-8 space-y-8">
        {/* Title & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Shimmer className="h-8 w-44" />
            <Shimmer className="h-4 w-64" />
          </div>
          <div className="flex gap-2 bg-white dark:bg-zinc-900 p-1 border border-gray-150 dark:border-zinc-800/60 rounded-xl">
            <Shimmer className="h-8 w-16" />
            <Shimmer className="h-8 w-16" />
            <Shimmer className="h-8 w-16" />
          </div>
        </div>

        {/* Analytic Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/60 p-5 rounded-2xl space-y-3">
              <Shimmer className="h-4 w-20" />
              <Shimmer className="h-8 w-24" />
              <Shimmer className="h-3.5 w-16" />
            </div>
          ))}
        </div>

        {/* Large Charts/Listings Container */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/60 p-6 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <Shimmer className="h-6 w-40" />
            <Shimmer className="h-8 w-24 rounded-xl" />
          </div>
          <div className="h-64 w-full bg-gray-50 dark:bg-zinc-850/60 rounded-2xl flex items-end justify-between p-6 overflow-hidden relative">
            {/* Shimmering chart bar placeholders */}
            {Array.from({ length: 12 }).map((_, i) => {
              const heights = ['h-32', 'h-24', 'h-44', 'h-16', 'h-28', 'h-36', 'h-40', 'h-20', 'h-48', 'h-12', 'h-30', 'h-42'];
              return (
                <div key={i} className="w-1/15 flex flex-col items-center gap-2">
                  <Shimmer className={`w-full ${heights[i % heights.length]} rounded-t-lg`} />
                  <Shimmer className="h-3 w-full" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
