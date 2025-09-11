import { Skeleton } from "@/components/ui/skeleton.tsx";

interface ProductSkeletonProps {
  view?: "grid" | "list";
}

export const ProductSkeleton = ({ view = "grid" }: ProductSkeletonProps) => {
  if (view === "list") {
    return (
      <div className="flex flex-col md:flex-row bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D]">
        <div className="md:w-1/4 h-48 md:h-auto overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="md:w-3/4 p-6 flex flex-col">
          <div className="flex flex-col items-start mb-2">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex items-center mb-4">
            <Skeleton className="h-4 w-16 mr-2" />
            <Skeleton className="h-4 w-4 mx-2" />
            <Skeleton className="h-4 w-20 mr-2" />
            <Skeleton className="h-4 w-4 mx-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4 flex-grow" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] flex flex-col">
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
  );
};
