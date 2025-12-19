import { useEffect, useState } from "react";
import { buildApiUrl } from "@/lib/api.ts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerItem {
  id?: string;
  imageUrl: string;
  linkUrl?: string;
  alt?: string;
}

interface BannerData {
  enabled: boolean;
  banners?: BannerItem[];
}

const ProductsBanner = () => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(
          buildApiUrl("/api/settings/banner/products")
        );
        if (response.ok) {
          const data = await response.json();
          if (
            data.success &&
            data.enabled &&
            data.banners &&
            data.banners.length > 0
          ) {
            setBannerData(data);
          } else {
            setBannerData(null);
          }
        } else {
          console.warn("Failed to fetch banner:", response.status);
          setBannerData(null);
        }
      } catch (error) {
        console.error("Failed to fetch banner:", error);
        setBannerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  // Show placeholder while loading to prevent layout shift
  // Reserve exact space that banner will occupy (200px max height)
  if (loading) {
    return (
      <div className="w-full mb-8 min-h-[200px]">
        <div className="w-full h-[200px] bg-[#1E1E1E] rounded-lg border border-[#2D2D2D] animate-pulse" />
      </div>
    );
  }

  if (
    !bannerData ||
    !bannerData.enabled ||
    !bannerData.banners ||
    bannerData.banners.length === 0
  ) {
    return null;
  }

  // Autoplay will be added if the package is installed
  // For now, carousel works without autoplay (users can manually navigate)
  const plugins: any[] = [];

  return (
    <div className="w-full mb-8 min-h-[200px]">
      <Carousel
        plugins={plugins}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {bannerData.banners.map((banner, index) => (
            <CarouselItem key={banner.id || index} className="pl-0 basis-full">
              <div className="w-full h-[200px] flex items-center justify-center overflow-hidden rounded-lg">
                {banner.linkUrl ? (
                  <a
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <img
                      src={banner.imageUrl}
                      alt={banner.alt || `Promotional banner ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </a>
                ) : (
                  <img
                    src={banner.imageUrl}
                    alt={banner.alt || `Promotional banner ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {bannerData.banners.length > 1 && (
          <>
            <CarouselPrevious className="left-2 bg-black/50 hover:bg-black/70 text-white border-none">
              <ChevronLeft className="h-4 w-4" />
            </CarouselPrevious>
            <CarouselNext className="right-2 bg-black/50 hover:bg-black/70 text-white border-none">
              <ChevronRight className="h-4 w-4" />
            </CarouselNext>
          </>
        )}
      </Carousel>
    </div>
  );
};

export default ProductsBanner;
