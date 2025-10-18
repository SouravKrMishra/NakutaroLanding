import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import axios from "axios";
import { buildApiUrl } from "./api.js";
import { useAuth } from "./AuthContext.tsx";

export interface WishlistItem {
  id: string | number;
  name: string;
  price: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  series?: string;
  quantity?: number;
  priority?: "High" | "Medium" | "Low";
  addedDate?: string;
  inStock?: boolean;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string | number) => Promise<void>;
  isInWishlist: (id: string | number) => boolean;
  wishlistCount: number;
  loading: boolean;
  error: string | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({
  children,
}) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await axios.get(buildApiUrl("/api/wishlist"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure response.data is always an array
      const wishlistData = Array.isArray(response.data) ? response.data : [];
      setWishlistItems(wishlistData);
    } catch (err: any) {
      console.error("Failed to load wishlist:", err);
      setError("Failed to load wishlist");
      // Set empty array on error to maintain UX
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load wishlist when user authentication changes
  useEffect(() => {
    // Wait for auth to finish loading before fetching wishlist
    if (!authLoading) {
      fetchWishlist();
    }
  }, [authLoading, fetchWishlist]); // Include authLoading to wait for auth to complete

  const addToWishlist = async (item: WishlistItem): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error("Authentication required");
    }

    const isCurrentlyInWishlist = isInWishlist(item.id);

    // Optimistically update local state
    if (isCurrentlyInWishlist) {
      // Remove from wishlist
      setWishlistItems((prev) =>
        prev.filter((wishItem) => wishItem.id !== item.id)
      );
    } else {
      // Add to wishlist
      const newItem: WishlistItem = {
        ...item,
        priority: "Medium",
        addedDate: new Date().toISOString().split("T")[0],
        inStock: true,
        quantity: 1,
        series: item.category || "General",
      };
      setWishlistItems((prev) => [...prev, newItem]);
    }

    try {
      const token = getAuthToken();
      const payload = {
        productId: String(item.id), // Keep as string
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        rating: item.rating,
        reviews: item.reviews,
        series: item.category || "General",
        quantity: 1,
        priority: "Medium",
        inStock: true,
      };

      await axios.post(buildApiUrl("/api/wishlist"), payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Optimistic update already handled above, no need to update again
    } catch (err: any) {
      // Revert optimistic update on error
      if (isCurrentlyInWishlist) {
        // Re-add the item
        const newItem: WishlistItem = {
          ...item,
          priority: "Medium",
          addedDate: new Date().toISOString().split("T")[0],
          inStock: true,
          quantity: 1,
          series: item.category || "General",
        };
        setWishlistItems((prev) => [...prev, newItem]);
      } else {
        // Remove the item
        setWishlistItems((prev) =>
          prev.filter((wishItem) => wishItem.id !== item.id)
        );
      }
      throw new Error(
        err.response?.data?.message || "Failed to toggle wishlist"
      );
    }
  };

  const removeFromWishlist = async (id: string | number): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error("Authentication required");
    }

    // Optimistically remove from local state
    const originalItems = [...wishlistItems];
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const token = getAuthToken();

      await axios.delete(buildApiUrl(`/api/wishlist/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err: any) {
      // Revert optimistic update on error
      setWishlistItems(originalItems);
      throw new Error(
        err.response?.data?.message || "Failed to remove from wishlist"
      );
    }
  };

  const isInWishlist = useCallback(
    (id: string | number) => {
      // Compare IDs as strings for consistency
      const idStr = String(id);
      return wishlistItems.some((item) => String(item.id) === idStr);
    },
    [wishlistItems]
  );

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount,
        loading,
        error,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
