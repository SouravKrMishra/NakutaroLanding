import React, { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/lib/CartContext.tsx";
import { useAuth } from "@/lib/AuthContext.tsx";
import { useToast } from "@/hooks/use-toast.ts";
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
} from "lucide-react";

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

  // Fetch user details from database and pre-fill form
  React.useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/auth/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

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
        console.error("Error fetching user details:", error);
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

  const shippingCost = total > 1000 ? 0 : 100;
  const finalTotal = total + shippingCost + 2; // Add PhonePe processing fee

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

  // Initialize PhonePe payment
  const initializePhonepePayment = async () => {
    if (!validateShipping()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping fields.",
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
      const orderItems = items.map((item) => ({
        productId:
          typeof item.id === "string" && item.id.includes("_")
            ? parseInt(item.id.split("_")[0]) // Extract numeric product ID from variant-based ID
            : typeof item.id === "number"
            ? item.id
            : parseInt(item.id.toString()), // Fallback for other string formats
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
      }));

      // First, create the order
      const orderData = {
        items: orderItems,
        shippingInfo,
        paymentMethod: "PHONEPE",
        subtotal: total,
        shippingCost,
        total: finalTotal,
        merchantTransactionId,
      };

      const token = localStorage.getItem("authToken");

      // Create order first
      const orderResponse = await fetch("/api/orders/phonepe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const orderResult = await orderResponse.json();

      // Then initiate PhonePe payment
      const paymentResponse = await fetch("/api/payments/phonepe/initiate", {
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
      });

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
                  {/* Items */}
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-400">
                          {item.name} (x{item.quantity})
                        </span>
                        <span className="text-white">
                          ₹
                          {(
                            parseFloat(item.price.replace(/[^\d.]/g, "")) *
                            item.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-[#333] pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>
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
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Processing Fee</span>
                      <span className="text-white">₹2</span>
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

                  {/* Security Notice */}
                  <div className="bg-[#2a2a2a] p-3 rounded-lg border border-[#444]">
                    <div className="flex items-center text-green-400 mb-2">
                      <Shield className="w-4 h-4 mr-2" />
                      Secure Checkout
                    </div>
                    <p className="text-xs text-gray-400">
                      Your payment information is encrypted and secure. We never
                      store your card details.
                    </p>
                  </div>

                  {/* PhonePe Payment Button */}
                  <Button
                    onClick={initializePhonepePayment}
                    disabled={isProcessing}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Smartphone className="w-5 h-5 mr-2" />
                        Pay with PhonePe
                      </div>
                    )}
                  </Button>

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
    </div>
  );
};

export default CheckoutPage;
