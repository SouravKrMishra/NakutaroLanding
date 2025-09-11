import { Skeleton } from "@/components/ui/skeleton.tsx";

export const FilterSkeleton = () => {
  return (
    <div className="w-full bg-gradient-to-r from-[#1A1A1A] to-[#0D0D0D] rounded-xl p-6 border border-[#2D2D2D] mb-8 shadow-lg">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded" />
      </div>

      {/* Filter Content */}
      <div className="space-y-6">
        {/* Categories Section */}
        <div>
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Price and Rating Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price Range */}
          <div className="bg-[#181818] rounded-lg p-4 border border-[#2D2D2D]">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="bg-[#181818] rounded-lg p-4 border border-[#2D2D2D]">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-4 rounded mr-3" />
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-16 mr-2" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
