import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext.tsx";
import axios from "axios";
import { buildApiUrl } from "./api.ts";

interface CartItem {
  id: string | number; // Changed to string to support variant-based IDs
  productId?: number; // Original product ID for reference
  name: string;
  price: string;
  image: string;
  category: string;
  quantity: number;
  inStock: boolean;
  variants?: { [key: string]: string }; // Selected variants like size, color, etc.
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  // Calculate totals whenever items change
  useEffect(() => {
    const total = calculateTotal(state.items);
    const itemCount = calculateItemCount(state.items);

    dispatch({ type: "LOAD_CART", payload: state.items });
  }, [state.items]);

  // Load cart from database on mount and when user changes
  useEffect(() => {
    const loadCartFromDatabase = async () => {
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
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            quantity: item.quantity,
            inStock: item.inStock,
          }));
          dispatch({ type: "LOAD_CART", payload: transformedItems });
        } catch (error) {
          console.error("Error loading cart from database:", error);
          // Fallback to localStorage if database fails
          const savedCart = localStorage.getItem(`cart_${user.id}`);
          if (savedCart) {
            try {
              const items = JSON.parse(savedCart);
              dispatch({ type: "LOAD_CART", payload: items });
            } catch (localError) {
              console.error(
                "Error loading cart from localStorage:",
                localError
              );
              dispatch({ type: "CLEAR_CART" });
            }
          } else {
            dispatch({ type: "CLEAR_CART" });
          }
        }
      } else {
        // Clear cart when user logs out
        dispatch({ type: "CLEAR_CART" });
      }
    };

    loadCartFromDatabase();
  }, [isAuthenticated, user]);

  // Sync cart to database whenever it changes (only for authenticated users)
  useEffect(() => {
    const syncCartToDatabase = async () => {
      if (isAuthenticated && user && state.items.length > 0) {
        try {
          const token = localStorage.getItem("authToken");
          // Transform items to match backend schema (id -> productId)
          const transformedItems = state.items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            quantity: item.quantity,
            inStock: item.inStock,
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
          console.error("Error syncing cart to database:", error);
          // Fallback to localStorage only
          localStorage.setItem(`cart_${user.id}`, JSON.stringify(state.items));
        }
      } else if (isAuthenticated && user && state.items.length === 0) {
        // Clear cart in database when empty
        try {
          const token = localStorage.getItem("authToken");
          await axios.delete(buildApiUrl("/api/cart"), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
          localStorage.removeItem(`cart_${user.id}`);
        } catch (error) {
          console.error("Error clearing cart in database:", error);
        }
      }
    };

    syncCartToDatabase();
  }, [state.items, isAuthenticated, user]);

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
      await axios.post(
        buildApiUrl("/api/cart"),
        {
          productId: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
          quantity,
          inStock: item.inStock,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Then update local state
      dispatch({ type: "ADD_ITEM", payload: { ...item, quantity } });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      // Fallback to local state only
      dispatch({ type: "ADD_ITEM", payload: { ...item, quantity } });
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
      console.error("Error removing item from cart:", error);
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
      console.error("Error updating cart item quantity:", error);
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
      console.error("Error clearing cart:", error);
      // Fallback to local state only
      dispatch({ type: "CLEAR_CART" });
    }
  };

  const isInCart = (id: string | number): boolean => {
    return state.items.some((item) => item.id === id);
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
