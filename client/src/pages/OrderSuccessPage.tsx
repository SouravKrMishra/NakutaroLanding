import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  CheckCircle,
  Check,
  Package,
  Truck,
  Mail,
  ArrowRight,
  Home,
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  Star,
  Gift,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "@/lib/CartContext.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import { useAuth } from "@/lib/AuthContext.tsx";

interface OrderData {
  id: string;
  orderNumber: string;
  items: Array<{
    productId: number;
    name: string;
    price: string;
    quantity: number;
    image: string;
    category: string;
    size?: string;
    color?: string;
  }>;
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
  estimatedDelivery: string;
}

const OrderSuccessPage = () => {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const { clearCart } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Validate order and get order data
  useEffect(() => {
    const validateOrder = async () => {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setError("Order validation timed out. Please try again.");
        setIsLoading(false);
      }, 10000); // 10 second timeout

      try {
        setIsLoading(true);
        setError(null);

        // Check if user is authenticated
        if (!isAuthenticated) {
          clearTimeout(timeoutId);
          setError("Authentication required");
          return;
        }

        // Get order/transaction ID from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get("orderId");
        const transactionId =
          urlParams.get("transactionId") ||
          (() => {
            const phonepeTransaction = localStorage.getItem(
              "phonepe_transaction"
            );
            if (phonepeTransaction) {
              try {
                const parsed = JSON.parse(phonepeTransaction);
                return parsed.transactionId;
              } catch {
                return null;
              }
            }
            return null;
          })();

        if (!orderId && !transactionId) {
          setError("No valid order or transaction found");
          return;
        }

        // Validate order with backend
        const token = localStorage.getItem("authToken");
        const queryParams = new URLSearchParams();
        if (orderId) queryParams.append("orderId", orderId);
        if (transactionId) queryParams.append("transactionId", transactionId);

        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || ""
          }/api/orders/success/validate?${queryParams}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();

          // For test orders, try to get order data directly from orders API
          if (orderId && window.location.search.includes("test=true")) {
            try {
              const directResponse = await fetch(
                `${
                  import.meta.env.VITE_API_BASE_URL || ""
                }/api/orders/${orderId}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                }
              );

              if (directResponse.ok) {
                const directData = await directResponse.json();
                setOrderData(directData.order);
                setHasValidated(true);

                // Set loading to false AFTER orderData is set with a small delay
                clearTimeout(timeoutId);
                setTimeout(() => {
                  setIsLoading(false);
                  // Trigger animation after successful validation
                  setTimeout(() => setIsVisible(true), 100);
                }, 50);
                return; // Exit early if successful
              }
            } catch (directError) {}
          }

          throw new Error(errorData.message || "Failed to validate order");
        }

        const data = await response.json();
        setOrderData(data.order);
        setHasValidated(true);

        // Clear cart and localStorage after successful validation
        try {
          await clearCart();
          localStorage.removeItem("phonepe_transaction");
        } catch (cartError) {}

        // Clear timeout on success
        clearTimeout(timeoutId);

        // Set loading to false AFTER orderData is set with a small delay
        // to ensure state updates have time to propagate
        setTimeout(() => {
          setIsLoading(false);
          // Trigger animation after successful validation
          setTimeout(() => setIsVisible(true), 100);
        }, 50);
      } catch (error: any) {
        clearTimeout(timeoutId);
        setError(error.message || "Failed to validate order");
        setIsLoading(false);
      }
    };

    validateOrder();
  }, [isAuthenticated]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Handle redirects for errors and invalid states
  useEffect(() => {
    if (error) {
      if (error === "Authentication required") {
        setLocation("/login");
      } else {
        // For other errors (no valid order, expired access, etc.), redirect to dashboard
        setLocation("/dashboard");
      }
    } else if (!isLoading && !orderData && hasValidated) {
      // Redirect to dashboard if no order data after loading is complete AND validation has been attempted
      setLocation("/dashboard");
    }
  }, [error, isLoading, orderData, hasValidated, setLocation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white pt-28 flex items-center justify-center relative overflow-hidden">
        <div className="bg-grid-pattern absolute inset-0 opacity-20 pointer-events-none"></div>
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">
            Validating Your Order
          </h2>
          <p className="text-gray-400">
            Please wait while we verify your payment...
          </p>
        </div>
      </div>
    );
  }

  // Error state - show loading while redirecting
  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] text-white pt-28 flex items-center justify-center relative overflow-hidden">
        <div className="bg-grid-pattern absolute inset-0 opacity-20 pointer-events-none"></div>
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">
            Redirecting...
          </h2>
          <p className="text-gray-400">Taking you to the right place...</p>
        </div>
      </div>
    );
  }

  // No order data state - show loading while redirecting
  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#121212] text-white pt-28 flex items-center justify-center relative overflow-hidden">
        <div className="bg-grid-pattern absolute inset-0 opacity-20 pointer-events-none"></div>
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">
            Redirecting...
          </h2>
          <p className="text-gray-400">Taking you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white pt-28 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="bg-grid-pattern absolute inset-0 opacity-10 pointer-events-none z-0"></div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Animated Success Icon */}
            <div className="relative mb-8 flex justify-center">
              <div className="absolute w-40 h-40 bg-accent/25 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative w-28 h-28 bg-gradient-to-br from-[#ff5858] via-[#d72323] to-[#8b0e0e] rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(255,88,88,0.45)] ring-4 ring-[#ff5858]/20">
                <Check className="w-14 h-14 text-white" strokeWidth={3.5} />
                <div className="absolute inset-0 rounded-full border border-white/10"></div>
              </div>
              {/* Floating sparkles */}
              <div className="absolute -top-2 -right-10 w-6 h-6 bg-white/30 rounded-full animate-ping"></div>
              <div className="absolute top-1/2 -left-8 w-3 h-3 bg-accent rounded-full animate-ping delay-500"></div>
            </div>

            {/* Success Message */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              Payment Successful! 🎉
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-6"></div>
            <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed font-light">
              Thank you for your purchase! Your order has been confirmed and is
              being processed.
            </p>
            <div className="flex items-center justify-center gap-2 text-accent">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium tracking-wider">
                ORDER #{orderData.orderNumber}
              </span>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Order Details Grid */}
          <div
            className={`grid md:grid-cols-2 gap-6 mb-8 transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Order Summary Card */}
            <Card className="bg-[#181818] border-[#333] hover:border-accent transition-all duration-300 shadow-lg hover:shadow-accent/10">
              <CardHeader className="pb-4 border-b border-[#2a2a2a]">
                <CardTitle className="text-accent flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#333]">
                  <span className="text-gray-400 text-sm">Order Number</span>
                  <span className="text-white font-mono text-sm bg-[#121212] px-2 py-1 rounded border border-[#333]">
                    #{orderData.orderNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#333]">
                  <span className="text-gray-400 text-sm">Payment Method</span>
                  <span className="text-accent flex items-center gap-1 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {orderData.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#333]">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className="text-green-400 font-medium text-sm bg-green-400/10 px-2 py-1 rounded">
                    {orderData.status === "PAID" ||
                    orderData.status === "CONFIRMED"
                      ? "Confirmed"
                      : orderData.status}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#333]">
                  <span className="text-gray-400 text-sm">Total Amount</span>
                  <span className="text-white font-bold">
                    ₹{orderData.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information Card */}
            <Card className="bg-[#181818] border-[#333] hover:border-white/30 transition-all duration-300 shadow-lg">
              <CardHeader className="pb-4 border-b border-[#2a2a2a]">
                <CardTitle className="text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-accent" />
                  Delivery Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#333]">
                  <span className="text-gray-400 text-sm">
                    Estimated Delivery
                  </span>
                  <span className="text-white font-medium text-sm">
                    {new Date(orderData.estimatedDelivery).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#333]">
                  <span className="text-gray-400 text-sm">
                    Delivery Address
                  </span>
                  <span
                    className="text-gray-200 text-sm text-right max-w-[200px] line-clamp-2"
                    title={`${orderData.shippingInfo.address}, ${orderData.shippingInfo.city}`}
                  >
                    {orderData.shippingInfo.address},{" "}
                    {orderData.shippingInfo.city}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#333]">
                  <span className="text-gray-400 text-sm">
                    Confirmation Email
                  </span>
                  <div className="text-right">
                    <div className="text-accent flex items-center justify-end gap-1 text-sm">
                      <Mail className="w-3 h-3" />
                      Sent
                    </div>
                    <span className="text-xs text-gray-500 truncate max-w-[150px] block">
                      {orderData.shippingInfo.email}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ordered Items */}
          <Card
            className={`bg-[#181818] border-[#333] mb-8 transition-all duration-1000 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <CardHeader className="border-b border-[#2a2a2a]">
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                Ordered Items ({orderData.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-[#2a2a2a]/50 rounded-lg border border-[#333] hover:border-accent/30 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#121212] border border-[#333] flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate mb-1">
                        {item.name}
                      </h3>
                      <p className="text-accent text-xs font-medium mb-2">
                        {item.category}
                      </p>

                      {/* Size and Color Details */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.size && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#121212] border border-[#333] text-gray-300">
                            Size:
                            <span className="ml-1 text-white font-semibold">
                              {item.size}
                            </span>
                          </span>
                        )}
                        {item.color && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#121212] border border-[#333] text-gray-300">
                            Color:
                            <span className="ml-1 text-white font-semibold capitalize">
                              {item.color}
                            </span>
                          </span>
                        )}
                      </div>

                      <p className="text-gray-400 text-xs">
                        Qty: {item.quantity} × ₹
                        {parseFloat(
                          item.price.replace(/[^\d.]/g, "")
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold">
                        ₹
                        {(
                          parseFloat(item.price.replace(/[^\d.]/g, "")) *
                          item.quantity
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="border-t border-[#2a2a2a] pt-4 mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-gray-200 font-medium">
                      ₹{orderData.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {orderData.shippingCost > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Shipping:</span>
                      <span className="text-gray-200 font-medium">
                        ₹{orderData.shippingCost.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold border-t border-[#2a2a2a] pt-3 mt-2">
                    <span className="text-white">Total:</span>
                    <span className="text-accent">
                      ₹{orderData.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card
            className={`bg-[#181818] border-[#333] mb-8 transition-all duration-1000 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <CardHeader className="border-b border-[#2a2a2a]">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-[#333] z-0"></div>

                {/* Step 1 - Completed */}
                <div className="flex items-start space-x-4 relative z-10 pb-8">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20 border-4 border-[#181818]">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-bold text-lg">
                        Order Confirmed
                      </h3>
                      <span className="text-white text-[10px] font-bold bg-accent px-2 py-0.5 rounded uppercase tracking-wider">
                        Completed
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Your payment has been processed and your order is
                      confirmed.
                    </p>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      Just now
                    </div>
                  </div>
                </div>

                {/* Step 2 - In Progress */}
                <div className="flex items-start space-x-4 relative z-10 pb-8">
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center flex-shrink-0 border-4 border-[#181818]">
                    <Package className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-gray-200 font-semibold text-lg">
                        Order Processing
                      </h3>
                      <span className="text-accent text-[10px] font-bold bg-accent/10 border border-accent/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        In Progress
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      We're preparing your items for shipment.
                    </p>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      Expected: Today
                    </div>
                  </div>
                </div>

                {/* Step 3 - Pending */}
                <div className="flex items-start space-x-4 relative z-10 pb-8">
                  <div className="w-10 h-10 bg-[#121212] rounded-full flex items-center justify-center flex-shrink-0 border border-[#333]">
                    <Truck className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-500 font-medium text-lg">
                        Shipped
                      </h3>
                      <span className="text-gray-600 text-[10px] font-bold bg-[#2a2a2a] px-2 py-0.5 rounded uppercase tracking-wider">
                        Pending
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Your order will be shipped shortly.
                    </p>
                  </div>
                </div>

                {/* Step 4 - Pending */}
                <div className="flex items-start space-x-4 relative z-10">
                  <div className="w-10 h-10 bg-[#121212] rounded-full flex items-center justify-center flex-shrink-0 border border-[#333]">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-500 font-medium text-lg">
                        Delivered
                      </h3>
                      <span className="text-gray-600 text-[10px] font-bold bg-[#2a2a2a] px-2 py-0.5 rounded uppercase tracking-wider">
                        Pending
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Estimated arrival in 3-5 business days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 transition-all duration-1000 delay-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Button
              onClick={() => setLocation("/")}
              className="bg-accent hover:bg-accent-dark text-white px-8 py-6 text-lg font-bold shadow-lg shadow-accent/20 transition-all duration-300 rounded-lg flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
            <Button
              onClick={() => setLocation("/products")}
              variant="outline"
              className="bg-transparent border-2 border-[#333] text-white hover:bg-[#222] hover:border-gray-500 px-8 py-6 text-lg font-bold transition-all duration-300 rounded-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Button>
          </div>

          {/* Support Card */}
          <div
            className={`grid md:grid-cols-1 gap-6 mb-8 transition-all duration-1000 delay-900 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Card className="bg-gradient-to-r from-[#1a1a1a] to-[#121212] border-[#333] hover:border-[#444] transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#333]">
                  <Phone className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">
                  Need Help with your Order?
                </h3>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                  Our support team is here to help. Reference your Order #
                  {orderData.orderNumber} when contacting us.
                </p>
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-600 text-white hover:bg-gray-800 hover:text-white"
                  onClick={() => setLocation("/contact")}
                >
                  Contact Support
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Customer Satisfaction */}
          <div
            className={`text-center transition-all duration-1000 delay-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">
                Thank you for shopping with Anime India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
