import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { buildApiUrl } from "./api.js";
import { useAuth } from "./AuthContext.tsx";

export interface WishlistItem {
  id: number;
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
  removeFromWishlist: (id: number) => Promise<void>;
  isInWishlist: (id: number) => boolean;
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
  const { user, isAuthenticated } = useAuth();

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  // Fetch wishlist from API
  const fetchWishlist = async () => {
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
      setWishlistItems(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError("Failed to load wishlist");
      // Set empty array on error to maintain UX
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist when user authentication changes
  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated, user?.id]); // Only depend on user.id to avoid unnecessary re-renders

  const addToWishlist = async (item: WishlistItem): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error("Authentication required");
    }

    // Optimistically add to local state
    const newItem: WishlistItem = {
      ...item,
      priority: "Medium",
      addedDate: new Date().toISOString().split("T")[0],
      inStock: true,
      quantity: 1,
      series: item.category || "General",
    };

    setWishlistItems((prev) => {
      if (prev.some((existingItem) => existingItem.id === item.id)) {
        return prev;
      }
      return [...prev, newItem];
    });

    try {
      const token = getAuthToken();
      const payload = {
        productId: item.id,
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

      const response = await axios.post(buildApiUrl("/api/wishlist"), payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err: any) {
      // Revert optimistic update on error
      setWishlistItems((prev) =>
        prev.filter((wishItem) => wishItem.id !== item.id)
      );
      throw new Error(
        err.response?.data?.message || "Failed to add to wishlist"
      );
    }
  };

  const removeFromWishlist = async (id: number): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error("Authentication required");
    }

    // Optimistically remove from local state
    const originalItems = [...wishlistItems];
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const token = getAuthToken();

      const response = await axios.delete(buildApiUrl(`/api/wishlist/${id}`), {
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

  const isInWishlist = (id: number) => {
    return wishlistItems.some((item) => item.id === id);
  };

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
