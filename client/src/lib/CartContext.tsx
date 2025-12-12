import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext.tsx";
import axios from "axios";
import { buildApiUrl } from "./api.ts";

interface CartItem {
  id: string | number; // Changed to string to support variant-based IDs
  productId?: string | number; // Original product ID for reference
  slug?: string | null;
  productSlug?: string | null;
  name: string;
  price: string;
  image: string;
  category: string;
  quantity: number;
  inStock: boolean;
  variants?: { [key: string]: string }; // Selected variants like size, color, etc.
  lastModified?: number; // Timestamp for conflict resolution
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string | number }
  | {
      type: "UPDATE_QUANTITY";
      payload: { id: string | number; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }
    }

    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
      };
    }

    case "LOAD_CART": {
      return {
        ...state,
        items: action.payload,
        total: calculateTotal(action.payload),
        itemCount: calculateItemCount(action.payload),
      };
    }

    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, ""));
    return total + price * item.quantity;
  }, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity?: number
  ) => Promise<void>;
  removeItem: (id: string | number) => Promise<void>;
  updateQuantity: (id: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (id: string | number) => boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });
  const [loginSessionId, setLoginSessionId] = React.useState<string>("");
  const [isCartLoaded, setIsCartLoaded] = React.useState(false);

  // Refs for preventing race conditions (removed polling-related refs)

  // Conflict resolution function for cart items
  const resolveCartConflicts = (
    localItems: CartItem[],
    serverItems: CartItem[]
  ): CartItem[] => {
    const resolvedItems: CartItem[] = [];
    const allItemIds = new Set([
      ...localItems.map((item) => String(item.id)),
      ...serverItems.map((item) => String(item.id)),
    ]);

    for (const itemId of allItemIds) {
      const localItem = localItems.find((item) => String(item.id) === itemId);
      const serverItem = serverItems.find((item) => String(item.id) === itemId);

      if (localItem && serverItem) {
        // Both exist - use the one with the latest modification time
        const localTime = localItem.lastModified || 0;
        const serverTime = serverItem.lastModified || 0;

        if (localTime > serverTime) {
          resolvedItems.push(localItem);
        } else {
          resolvedItems.push(serverItem);
        }
      } else if (localItem) {
        // Only exists locally - keep it
        resolvedItems.push(localItem);
      } else if (serverItem) {
        // Only exists on server - add it
        resolvedItems.push(serverItem);
      }
    }

    return resolvedItems;
  };

  // Listen for login events to refresh cart
  useEffect(() => {
    const handleUserLogin = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { userId, timestamp } = customEvent.detail;
      if (isAuthenticated && user && user.id === userId) {
        // Call refreshCart function directly
        if (isAuthenticated && user) {
          try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(buildApiUrl("/api/cart"), {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            });
            const cartItems = response.data.cart.items || [];
            const transformedItems = cartItems.map((item: any) => ({
              id: String(item.productId),
              productId: String(item.productId),
              slug: item.slug || null,
              productSlug: item.slug || null,
              name: item.name,
              price: item.price,
              image: item.image,
              category: item.category,
              quantity: item.quantity,
              inStock: item.inStock,
              variants:
                item.variants instanceof Map
                  ? Object.fromEntries(item.variants)
                  : item.variants || {},
              lastModified: item.lastModified || Date.now(),
            }));

            dispatch({ type: "LOAD_CART", payload: transformedItems });
            localStorage.setItem(
              `cart_${user.id}`,
              JSON.stringify(transformedItems)
            );
          } catch (error) {}
        }
      }
    };

    window.addEventListener("userLogin", handleUserLogin);

    return () => {
      window.removeEventListener("userLogin", handleUserLogin);
    };
  }, [isAuthenticated, user]);

  // Generate new session ID when user logs in (to force cart refresh)
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      const newSessionId = `${user.id}_${Date.now()}`;
      setLoginSessionId(newSessionId);
    } else if (!isAuthenticated) {
      setLoginSessionId("");
    }
  }, [isAuthenticated, user, authLoading]);

  // Calculate totals whenever items change
  useEffect(() => {
    const total = calculateTotal(state.items);
    const itemCount = calculateItemCount(state.items);
    // Update totals in state if they don't match
    if (state.total !== total || state.itemCount !== itemCount) {
      dispatch({ type: "LOAD_CART", payload: state.items });
    }
  }, [state.items, state.total, state.itemCount]);

  // Load cart from database on mount and when user changes
  useEffect(() => {
    const loadCartFromDatabase = async () => {
      // Reset cart loaded flag when user changes
      setIsCartLoaded(false);

      // Wait for auth to finish loading before fetching cart
      if (!authLoading) {
        if (isAuthenticated && user) {
          try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(buildApiUrl("/api/cart"), {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            });
            const cartItems = response.data.cart.items || [];
            // Transform items from backend format (productId) to frontend format (id)
            const transformedItems = cartItems.map((item: any) => ({
              id: String(item.productId), // Ensure ID is string
              productId: String(item.productId),
              slug: item.slug || null,
              productSlug: item.slug || null,
              name: item.name,
              price: item.price,
              image: item.image,
              category: item.category,
              quantity: item.quantity,
              inStock: item.inStock,
              variants: item.variants || {},
              lastModified: item.lastModified || Date.now(),
            }));

            // Always prioritize database data over localStorage
            dispatch({ type: "LOAD_CART", payload: transformedItems });

            // Update localStorage with fresh data from database
            localStorage.setItem(
              `cart_${user.id}`,
              JSON.stringify(transformedItems)
            );
            setIsCartLoaded(true);
          } catch (error) {
            // Fallback to localStorage if database fails
            const savedCart = localStorage.getItem(`cart_${user.id}`);
            if (savedCart) {
              try {
                const items = JSON.parse(savedCart);
                dispatch({ type: "LOAD_CART", payload: items });
                setIsCartLoaded(true);
              } catch (localError) {
                dispatch({ type: "CLEAR_CART" });
                setIsCartLoaded(true);
              }
            } else {
              dispatch({ type: "CLEAR_CART" });
              setIsCartLoaded(true);
            }
          }
        } else {
          // Clear cart when user logs out
          dispatch({ type: "CLEAR_CART" });
        }
      }
    };

    loadCartFromDatabase();
  }, [isAuthenticated, user?.id, authLoading]); // Only depend on user.id instead of entire user object

  // Cart polling removed - sync only happens on user actions and login

  // Sync cart to database whenever it changes (only for authenticated users)
  useEffect(() => {
    const syncCartToDatabase = async () => {
      // Don't sync until cart has been loaded from database
      if (!isCartLoaded) {
        return;
      }

      if (isAuthenticated && user && state.items.length > 0) {
        try {
          const token = localStorage.getItem("authToken");
          // Transform items to match backend schema (id -> productId)
          const transformedItems = state.items.map((item) => ({
            productId: String(item.productId || item.id), // Ensure ID is string
            slug: item.slug || item.productSlug || null,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            quantity: item.quantity,
            inStock: item.inStock,
            variants: item.variants || {},
          }));

          await axios.put(
            buildApiUrl("/api/cart"),
            { items: transformedItems },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );
          // Also save to localStorage as backup
          localStorage.setItem(`cart_${user.id}`, JSON.stringify(state.items));
        } catch (error) {
          // Fallback to localStorage only
          localStorage.setItem(`cart_${user.id}`, JSON.stringify(state.items));
        }
      } else if (isAuthenticated && user && state.items.length === 0) {
        // Don't clear cart in database on initial load - only clear when user explicitly clears
        // The clearCart function handles explicit clearing
      }
    };

    // Debounce the sync to prevent rapid API calls
    const timeoutId = setTimeout(() => {
      syncCartToDatabase();
    }, 500); // Wait 500ms after last change

    return () => clearTimeout(timeoutId);
  }, [state.items, isAuthenticated, user?.id, isCartLoaded]); // Include isCartLoaded to prevent premature sync

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: "CLEAR_CART" });
    }
  }, [isAuthenticated]);

  const addItem = async (
    item: Omit<CartItem, "quantity">,
    quantity: number = 1
  ) => {
    if (!isAuthenticated) {
      return; // Don't add items if user is not authenticated
    }

    try {
      // Add to database first
      const token = localStorage.getItem("authToken");
      const timestamp = Date.now();
      await axios.post(
        buildApiUrl("/api/cart"),
        {
          productId: String(item.productId || item.id), // Ensure ID is string
          slug: item.slug || item.productSlug || null,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
          quantity,
          inStock: item.inStock,
          variants: item.variants || {},
          lastModified: timestamp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Then update local state
      dispatch({
        type: "ADD_ITEM",
        payload: { ...item, quantity, lastModified: timestamp },
      });
    } catch (error) {
      // Fallback to local state only
      dispatch({
        type: "ADD_ITEM",
        payload: { ...item, quantity, lastModified: Date.now() },
      });
    }
  };

  const removeItem = async (id: string | number) => {
    try {
      // Remove from database first
      const token = localStorage.getItem("authToken");
      await axios.delete(buildApiUrl(`/api/cart/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // Then update local state
      dispatch({ type: "REMOVE_ITEM", payload: id });
    } catch (error) {
      // Fallback to local state only
      dispatch({ type: "REMOVE_ITEM", payload: id });
    }
  };

  const updateQuantity = async (id: string | number, quantity: number) => {
    try {
      // Update in database first
      const token = localStorage.getItem("authToken");
      await axios.patch(
        buildApiUrl(`/api/cart/${id}`),
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Then update local state
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    } catch (error) {
      // Fallback to local state only
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    }
  };

  const clearCart = async () => {
    try {
      // Clear in database first
      const token = localStorage.getItem("authToken");
      await axios.delete(buildApiUrl("/api/cart"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // Then update local state
      dispatch({ type: "CLEAR_CART" });
    } catch (error) {
      // Fallback to local state only
      dispatch({ type: "CLEAR_CART" });
    }
  };

  const isInCart = (id: string | number): boolean => {
    const idStr = String(id);
    return state.items.some((item) => String(item.id) === idStr);
  };

  const refreshCart = async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(buildApiUrl("/api/cart"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const cartItems = response.data.cart.items || [];
      // Transform items from backend format (productId) to frontend format (id)
      const transformedItems = cartItems.map((item: any) => ({
        id: String(item.productId), // Ensure ID is string
        productId: String(item.productId),
        slug: item.slug || null,
        productSlug: item.slug || null,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        quantity: item.quantity,
        inStock: item.inStock,
        variants: item.variants || {},
      }));

      // Update cart with fresh data from database
      dispatch({ type: "LOAD_CART", payload: transformedItems });

      // Update localStorage with fresh data
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(transformedItems));
    } catch (error) {
      // Failed to refresh cart
    }
  };

  const value: CartContextType = {
    items: state.items,
    total: calculateTotal(state.items),
    itemCount: calculateItemCount(state.items),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
