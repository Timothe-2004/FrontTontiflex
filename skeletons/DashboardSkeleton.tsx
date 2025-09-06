import React from 'react';

interface SkeletonBoxProps {
  className?: string;
}

const SkeletonBox = ({ className }: SkeletonBoxProps) => (
  <div className={`bg-gray-300 rounded animate-pulse ${className}`} />
);

const DashboardSkeleton = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 p-4 bg-white border-r">
        <SkeletonBox className="h-10 w-3/4 mb-6" />
        {[...Array(5)].map((_, i) => (
          <SkeletonBox key={i} className="h-6 w-full mb-4" />
        ))}
      </aside>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="h-16 p-6 flex items-center justify-between bg-white border-b">
        <SkeletonBox className="h-8 w-52" />
        <SkeletonBox className="h-8 w-32" />
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          <SkeletonBox className="h-6 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonBox key={i} className="h-32 w-full" />
            ))}
          </div>
<div className="grid grid-cols-3 gap-6 flex-1">
  <div className="col-span-2">
    <SkeletonBox className="h-96 w-full" />
  </div>
  <div className="col-span-1">
    <SkeletonBox className="h-96 w-full" />
  </div>
</div>

        </main>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
