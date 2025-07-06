import { Skeleton } from "@/components/ui/skeleton";

export const FeaturedProductsSkeleton = () => {
  return (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] flex flex-col"
          >
            <div className="h-48 sm:h-56 md:h-64 overflow-hidden relative">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="p-3 sm:p-4 flex flex-col flex-grow">
              <div className="flex-grow">
                <div className="flex flex-col items-start mb-2">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center mb-3 sm:mb-4">
                  <Skeleton className="h-3 w-3 mr-1" />
                  <Skeleton className="h-3 w-8 mr-2" />
                  <Skeleton className="h-3 w-3 mx-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="w-full h-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
