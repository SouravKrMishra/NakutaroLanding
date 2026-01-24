import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/lib/CartContext.tsx";
import { useAuth } from "@/lib/AuthContext.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import { Ticket, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  Lock,
  MapPin,
  ShoppingCart,
  Smartphone,
  Wallet,
  Bitcoin,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { buildApiUrl } from "@/lib/api.ts";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const CheckoutPage = () => {
  const [, setLocation] = useLocation();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [phonepeTransactionId, setPhonepeTransactionId] = useState("");
  const [phonepePaymentUrl, setPhonepePaymentUrl] = useState("");
  const [showPhonepeRedirect, setShowPhonepeRedirect] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "PHONEPE" | "cod" | "CONTROPAY"
  >("PHONEPE");
  const [codEnabled, setCodEnabled] = useState(true); // Default to true
  const [phonepeAvailable, setPhonepeAvailable] = useState(true); // Default to true
  const [contropayAvailable, setContropayAvailable] = useState(false);
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(true);

  // Contropay crypto payment state
  const [contropayConfig, setContropayConfig] = useState<{
    chains: string[];
    chainTokens: Record<string, string[]>;
    chainDisplayNames: Record<string, string>;
    defaultChain: string;
    defaultToken: string;
    inrUsdRate: number;
  } | null>(null);
  const [selectedChain, setSelectedChain] = useState("TRON");
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [contropayPaymentUrl, setContropayPaymentUrl] = useState("");
  const [contropayPaymentLinkId, setContropayPaymentLinkId] = useState("");
  const [showContropayRedirect, setShowContropayRedirect] = useState(false);
  const [contropayPaymentOpened, setContropayPaymentOpened] = useState(false);
  const [checkingContropayStatus, setCheckingContropayStatus] = useState(false);
  const [contropayOrderId, setContropayOrderId] = useState("");

  // Coupon state - retrieve from localStorage (set by CartPage)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Stock data state
  const [stockData, setStockData] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockErrors, setStockErrors] = useState<
    Array<{
      itemName: string;
      size: string;
      color: string;
      requested: number;
      available: number;
    }>
  >([]);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Fetch payment gateway statuses
  React.useEffect(() => {
    const fetchPaymentStatuses = async () => {
      setPaymentSettingsLoading(true);
      try {
        // Fetch payment statuses and Contropay config in parallel
        const [statusResponse, contropayConfigResponse] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_BASE_URL || ""}/api/payments/status`
          ),
          fetch(
            `${
              import.meta.env.VITE_API_BASE_URL || ""
            }/api/payments/contropay/config`
          ),
        ]);

        if (statusResponse.ok) {
          const data = await statusResponse.json();
          const phonepeEnabled = data.phonepe?.enabled ?? false;
          const codEnabledStatus = data.cod?.enabled ?? true;
          const contropayEnabled = data.contropay?.enabled ?? false;

          setPhonepeAvailable(phonepeEnabled);
          setCodEnabled(codEnabledStatus);
          setContropayAvailable(contropayEnabled);

          // If current payment method is disabled, switch to an available one
          if (paymentMethod === "cod" && !codEnabledStatus) {
            if (phonepeEnabled) {
              setPaymentMethod("PHONEPE");
            } else if (contropayEnabled) {
              setPaymentMethod("CONTROPAY");
            }
          } else if (paymentMethod === "PHONEPE" && !phonepeEnabled) {
            if (codEnabledStatus) {
              setPaymentMethod("cod");
            } else if (contropayEnabled) {
              setPaymentMethod("CONTROPAY");
            }
          } else if (paymentMethod === "CONTROPAY" && !contropayEnabled) {
            if (phonepeEnabled) {
              setPaymentMethod("PHONEPE");
            } else if (codEnabledStatus) {
              setPaymentMethod("cod");
            }
          }

          // If no payment method is available, default to the first available one
          if (!phonepeEnabled && !codEnabledStatus && !contropayEnabled) {
            setPaymentMethod("PHONEPE");
          } else if (phonepeEnabled) {
            // Keep current or default to PhonePe
          } else if (contropayEnabled) {
            setPaymentMethod("CONTROPAY");
          } else if (codEnabledStatus) {
            setPaymentMethod("cod");
          }
        }

        // Fetch Contropay config for chain/token options
        if (contropayConfigResponse.ok) {
          const configData = await contropayConfigResponse.json();
          if (configData.success) {
            setContropayConfig({
              chains: configData.chains,
              chainTokens: configData.chainTokens,
              chainDisplayNames: configData.chainDisplayNames,
              defaultChain: configData.defaultChain,
              defaultToken: configData.defaultToken,
              inrUsdRate: configData.inrUsdRate,
            });
            setSelectedChain(configData.defaultChain || "TRON");
            setSelectedToken(configData.defaultToken || "USDT");
          }
        }
      } catch (error) {
        console.error("Failed to fetch payment gateway statuses:", error);
        // Default to enabled on error for backward compatibility
        setPhonepeAvailable(true);
        setCodEnabled(true);
        setContropayAvailable(false);
      } finally {
        setPaymentSettingsLoading(false);
      }
    };

    // Fetch once on mount
    fetchPaymentStatuses();
  }, []); // Empty deps - only run on mount

  // Fetch user details from database and pre-fill form
  React.useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const userData = await response.json();

          // Pre-fill shipping information with user data
          setShippingInfo({
            firstName: userData.name?.split(" ")[0] || "",
            lastName: userData.name?.split(" ").slice(1).join(" ") || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            state: userData.state || "",
            pincode: userData.pincode || "",
            country: userData.country || "India",
          });
        }
      } catch (error) {
        // Fallback to basic user info if API fails
        setShippingInfo((prev) => ({
          ...prev,
          firstName: user?.name?.split(" ")[0] || "",
          lastName: user?.name?.split(" ").slice(1).join(" ") || "",
          email: user?.email || "",
        }));
      }
    };

    fetchUserDetails();
  }, [user]);

  // Redirect if cart is empty (authentication is handled by ProtectedRoute)
  React.useEffect(() => {
    if (items.length === 0) {
      setLocation("/cart");
    }
  }, [items, setLocation]);

  // Load and validate coupon from URL params (passed from CartPage)
  useEffect(() => {
    const validateCouponFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const couponCode = urlParams.get("coupon");

      if (!couponCode) {
        return;
      }

      try {
        // Validate the coupon with the server
        const token = localStorage.getItem("authToken");
        const userType = user?.userType || "individual";
        const response = await axios.post(
          buildApiUrl("/api/coupons/validate"),
          {
            code: couponCode,
            cartTotal: total,
            userType: userType,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (response.data.valid) {
          // Coupon is valid - apply it
          setAppliedCoupon(response.data.coupon);
          setCouponDiscount(response.data.coupon.discountAmount);
        } else {
          // Coupon is not valid
          console.log("Coupon is not valid:", response.data.message);
          setAppliedCoupon(null);
          setCouponDiscount(0);
        }
      } catch (e) {
        console.error("Failed to validate coupon", e);
        setAppliedCoupon(null);
        setCouponDiscount(0);
      }
    };

    // Only validate if we have cart items
    if (total > 0) {
      validateCouponFromUrl();
    }
  }, [total, user?.userType]);

  // Fetch stock data for verification
  useEffect(() => {
    const fetchStockData = async () => {
      setStockLoading(true);
      try {
        const response = await axios.get(buildApiUrl("/api/stock-data"), {
          validateStatus: (status) => status >= 200 && status < 300,
        });

        const contentType = response.headers["content-type"] || "";
        if (contentType.includes("application/json")) {
          setStockData(response.data.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch stock data:", err);
      } finally {
        setStockLoading(false);
      }
    };

    fetchStockData();
  }, []);

  // Helper function to resolve product type from category
  const resolveStockProductType = (
    category: string
  ): "tshirt" | "hoodie" | "sweatshirt" => {
    const categoryLower = category?.toLowerCase() || "";
    if (categoryLower.includes("hoodie")) return "hoodie";
    if (categoryLower.includes("sweatshirt")) return "sweatshirt";
    return "tshirt";
  };

  // Helper function to get available stock for a size-color combination
  const getAvailableStock = (item: any): number => {
    if (!stockData || !item.variants) return 0;

    const sizeKey = Object.keys(item.variants).find((key) =>
      key.toLowerCase().includes("size")
    );
    const colorKey = Object.keys(item.variants).find((key) =>
      key.toLowerCase().includes("color")
    );

    if (!sizeKey || !colorKey) return 0;

    const size = item.variants[sizeKey];
    const color = item.variants[colorKey];
    const key = `${size}-${color}`;
    const productType = resolveStockProductType(item.category);

    const typeStock = stockData.types?.[productType]?.stock;
    if (typeStock && key in typeStock) {
      return typeStock[key]?.quantity || 0;
    }

    // Fallback to legacy stock map if types were not provided
    if (stockData.stock && key in stockData.stock) {
      return stockData.stock[key]?.quantity || 0;
    }

    return 0;
  };

  // Verify stock before proceeding to payment
  const verifyStock = (): boolean => {
    const errors: Array<{
      itemName: string;
      size: string;
      color: string;
      requested: number;
      available: number;
    }> = [];

    items.forEach((item) => {
      if (item.variants && Object.keys(item.variants).length > 0) {
        // For clothing items with variants, check Stock collection
        if (!stockData) {
          // If stock data is not loaded for clothing items, skip (backend will verify)
          return;
        }

        const availableStock = getAvailableStock(item);

        if (availableStock === 0) {
          const sizeKey = Object.keys(item.variants).find((key) =>
            key.toLowerCase().includes("size")
          );
          const colorKey = Object.keys(item.variants).find((key) =>
            key.toLowerCase().includes("color")
          );

          errors.push({
            itemName: item.name,
            size: sizeKey ? item.variants[sizeKey] : "N/A",
            color: colorKey ? item.variants[colorKey] : "N/A",
            requested: item.quantity,
            available: 0,
          });
        } else if (item.quantity > availableStock) {
          const sizeKey = Object.keys(item.variants).find((key) =>
            key.toLowerCase().includes("size")
          );
          const colorKey = Object.keys(item.variants).find((key) =>
            key.toLowerCase().includes("color")
          );

          errors.push({
            itemName: item.name,
            size: sizeKey ? item.variants[sizeKey] : "N/A",
            color: colorKey ? item.variants[colorKey] : "N/A",
            requested: item.quantity,
            available: availableStock,
          });
        }
      } else {
        // For non-clothing items (Action Figures, Wigs, etc.), check inStock flag
        // This flag is set by the server based on the product's individual stock
        if (!item.inStock) {
          errors.push({
            itemName: item.name,
            size: "N/A",
            color: "N/A",
            requested: item.quantity,
            available: 0,
          });
        }
      }
    });

    if (errors.length > 0) {
      setStockErrors(errors);
      return false;
    }

    setStockErrors([]);
    return true;
  };

  // Calculate shipping cost - free if coupon has freeShipping enabled (only for individual users)
  // Individual users: free shipping at ₹2000+, Business users: free shipping at ₹1000+ (but never from coupons)
  const isBusinessUser = user?.userType === "business";
  const freeShippingThreshold = isBusinessUser ? 1000 : 2000;
  const baseShippingCost = total >= freeShippingThreshold ? 0 : 100;
  // Business users don't get free shipping from coupons, only individual users do
  const shippingCost = !isBusinessUser && appliedCoupon?.freeShipping ? 0 : baseShippingCost;
  const subtotalAfterDiscount = total - couponDiscount;
  const finalTotal = subtotalAfterDiscount + shippingCost;

  // Minimum cart value for business users (from .env)
  const businessMinCartValue = Number(import.meta.env.VITE_BUSINESS_MIN_CART_VALUE) || 0;

  // Minimum cart value for individual users when cart contains Posters or Stickers (from .env)
  const individualPostersStickersMinCartValue = Number(import.meta.env.VITE_INDIVIDUAL_POSTERS_STICKERS_MIN_CART_VALUE) || 0;
  
  // Check if cart contains Posters or Stickers products
  const hasPostersOrStickers = items.some(
    (item) => item.category === "Posters" || item.category === "Stickers"
  );

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const validateShipping = (): boolean => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];
    return required.every(
      (field) => shippingInfo[field as keyof ShippingInfo].trim() !== ""
    );
  };

  // Save shipping details to user profile for individual users
  const saveShippingDetailsToProfile = async () => {
    if (!user) return;

    // Check if user is individual
    const userType = (user?.userType || "").toLowerCase();
    const isIndividualUser =
      userType === "individual" ||
      (!userType && !user.companyName && !user.businessType);

    // Only save for individual users
    if (!isIndividualUser) return;

    // Only save if shipping details are filled
    if (
      !shippingInfo.address?.trim() ||
      !shippingInfo.city?.trim() ||
      !shippingInfo.state?.trim() ||
      !shippingInfo.pincode?.trim()
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      // Update user profile with shipping details
      await axios.put(
        buildApiUrl("/api/auth/user/profile"),
        {
          phoneNumber: shippingInfo.phone.trim(),
          address: shippingInfo.address.trim(),
          city: shippingInfo.city.trim(),
          state: shippingInfo.state.trim(),
          pincode: shippingInfo.pincode.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      // Silently fail - don't interrupt order flow if profile update fails
      // Profile update failure shouldn't block order creation
    }
  };

  // Create COD order
  const createCODOrder = async () => {
    // Check minimum cart value for business users (after coupon discount)
    const cartValueAfterDiscount = subtotalAfterDiscount;
    if (isBusinessUser && businessMinCartValue > 0 && cartValueAfterDiscount < businessMinCartValue) {
      toast({
        title: "Minimum Order Value Required",
        description: `Business users must have a minimum cart value of ₹${businessMinCartValue.toLocaleString()} (after discount) to proceed with checkout.`,
        variant: "destructive",
      });
      return;
    }

    // Check minimum cart value for individual users when cart contains Posters or Stickers (after coupon discount)
    if (
      !isBusinessUser &&
      hasPostersOrStickers &&
      individualPostersStickersMinCartValue > 0 &&
      cartValueAfterDiscount < individualPostersStickersMinCartValue
    ) {
      toast({
        title: "Minimum Order Value Required",
        description: `Your cart contains Posters or Stickers. Individual users must have a minimum cart value of ₹${individualPostersStickersMinCartValue.toLocaleString()} (after discount) to proceed with checkout.`,
        variant: "destructive",
      });
      return;
    }

    // Check if COD is enabled
    if (!codEnabled) {
      toast({
        title: "COD Not Available",
        description:
          "Cash on Delivery is currently disabled. Please use PhonePe payment.",
        variant: "destructive",
      });
      setPaymentMethod("PHONEPE");
      return;
    }

    if (!validateShipping()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping fields.",
        variant: "destructive",
      });
      return;
    }

    // Verify stock before proceeding
    if (!verifyStock()) {
      toast({
        title: "Stock Verification Failed",
        description:
          "Some items in your cart are out of stock or have insufficient quantity. Please review and update your cart.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with checkout.",
        variant: "destructive",
      });
      setLocation("/login?from=checkout");
      return;
    }

    // Check if token exists
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      setLocation("/login?from=checkout");
      return;
    }

    setIsProcessing(true);
    try {
      // Map cart items to order items format
      const orderItems = items.map((item) => {
        // Extract product ID (handle variant-based IDs)
        let productId = item.id;
        if (typeof item.id === "string" && item.id.includes("_")) {
          // Extract product ID from variant ID (format: id_key:value|key:value)
          const parts = item.id.split("_");
          productId = parts[0];
        }

        // Extract size and color from variants object
        let size: string | null = null;
        let color: string | null = null;

        if (item.variants) {
          const entries = Object.entries(item.variants);
          // Check for size in variants (case-insensitive)
          const sizeEntry = entries.find(
            ([key]) => key.toLowerCase() === "size"
          );
          if (sizeEntry) {
            size = sizeEntry[1]?.toString().toUpperCase() || null;
          }

          // Check for color in variants (case-insensitive)
          const colorEntry = entries.find(
            ([key]) => key.toLowerCase() === "color"
          );
          if (colorEntry) {
            color =
              colorEntry[1]
                ?.toString()
                .split(" ")
                .map(
                  (part) =>
                    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                )
                .join(" ") || null;
          }
        }

        return {
          productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
          size,
          color,
        };
      });

      // Create order data
      const orderData = {
        items: orderItems,
        shippingInfo,
        paymentMethod: "cod",
        subtotal: total,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscount || 0,
        shippingCost,
        total: finalTotal,
      };

      // Create order
      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(orderData),
        }
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        // Extract validation errors if available
        let errorMessage = errorData.message || "Failed to create order";
        if (
          errorData.errors &&
          Array.isArray(errorData.errors) &&
          errorData.errors.length > 0
        ) {
          const firstError = errorData.errors[0];
          errorMessage = firstError.msg || firstError.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const orderResult = await orderResponse.json();

      // Save shipping details to user profile for individual users
      await saveShippingDetailsToProfile();

      // Clear cart
      clearCart();

      // Redirect to success page
      setLocation(
        `/order-success?orderId=${
          orderResult.order._id || orderResult.order.id
        }`
      );
    } catch (error: any) {
      toast({
        title: "Order Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize PhonePe payment
  const initializePhonepePayment = async () => {
    // Check minimum cart value for business users (after coupon discount)
    const cartValueAfterDiscount = subtotalAfterDiscount;
    if (isBusinessUser && businessMinCartValue > 0 && cartValueAfterDiscount < businessMinCartValue) {
      toast({
        title: "Minimum Order Value Required",
        description: `Business users must have a minimum cart value of ₹${businessMinCartValue.toLocaleString()} (after discount) to proceed with checkout.`,
        variant: "destructive",
      });
      return;
    }

    // Check minimum cart value for individual users when cart contains Posters or Stickers (after coupon discount)
    if (
      !isBusinessUser &&
      hasPostersOrStickers &&
      individualPostersStickersMinCartValue > 0 &&
      cartValueAfterDiscount < individualPostersStickersMinCartValue
    ) {
      toast({
        title: "Minimum Order Value Required",
        description: `Your cart contains Posters or Stickers. Individual users must have a minimum cart value of ₹${individualPostersStickersMinCartValue.toLocaleString()} (after discount) to proceed with checkout.`,
        variant: "destructive",
      });
      return;
    }

    // Check if PhonePe is enabled
    if (!phonepeAvailable) {
      toast({
        title: "PhonePe Not Available",
        description:
          "PhonePe payment gateway is currently disabled. Please use Cash on Delivery.",
        variant: "destructive",
      });
      return;
    }

    if (!validateShipping()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping fields.",
        variant: "destructive",
      });
      return;
    }

    // Verify stock before proceeding
    if (!verifyStock()) {
      toast({
        title: "Stock Verification Failed",
        description:
          "Some items in your cart are out of stock or have insufficient quantity. Please review and update your cart.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with payment.",
        variant: "destructive",
      });
      setLocation("/login?from=checkout");
      return;
    }

    // Check if token exists
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      setLocation("/login?from=checkout");
      return;
    }

    setIsProcessing(true);
    try {
      // Generate merchant transaction ID first
      const merchantTransactionId = `TXN_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Map cart items to order items format
      const orderItems = items.map((item) => {
        // Extract product ID (handle variant-based IDs)
        let productId = item.id;
        if (typeof item.id === "string" && item.id.includes("_")) {
          // Extract product ID from variant ID (format: id_key:value|key:value)
          const parts = item.id.split("_");
          productId = parts[0];
        }
        // No parseInt needed as IDs can be strings (ObjectIds) or numbers

        // Extract size and color from variants object
        let size: string | null = null;
        let color: string | null = null;

        if (item.variants) {
          const entries = Object.entries(item.variants);
          // Check for size in variants (case-insensitive)
          const sizeEntry = entries.find(
            ([key]) => key.toLowerCase() === "size"
          );
          if (sizeEntry) {
            size = sizeEntry[1]?.toString().toUpperCase() || null;
          }

          // Check for color in variants (case-insensitive)
          const colorEntry = entries.find(
            ([key]) => key.toLowerCase() === "color"
          );
          if (colorEntry) {
            color =
              colorEntry[1]
                ?.toString()
                .split(" ")
                .map(
                  (part) =>
                    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                )
                .join(" ") || null;
          }
        }

        return {
          productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
          size,
          color,
        };
      });

      // First, create the order
      const orderData = {
        items: orderItems,
        shippingInfo,
        paymentMethod: "PHONEPE",
        subtotal: total,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscount || 0,
        shippingCost,
        total: finalTotal,
        merchantTransactionId,
      };

      const token = localStorage.getItem("authToken");

      // Create order first
      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/orders/phonepe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(orderData),
        }
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        // Extract validation errors if available
        let errorMessage = errorData.message || "Failed to create order";
        if (
          errorData.errors &&
          Array.isArray(errorData.errors) &&
          errorData.errors.length > 0
        ) {
          const firstError = errorData.errors[0];
          errorMessage = firstError.msg || firstError.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const orderResult = await orderResponse.json();

      // Save shipping details to user profile for individual users
      await saveShippingDetailsToProfile();

      // Then initiate PhonePe payment
      const paymentResponse = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || ""
        }/api/payments/phonepe/initiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            amount: finalTotal * 100, // Convert rupees to paise for PhonePe
            merchantTransactionId,
            merchantUserId: user?.id || "USER_" + Date.now(),
            mobileNumber: shippingInfo.phone,
            callbackUrl: `${window.location.origin}/api/payments/phonepe/callback`,
            redirectUrl: `${window.location.origin}/api/payments/phonepe/redirect?orderId=${orderResult.order.id}&merchantTransactionId=${merchantTransactionId}`,
            merchantOrderId: orderResult.order.orderNumber,
          }),
        }
      );

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        if (errorData.demo_mode) {
          // Handle demo mode - show instructions for getting real credentials
          toast({
            title: "PhonePe Setup Required",
            description:
              "Please configure your PhonePe merchant credentials to enable payments. Visit the setup guide for instructions.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(
          errorData.message || "Failed to initialize PhonePe payment"
        );
      }

      const data = await paymentResponse.json();

      if (data.success) {
        setPhonepeTransactionId(data.merchantTransactionId);
        // Handle both old and new response formats
        const paymentUrl =
          data.checkout_url || data.instrumentResponse?.redirectInfo?.url;
        setPhonepePaymentUrl(paymentUrl);
        setShowPhonepeRedirect(true);

        // Store transaction details in localStorage for verification
        localStorage.setItem(
          "phonepe_transaction",
          JSON.stringify({
            transactionId: data.merchantTransactionId,
            amount: finalTotal,
            timestamp: Date.now(),
          })
        );
      } else {
        throw new Error(data.message || "Payment initialization failed");
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize Contropay crypto payment
  const initializeContropayPayment = async () => {
    // Check minimum cart value for business users (after coupon discount)
    const cartValueAfterDiscount = subtotalAfterDiscount;
    if (isBusinessUser && businessMinCartValue > 0 && cartValueAfterDiscount < businessMinCartValue) {
      toast({
        title: "Minimum Order Value Required",
        description: `Business users must have a minimum cart value of ₹${businessMinCartValue.toLocaleString()} (after discount) to proceed with checkout.`,
        variant: "destructive",
      });
      return;
    }

    // Check minimum cart value for individual users when cart contains Posters or Stickers (after coupon discount)
    if (
      !isBusinessUser &&
      hasPostersOrStickers &&
      individualPostersStickersMinCartValue > 0 &&
      cartValueAfterDiscount < individualPostersStickersMinCartValue
    ) {
      toast({
        title: "Minimum Order Value Required",
        description: `Your cart contains Posters or Stickers. Individual users must have a minimum cart value of ₹${individualPostersStickersMinCartValue.toLocaleString()} (after discount) to proceed with checkout.`,
        variant: "destructive",
      });
      return;
    }

    // Check if Contropay is enabled
    if (!contropayAvailable) {
      toast({
        title: "Contropay Not Available",
        description:
          "Crypto payment gateway is currently disabled. Please use another payment method.",
        variant: "destructive",
      });
      return;
    }

    if (!validateShipping()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping fields.",
        variant: "destructive",
      });
      return;
    }

    // Verify stock before proceeding
    if (!verifyStock()) {
      toast({
        title: "Stock Verification Failed",
        description:
          "Some items in your cart are out of stock or have insufficient quantity. Please review and update your cart.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with payment.",
        variant: "destructive",
      });
      setLocation("/login?from=checkout");
      return;
    }

    // Check if token exists
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      setLocation("/login?from=checkout");
      return;
    }

    setIsProcessing(true);
    try {
      // Generate merchant transaction ID first
      const merchantTransactionId = `TXN_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Map cart items to order items format
      const orderItems = items.map((item) => {
        let productId = item.id;
        if (typeof item.id === "string" && item.id.includes("_")) {
          const parts = item.id.split("_");
          productId = parts[0];
        }

        let size: string | null = null;
        let color: string | null = null;

        if (item.variants) {
          const entries = Object.entries(item.variants);
          const sizeEntry = entries.find(
            ([key]) => key.toLowerCase() === "size"
          );
          if (sizeEntry) {
            size = sizeEntry[1]?.toString().toUpperCase() || null;
          }

          const colorEntry = entries.find(
            ([key]) => key.toLowerCase() === "color"
          );
          if (colorEntry) {
            color =
              colorEntry[1]
                ?.toString()
                .split(" ")
                .map(
                  (part) =>
                    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                )
                .join(" ") || null;
          }
        }

        return {
          productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
          size,
          color,
        };
      });

      // First, create the order
      const orderData = {
        items: orderItems,
        shippingInfo,
        paymentMethod: "CONTROPAY",
        subtotal: total,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscount || 0,
        shippingCost,
        total: finalTotal,
        merchantTransactionId,
        cryptoChain: selectedChain,
        cryptoToken: selectedToken,
      };

      // Create order first (using phonepe endpoint as it handles pending orders)
      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/orders/phonepe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(orderData),
        }
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        let errorMessage = errorData.message || "Failed to create order";
        if (
          errorData.errors &&
          Array.isArray(errorData.errors) &&
          errorData.errors.length > 0
        ) {
          const firstError = errorData.errors[0];
          errorMessage = firstError.msg || firstError.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const orderResult = await orderResponse.json();

      // Save shipping details to user profile for individual users
      await saveShippingDetailsToProfile();

      // Then initiate Contropay payment
      const paymentResponse = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || ""
        }/api/payments/contropay/initiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            amount: finalTotal * 100, // Convert rupees to paise
            merchantTransactionId,
            redirectUrl: `${window.location.origin}/api/payments/contropay/redirect?orderId=${orderResult.order.id}`,
            merchantOrderId: orderResult.order.orderNumber,
            chain: selectedChain,
            token: selectedToken,
          }),
        }
      );

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        if (errorData.demo_mode) {
          toast({
            title: "Contropay Setup Required",
            description:
              "Please configure your Contropay API credentials to enable crypto payments.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(
          errorData.message || "Failed to initialize Contropay payment"
        );
      }

      const data = await paymentResponse.json();

      if (data.success) {
        setContropayPaymentLinkId(data.paymentLinkId);
        setContropayPaymentUrl(data.paymentUrl);
        setContropayOrderId(orderResult.order.id || orderResult.order._id);
        setContropayPaymentOpened(false);
        setShowContropayRedirect(true);

        // Store transaction details in localStorage for verification
        localStorage.setItem(
          "contropay_transaction",
          JSON.stringify({
            paymentLinkId: data.paymentLinkId,
            orderId: orderResult.order.id || orderResult.order._id,
            amount: finalTotal,
            usdAmount: data.usdAmount,
            chain: selectedChain,
            token: selectedToken,
            timestamp: Date.now(),
          })
        );
      } else {
        throw new Error(data.message || "Payment initialization failed");
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize crypto payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check Contropay payment status after user completes payment
  const checkContropayPaymentStatus = async () => {
    if (!contropayPaymentLinkId) return;

    setCheckingContropayStatus(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || ""
        }/api/payments/contropay/status/${contropayPaymentLinkId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.status === "completed") {
          // Payment successful - clear cart and redirect
          clearCart();
          localStorage.removeItem("contropay_transaction");

          toast({
            title: "Payment Successful",
            description: "Your crypto payment has been confirmed!",
          });

          setLocation(`/order-success?orderId=${contropayOrderId}`);
        } else if (data.status === "expired" || data.status === "cancelled") {
          toast({
            title: "Payment Failed",
            description: `Payment ${data.status}. Please try again.`,
            variant: "destructive",
          });
          setShowContropayRedirect(false);
        } else {
          // Still pending or unconfirmed
          toast({
            title: "Payment Pending",
            description:
              "Your payment is still being processed. Please wait a moment and check again.",
          });
        }
      } else {
        throw new Error(data.message || "Failed to check payment status");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to check payment status",
        variant: "destructive",
      });
    } finally {
      setCheckingContropayStatus(false);
    }
  };

  // Handle chain change - update token to default for that chain
  const handleChainChange = (newChain: string) => {
    setSelectedChain(newChain);
    if (contropayConfig) {
      const tokens = contropayConfig.chainTokens[newChain];
      // Prefer USDT if available, otherwise first token
      const defaultToken = tokens?.includes("USDT")
        ? "USDT"
        : tokens?.[0] || "USDT";
      setSelectedToken(defaultToken);
    }
  };

  if (!user || items.length === 0) {
    return (
      <div className="min-h-screen bg-[#181818] text-white pt-28">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white pt-28">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/cart")}
              className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-accent">Checkout</h1>
              <p className="text-gray-400">Complete your purchase</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Shipping Information */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center text-accent">
                  <Truck className="w-5 h-5 mr-2" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={shippingInfo.firstName}
                      onChange={(e) =>
                        handleShippingChange("firstName", e.target.value)
                      }
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={shippingInfo.lastName}
                      onChange={(e) =>
                        handleShippingChange("lastName", e.target.value)
                      }
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        handleShippingChange("email", e.target.value)
                      }
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        handleShippingChange("phone", e.target.value)
                      }
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address" className="text-gray-300">
                      Address *
                    </Label>
                    <Textarea
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        handleShippingChange("address", e.target.value)
                      }
                      className="bg-[#2a2a2a] border-[#444] text-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-gray-300">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        handleShippingChange("city", e.target.value)
                      }
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-gray-300">
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) =>
                        handleShippingChange("state", e.target.value)
                      }
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode" className="text-gray-300">
                      Pincode *
                    </Label>
                    <Input
                      id="pincode"
                      value={shippingInfo.pincode}
                      onChange={(e) =>
                        handleShippingChange("pincode", e.target.value)
                      }
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-gray-300">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) =>
                        handleShippingChange("country", e.target.value)
                      }
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-[#1a1a1a] border-[#333] sticky top-32">
              <CardHeader>
                <CardTitle className="text-accent">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stock Errors */}
                  {stockErrors.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center text-red-400 font-medium">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Stock Issues Detected
                      </div>
                      {stockErrors.map((error, idx) => (
                        <div key={idx} className="text-xs text-red-300">
                          <strong>{error.itemName}</strong> ({error.size}{" "}
                          {error.color}): Requested {error.requested}, Available{" "}
                          {error.available}
                        </div>
                      ))}
                      <div className="text-xs text-red-300 mt-2">
                        Please return to cart and update quantities.
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    {items.map((item) => {
                      // For clothing items with variants, check Stock collection
                      const availableStock =
                        item.variants && Object.keys(item.variants).length > 0
                          ? getAvailableStock(item)
                          : null;

                      // Check stock issues: for clothing items check availableStock, for non-clothing check inStock flag
                      let hasStockIssue = false;
                      let stockMessage = "";

                      if (
                        item.variants &&
                        Object.keys(item.variants).length > 0
                      ) {
                        // Clothing items with variants
                        hasStockIssue =
                          availableStock !== null &&
                          (availableStock === 0 ||
                            item.quantity > availableStock);
                        if (hasStockIssue) {
                          stockMessage =
                            availableStock === 0
                              ? "Out of stock"
                              : `Only ${availableStock} available`;
                        }
                      } else {
                        // Non-clothing items (Action Figures, Wigs, etc.)
                        hasStockIssue = !item.inStock;
                        if (hasStockIssue) {
                          stockMessage = "Out of stock";
                        }
                      }

                      return (
                        <div
                          key={item.id}
                          className={`flex justify-between text-sm ${
                            hasStockIssue ? "text-red-400" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <span
                              className={
                                hasStockIssue ? "text-red-400" : "text-gray-400"
                              }
                            >
                              {item.name} (x{item.quantity})
                            </span>
                            {item.variants &&
                              Object.keys(item.variants).length > 0 && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {Object.entries(item.variants)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(", ")}
                                </div>
                              )}
                            {hasStockIssue && (
                              <div className="text-xs text-red-400 mt-0.5 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {stockMessage}
                              </div>
                            )}
                          </div>
                          <span
                            className={
                              hasStockIssue ? "text-red-400" : "text-white"
                            }
                          >
                            ₹
                            {(
                              parseFloat(item.price.replace(/[^\d.]/g, "")) *
                              item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-[#333] pt-4 space-y-2">
                    {/* Minimum cart value warning for business users (after discount) */}
                    {isBusinessUser && businessMinCartValue > 0 && subtotalAfterDiscount < businessMinCartValue && (
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-2">
                        <div className="flex items-center text-orange-400 font-medium text-sm mb-1">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Minimum Order Value Required
                        </div>
                        <p className="text-xs text-orange-300">
                          Business users must have a minimum cart value of ₹{businessMinCartValue.toLocaleString()} (after discount) to proceed. 
                          Add ₹{(businessMinCartValue - subtotalAfterDiscount).toLocaleString()} more to checkout.
                        </p>
                      </div>
                    )}

                    {/* Minimum cart value warning for individual users with Posters/Stickers (after discount) */}
                    {!isBusinessUser && hasPostersOrStickers && individualPostersStickersMinCartValue > 0 && subtotalAfterDiscount < individualPostersStickersMinCartValue && (
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-2">
                        <div className="flex items-center text-orange-400 font-medium text-sm mb-1">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Minimum Order Value Required
                        </div>
                        <p className="text-xs text-orange-300">
                          Your cart contains Posters or Stickers. Individual users must have a minimum cart value of ₹{individualPostersStickersMinCartValue.toLocaleString()} (after discount) to proceed. 
                          Add ₹{(individualPostersStickersMinCartValue - subtotalAfterDiscount).toLocaleString()} more to checkout.
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-500 flex items-center">
                          <Ticket className="w-4 h-4 mr-1" />
                          Coupon Discount ({appliedCoupon?.code})
                        </span>
                        <span className="text-green-500 font-medium">
                          -₹{couponDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-white">
                        {shippingCost === 0 ? (
                          <span className="text-green-400 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Free
                          </span>
                        ) : (
                          `₹${shippingCost}`
                        )}
                      </span>
                    </div>
                    <div className="border-t border-[#333] pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-accent">
                          ₹{finalTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm font-medium">
                      Select Payment Method
                    </Label>

                    {paymentSettingsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-gray-400">
                          Loading payment options...
                        </span>
                      </div>
                    ) : (
                      <>
                        {!phonepeAvailable &&
                        !codEnabled &&
                        !contropayAvailable ? (
                          <div className="bg-gradient-to-br from-red-500/20 via-orange-500/10 to-red-500/20 border-2 border-red-500/50 rounded-xl p-6 text-center shadow-lg">
                            <div className="flex flex-col items-center space-y-3">
                              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-red-400 mb-1">
                                  Payment Methods Unavailable
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                  All payment methods are currently disabled.
                                  Please check back later or contact our support
                                  team for assistance.
                                </p>
                              </div>
                              <div className="mt-2 pt-3 border-t border-red-500/30 w-full">
                                <p className="text-xs text-gray-400">
                                  Need help? Contact us at{" "}
                                  <a
                                    href="mailto:support@animeindia.org"
                                    className="text-red-400 hover:text-red-300 underline font-medium"
                                  >
                                    support@animeindia.org
                                  </a>
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* PhonePe Option */}
                            <div
                              onClick={() => {
                                if (phonepeAvailable) {
                                  setPaymentMethod("PHONEPE");
                                }
                              }}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                !phonepeAvailable
                                  ? "border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-50"
                                  : paymentMethod === "PHONEPE"
                                  ? "border-purple-500 bg-purple-500/10 cursor-pointer"
                                  : "border-[#444] bg-[#2a2a2a] hover:border-purple-500/50 cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      paymentMethod === "PHONEPE"
                                        ? "border-purple-500 bg-purple-500"
                                        : "border-gray-500"
                                    }`}
                                  >
                                    {paymentMethod === "PHONEPE" && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                  <Smartphone
                                    className={`w-5 h-5 ${
                                      !phonepeAvailable
                                        ? "text-gray-500"
                                        : "text-purple-400"
                                    }`}
                                  />
                                  <div>
                                    <div
                                      className={`font-medium ${
                                        !phonepeAvailable
                                          ? "text-gray-500"
                                          : "text-white"
                                      }`}
                                    >
                                      PhonePe Payment
                                      {!phonepeAvailable && (
                                        <span className="ml-2 text-xs text-red-400">
                                          (Disabled)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {!phonepeAvailable
                                        ? "This payment method is currently unavailable"
                                        : "UPI, Cards, Net Banking, Wallets"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* COD Option */}
                            <div
                              onClick={() => {
                                if (codEnabled) {
                                  setPaymentMethod("cod");
                                }
                              }}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                !codEnabled
                                  ? "border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-50"
                                  : paymentMethod === "cod"
                                  ? "border-green-500 bg-green-500/10 cursor-pointer"
                                  : "border-[#444] bg-[#2a2a2a] hover:border-green-500/50 cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      paymentMethod === "cod"
                                        ? "border-green-500 bg-green-500"
                                        : "border-gray-500"
                                    }`}
                                  >
                                    {paymentMethod === "cod" && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                  <Wallet
                                    className={`w-5 h-5 ${
                                      !codEnabled
                                        ? "text-gray-500"
                                        : "text-green-400"
                                    }`}
                                  />
                                  <div>
                                    <div
                                      className={`font-medium ${
                                        !codEnabled
                                          ? "text-gray-500"
                                          : "text-white"
                                      }`}
                                    >
                                      Cash on Delivery (COD)
                                      {!codEnabled && (
                                        <span className="ml-2 text-xs text-red-400">
                                          (Disabled)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {!codEnabled
                                        ? "This payment method is currently unavailable"
                                        : "Pay when you receive • No extra charges"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Contropay Crypto Option */}
                            <div
                              onClick={() => {
                                if (contropayAvailable) {
                                  setPaymentMethod("CONTROPAY");
                                }
                              }}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                !contropayAvailable
                                  ? "border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-50"
                                  : paymentMethod === "CONTROPAY"
                                  ? "border-orange-500 bg-orange-500/10 cursor-pointer"
                                  : "border-[#444] bg-[#2a2a2a] hover:border-orange-500/50 cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      paymentMethod === "CONTROPAY"
                                        ? "border-orange-500 bg-orange-500"
                                        : "border-gray-500"
                                    }`}
                                  >
                                    {paymentMethod === "CONTROPAY" && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                  <Bitcoin
                                    className={`w-5 h-5 ${
                                      !contropayAvailable
                                        ? "text-gray-500"
                                        : "text-orange-400"
                                    }`}
                                  />
                                  <div>
                                    <div
                                      className={`font-medium ${
                                        !contropayAvailable
                                          ? "text-gray-500"
                                          : "text-white"
                                      }`}
                                    >
                                      Crypto Payment
                                      {!contropayAvailable && (
                                        <span className="ml-2 text-xs text-red-400">
                                          (Disabled)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {!contropayAvailable
                                        ? "This payment method is currently unavailable"
                                        : "Pay with USDT, BTC, ETH, BNB & more"}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Chain/Token Selector - shown when Contropay is selected */}
                              {paymentMethod === "CONTROPAY" &&
                                contropayAvailable &&
                                contropayConfig && (
                                  <div className="mt-4 pt-4 border-t border-[#444]">
                                    <div className="grid grid-cols-2 gap-3">
                                      {/* Chain Selector */}
                                      <div>
                                        <label className="text-xs text-gray-400 mb-1 block">
                                          Network
                                        </label>
                                        <div className="relative">
                                          <select
                                            value={selectedChain}
                                            onChange={(e) =>
                                              handleChainChange(e.target.value)
                                            }
                                            className="w-full bg-[#1a1a1a] border border-[#555] rounded-lg px-3 py-2 text-white text-sm appearance-none cursor-pointer focus:border-orange-500 focus:outline-none"
                                          >
                                            {contropayConfig.chains.map(
                                              (chain) => (
                                                <option
                                                  key={chain}
                                                  value={chain}
                                                >
                                                  {contropayConfig
                                                    .chainDisplayNames[chain] ||
                                                    chain}
                                                </option>
                                              )
                                            )}
                                          </select>
                                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                      </div>

                                      {/* Token Selector */}
                                      <div>
                                        <label className="text-xs text-gray-400 mb-1 block">
                                          Token
                                        </label>
                                        <div className="relative">
                                          <select
                                            value={selectedToken}
                                            onChange={(e) =>
                                              setSelectedToken(e.target.value)
                                            }
                                            className="w-full bg-[#1a1a1a] border border-[#555] rounded-lg px-3 py-2 text-white text-sm appearance-none cursor-pointer focus:border-orange-500 focus:outline-none"
                                          >
                                            {contropayConfig.chainTokens[
                                              selectedChain
                                            ]?.map((token) => (
                                              <option key={token} value={token}>
                                                {token}
                                              </option>
                                            ))}
                                          </select>
                                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                      </div>
                                    </div>
                                    {/* USD Equivalent Display */}
                                    {contropayConfig.inrUsdRate && (
                                      <div className="mt-2 text-xs text-gray-400 text-center">
                                        ≈ $
                                        {(
                                          finalTotal *
                                          contropayConfig.inrUsdRate
                                        ).toFixed(2)}{" "}
                                        USD
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Security Notice */}
                  <div className="bg-[#2a2a2a] p-3 rounded-lg border border-[#444]">
                    <div className="flex items-center text-green-400 mb-2">
                      <Shield className="w-4 h-4 mr-2" />
                      Secure Checkout
                    </div>
                    <p className="text-xs text-gray-400">
                      {paymentMethod === "PHONEPE"
                        ? "Your payment information is encrypted and secure. We never store your card details."
                        : "Your order will be confirmed once you receive the items. Payment is collected at delivery."}
                    </p>
                  </div>

                  {/* Payment Button */}
                  <Button
                    onClick={
                      paymentMethod === "PHONEPE"
                        ? initializePhonepePayment
                        : paymentMethod === "CONTROPAY"
                        ? initializeContropayPayment
                        : createCODOrder
                    }
                    disabled={
                      isProcessing ||
                      paymentSettingsLoading ||
                      (paymentMethod === "PHONEPE" && !phonepeAvailable) ||
                      (paymentMethod === "cod" && !codEnabled) ||
                      (paymentMethod === "CONTROPAY" && !contropayAvailable) ||
                      (isBusinessUser && businessMinCartValue > 0 && subtotalAfterDiscount < businessMinCartValue) ||
                      (!isBusinessUser && hasPostersOrStickers && individualPostersStickersMinCartValue > 0 && subtotalAfterDiscount < individualPostersStickersMinCartValue)
                    }
                    className={`w-full py-3 ${
                      paymentMethod === "PHONEPE"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : paymentMethod === "CONTROPAY"
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white ${
                      (paymentMethod === "PHONEPE" && !phonepeAvailable) ||
                      (paymentMethod === "cod" && !codEnabled) ||
                      (paymentMethod === "CONTROPAY" && !contropayAvailable)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : paymentMethod === "PHONEPE" ? (
                      <div className="flex items-center">
                        <Smartphone className="w-5 h-5 mr-2" />
                        {!phonepeAvailable
                          ? "PhonePe Unavailable"
                          : "Pay with PhonePe"}
                      </div>
                    ) : paymentMethod === "CONTROPAY" ? (
                      <div className="flex items-center">
                        <Bitcoin className="w-5 h-5 mr-2" />
                        {!contropayAvailable
                          ? "Crypto Unavailable"
                          : `Pay with ${selectedToken}`}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Wallet className="w-5 h-5 mr-2" />
                        {!codEnabled ? "COD Unavailable" : "Place Order (COD)"}
                      </div>
                    )}
                  </Button>

                  {/* Show message if no payment methods available */}
                  {!phonepeAvailable &&
                    !codEnabled &&
                    !contropayAvailable &&
                    !paymentSettingsLoading && (
                      <div className="bg-gradient-to-br from-red-500/20 via-orange-500/10 to-red-500/20 border-2 border-red-500/50 rounded-xl p-5 text-center shadow-lg">
                        <div className="flex items-center justify-center space-x-3 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <p className="text-red-400 font-semibold">
                            Unable to Process Payment
                          </p>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">
                          All payment methods are currently unavailable. Please
                          try again later.
                        </p>
                        <p className="text-xs text-gray-400">
                          For assistance, contact{" "}
                          <a
                            href="mailto:support@animeindia.org"
                            className="text-red-400 hover:text-red-300 underline"
                          >
                            support@animeindia.org
                          </a>
                        </p>
                      </div>
                    )}

                  {paymentMethod === "PHONEPE" && (
                    <div className="bg-[#2a2a2a] p-3 rounded-lg border border-[#444]">
                      <div className="flex items-center text-purple-400 mb-2">
                        <Smartphone className="w-4 h-4 mr-2" />
                        PhonePe Payment
                      </div>
                      <p className="text-xs text-gray-400">
                        <strong>Supported:</strong> UPI, Credit/Debit Cards, Net
                        Banking, Wallets
                      </p>
                    </div>
                  )}

                  {paymentMethod === "CONTROPAY" && (
                    <div className="bg-[#2a2a2a] p-3 rounded-lg border border-[#444]">
                      <div className="flex items-center text-orange-400 mb-2">
                        <Bitcoin className="w-4 h-4 mr-2" />
                        Crypto Payment
                      </div>
                      <p className="text-xs text-gray-400">
                        <strong>Supported:</strong> USDT, BTC, ETH, BNB, LTC,
                        TRX, DAI on multiple networks
                      </p>
                      <p className="text-xs text-yellow-400 mt-1">
                        Note: Payment links expire after 10 minutes
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PhonePe Redirect Modal */}
      {showPhonepeRedirect && phonepePaymentUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Redirecting to PhonePe
              </h3>
              <p className="text-gray-400 mb-6">
                You will be redirected to PhonePe's secure payment gateway to
                complete your transaction.
              </p>

              <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#444] mb-6">
                <p className="text-sm text-gray-400 mb-2">
                  Transaction Details:
                </p>
                <p className="text-white font-medium">
                  Amount: ₹{finalTotal.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">
                  Transaction ID: {phonepeTransactionId}
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPhonepeRedirect(false)}
                  className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-500/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => window.open(phonepePaymentUrl, "_self")}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Continue to PhonePe
                </Button>
              </div>

              <div className="mt-4 p-3 bg-[#2a2a2a] rounded border border-[#444]">
                <div className="flex items-center text-green-400 mb-2">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-xs text-gray-400">
                  Your payment information is encrypted and secure. PhonePe
                  follows PCI DSS compliance standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contropay Crypto Redirect Modal */}
      {showContropayRedirect && contropayPaymentUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bitcoin className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {contropayPaymentOpened
                  ? "Complete Your Payment"
                  : "Crypto Payment"}
              </h3>
              <p className="text-gray-400 mb-6">
                {contropayPaymentOpened
                  ? "Complete your payment in the opened window, then click 'I've Completed Payment' below."
                  : "Click below to open Contropay's secure payment page in a new tab."}
              </p>

              <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#444] mb-6">
                <p className="text-sm text-gray-400 mb-2">
                  Transaction Details:
                </p>
                <p className="text-white font-medium">
                  Amount: ₹{finalTotal.toLocaleString()}
                  {contropayConfig && (
                    <span className="text-gray-400 text-sm ml-2">
                      (≈ ${(finalTotal * contropayConfig.inrUsdRate).toFixed(2)}{" "}
                      USD)
                    </span>
                  )}
                </p>
                <p className="text-orange-400 text-sm mt-1">
                  Paying with: {selectedToken} on{" "}
                  {contropayConfig?.chainDisplayNames[selectedChain] ||
                    selectedChain}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Payment ID: {contropayPaymentLinkId}
                </p>
              </div>

              {!contropayPaymentOpened ? (
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowContropayRedirect(false)}
                    className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-500/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      window.open(contropayPaymentUrl, "_blank");
                      setContropayPaymentOpened(true);
                    }}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Bitcoin className="w-4 h-4 mr-2" />
                    Open Payment Page
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={checkContropayPaymentStatus}
                    disabled={checkingContropayStatus}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {checkingContropayStatus ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Checking Payment Status...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        I've Completed Payment
                      </>
                    )}
                  </Button>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => window.open(contropayPaymentUrl, "_blank")}
                      className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-500/20"
                    >
                      Reopen Payment Page
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowContropayRedirect(false);
                        setContropayPaymentOpened(false);
                      }}
                      className="flex-1 border-red-500 text-red-400 hover:bg-red-500/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-[#2a2a2a] rounded border border-[#444]">
                <div className="flex items-center text-green-400 mb-2">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    Secure Crypto Payment
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {contropayPaymentOpened
                    ? "After completing payment, it may take a few moments for the blockchain to confirm. Click the button above to check status."
                    : "Your transaction is secured by blockchain technology. Payment links expire after 10 minutes."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
