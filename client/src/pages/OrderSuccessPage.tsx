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
          `/api/orders/success/validate?${queryParams}`,
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
              const directResponse = await fetch(`/api/orders/${orderId}`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                credentials: "include",
              });

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
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#181818] to-[#1a1a1a] text-white pt-28 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Validating Your Order</h2>
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
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#181818] to-[#1a1a1a] text-white pt-28 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
          <p className="text-gray-400">Taking you to the right place...</p>
        </div>
      </div>
    );
  }

  // No order data state - show loading while redirecting
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#181818] to-[#1a1a1a] text-white pt-28 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
          <p className="text-gray-400">Taking you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#181818] to-[#1a1a1a] text-white pt-28">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative">
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
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/25 animate-bounce">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              {/* Floating sparkles */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-ping delay-300"></div>
              <div className="absolute top-1/2 -left-4 w-3 h-3 bg-pink-400 rounded-full animate-ping delay-700"></div>
            </div>

            {/* Success Message */}
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Payment Successful! 🎉
            </h1>
            <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
              Thank you for your purchase! Your order has been confirmed and is
              being processed.
            </p>
            <div className="flex items-center justify-center gap-2 text-green-400">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">
                Order #{orderData.orderNumber}
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
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-green-500/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#444]">
                  <span className="text-gray-300">Order Number</span>
                  <span className="text-white font-mono text-sm bg-[#333] px-2 py-1 rounded">
                    #{orderData.orderNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#444]">
                  <span className="text-gray-300">Payment Method</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {orderData.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#444]">
                  <span className="text-gray-300">Status</span>
                  <span className="text-green-400 font-medium">
                    {orderData.status === "PAID" ||
                    orderData.status === "CONFIRMED"
                      ? "Confirmed"
                      : orderData.status}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#444]">
                  <span className="text-gray-300">Total Amount</span>
                  <span className="text-white font-semibold">
                    ₹{orderData.total.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information Card */}
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-blue-500/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#444]">
                  <span className="text-gray-300">Estimated Delivery</span>
                  <span className="text-white font-medium">
                    {new Date(orderData.estimatedDelivery).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#444]">
                  <span className="text-gray-300">Delivery Address</span>
                  <span className="text-blue-400 text-sm text-right max-w-[200px]">
                    {orderData.shippingInfo.address},{" "}
                    {orderData.shippingInfo.city}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#444]">
                  <span className="text-gray-300">Confirmation Email</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Sent to {orderData.shippingInfo.email}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ordered Items */}
          <Card
            className={`bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] mb-8 transition-all duration-1000 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Ordered Items ({orderData.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-[#2a2a2a]/50 rounded-lg border border-[#444]"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.category}</p>
                      <p className="text-gray-300 text-sm">
                        Quantity: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        ₹
                        {(
                          parseFloat(item.price.replace(/[^\d.]/g, "")) *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-[#444] pt-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-300">Subtotal:</span>
                    <span className="text-white font-semibold">
                      ₹{orderData.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {orderData.shippingCost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Shipping:</span>
                      <span className="text-white">
                        ₹{orderData.shippingCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-bold border-t border-[#444] pt-2 mt-2">
                    <span className="text-white">Total:</span>
                    <span className="text-green-400">
                      ₹{orderData.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card
            className={`bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] mb-8 transition-all duration-1000 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Step 1 - Completed */}
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">
                        Order Confirmed
                      </h3>
                      <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Your payment has been processed and your order is
                      confirmed.
                    </p>
                    <div className="text-xs text-gray-500 mt-1">Just now</div>
                  </div>
                </div>

                {/* Connecting Line */}
                <div className="ml-4 w-0.5 h-6 bg-gradient-to-b from-green-500 to-blue-500"></div>

                {/* Step 2 - In Progress */}
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">
                        Order Processing
                      </h3>
                      <span className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded-full">
                        In Progress
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      We're preparing your items for shipment. This usually
                      takes 1-2 business days.
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      Expected: Today
                    </div>
                  </div>
                </div>

                {/* Connecting Line */}
                <div className="ml-4 w-0.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500"></div>

                {/* Step 3 - Pending */}
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Truck className="w-5 h-5 text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">Shipped</h3>
                      <span className="text-gray-400 text-xs bg-gray-500/20 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Your order will be shipped and you'll receive tracking
                      information via email.
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      Expected: 1-2 days
                    </div>
                  </div>
                </div>

                {/* Connecting Line */}
                <div className="ml-4 w-0.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500"></div>

                {/* Step 4 - Pending */}
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5 text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">Delivered</h3>
                      <span className="text-gray-400 text-xs bg-gray-500/20 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Your package will be delivered to your doorstep within 3-5
                      business days.
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      Expected: 3-5 days
                    </div>
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
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={() => setLocation("/products")}
              variant="outline"
              className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500/20 px-8 py-3 text-lg font-semibold transition-all duration-300"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Special Offers & Support */}
          <div
            className={`grid md:grid-cols-2 gap-6 mb-8 transition-all duration-1000 delay-900 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Special Offer Card */}
            <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-yellow-400 font-semibold mb-2">
                  Special Offer!
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get 15% off your next order with code{" "}
                  <span className="bg-yellow-500/20 px-2 py-1 rounded text-yellow-300 font-mono">
                    WELCOME15
                  </span>
                </p>
                <Button
                  onClick={() => setLocation("/products")}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-sm"
                >
                  Shop Now
                </Button>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-blue-400 font-semibold mb-2">Need Help?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Our support team is here to help with any questions about your
                  order.
                </p>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/20 text-sm"
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
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
              <h3 className="text-green-400 font-semibold text-lg mb-2">
                Thank You for Choosing Us!
              </h3>
              <p className="text-gray-300 text-sm max-w-md mx-auto">
                We're committed to providing you with the best shopping
                experience. Your satisfaction is our priority!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
