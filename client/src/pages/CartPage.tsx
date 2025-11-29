import React, { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  Ticket,
  Loader2,
  X,
} from "lucide-react";
import { Link } from "wouter";
import axios from "axios";
import { buildApiUrl } from "@/lib/api.ts";

const CartPage = () => {
  const [, setLocation] = useLocation();
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } =
    useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Stock data state
  const [stockData, setStockData] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);

  // Authentication is now handled by ProtectedRoute wrapper

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Refetch stock data on demand
  const fetchStockData = useCallback(async () => {
    setStockLoading(true);
    try {
      const response = await axios.get(buildApiUrl("/api/stock-data"), {
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const contentType = response.headers["content-type"] || "";
      if (contentType.includes("application/json")) {
        const newData = response.data.data;
        setStockData(newData);
        return newData;
      }
    } catch (err: any) {
      console.error("Failed to fetch stock data:", err);
    } finally {
      setStockLoading(false);
    }
    return null;
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  // Helper function to resolve product type from category
  const resolveStockProductType = (category: string): "tshirt" | "hoodie" => {
    const categoryLower = category?.toLowerCase() || "";
    return categoryLower.includes("hoodie") ? "hoodie" : "tshirt";
  };

  // Helper function to get available stock for a size-color combination
  const getAvailableStockWithData = (item: any, data: any): number => {
    if (!data || !item.variants) return 0;

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

    const typeStock = data.types?.[productType]?.stock;
    if (typeStock && key in typeStock) {
      return typeStock[key]?.quantity || 0;
    }

    // Fallback to legacy stock map if types were not provided
    if (data.stock && key in data.stock) {
      return data.stock[key]?.quantity || 0;
    }

    return 0;
  };

  // Legacy wrapper for existing calls
  const getAvailableStock = (item: any): number => {
    return getAvailableStockWithData(item, stockData);
  };

  const handleQuantityChange = async (
    id: string | number,
    newQuantity: number
  ) => {
    try {
      if (newQuantity <= 0) {
        await removeItem(id);
        toast({
          title: "Item Removed",
          description: "Item has been removed from your cart.",
          variant: "destructive",
        });
        return;
      }

      // Find the cart item
      const cartItem = items.find((item) => String(item.id) === String(id));
      if (!cartItem) {
        toast({
          title: "Error",
          description: "Item not found in cart.",
          variant: "destructive",
        });
        return;
      }

      // Check stock availability for clothing items
      if (cartItem.variants) {
        const availableStock = getAvailableStock(cartItem);

        if (availableStock === 0) {
          toast({
            title: "Out of Stock",
            description:
              "This item is currently out of stock. Please remove it from your cart.",
            variant: "destructive",
          });
          return;
        }

        if (newQuantity > availableStock) {
          toast({
            title: "Limited Stock Available",
            description: `Only ${availableStock} available in stock. Maximum quantity set to ${availableStock}.`,
            variant: "destructive",
          });
          // Set quantity to available stock instead of rejecting
          newQuantity = availableStock;
        }
      }

      await updateQuantity(id, newQuantity);
      toast({
        title: "Quantity Updated",
        description: "Item quantity has been updated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (id: string | number, name: string) => {
    try {
      await removeItem(id);
      toast({
        title: "Item Removed",
        description: `${name} has been removed from your cart.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    // Fetch fresh stock data before verification
    setStockLoading(true);
    const freshStockData = await fetchStockData();

    if (!freshStockData) {
      toast({
        title: "Connection Error",
        description: "Could not verify stock. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Verify stock before proceeding
    let hasStockIssues = false;
    for (const item of items) {
      if (item.variants) {
        // Use fresh data for verification
        const availableStock = getAvailableStockWithData(item, freshStockData);
        if (availableStock === 0 || item.quantity > availableStock) {
          hasStockIssues = true;
          break;
        }
      }
    }

    if (hasStockIssues) {
      toast({
        title: "Stock Verification Failed",
        description:
          "Some items in your cart are out of stock or have insufficient quantity. Please remove or update them before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    setLocation("/checkout");
  };

  const shippingCost = total > 1000 ? 0 : 100;
  const subtotalAfterDiscount = total - couponDiscount;
  const finalTotal = subtotalAfterDiscount + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await axios.post(buildApiUrl("/api/coupons/validate"), {
        code: couponCode,
        userId: user?.id || null,
        cartItems: items.map((item) => ({
          productId: item.productId || item.id,
          price: parseFloat(item.price),
          quantity: item.quantity,
        })),
        cartTotal: total,
      });

      if (response.data.valid) {
        setAppliedCoupon(response.data.coupon);
        setCouponDiscount(response.data.coupon.discountAmount);
        // Save to localStorage for checkout page
        localStorage.setItem(
          "appliedCoupon",
          JSON.stringify(response.data.coupon)
        );
        localStorage.setItem(
          "couponDiscount",
          response.data.coupon.discountAmount.toString()
        );
        toast({
          title: "Coupon Applied!",
          description: response.data.message,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to apply coupon",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    // Remove from localStorage
    localStorage.removeItem("appliedCoupon");
    localStorage.removeItem("couponDiscount");
    toast({
      title: "Coupon Removed",
      description: "The coupon has been removed from your cart",
    });
  };

  // Authentication is now handled by ProtectedRoute wrapper

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#181818] text-white pt-28">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start
              shopping to see some amazing anime merchandise!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation("/products")}
                className="bg-accent hover:bg-accent/80 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="border-accent text-accent hover:bg-accent/20"
              >
                Go to Home
              </Button>
            </div>
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
              onClick={() => setLocation("/products")}
              className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-accent">Shopping Cart</h1>
              <p className="text-gray-400">
                {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleClearCart}
            className="border-accent text-accent bg-red-600 hover:bg-red-600/20 hover:text-accent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center text-accent">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart Items ({itemCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-[#2a2a2a] rounded-lg border border-[#333] hover:border-accent/30 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#444] flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23333'/%3E%3Ctext x='40' y='40' text-anchor='middle' dy='.3em' fill='%23666' font-size='10'%3EImage%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-white hover:text-accent transition-colors cursor-pointer">
                              <Link
                                href={`/product/${item.productId || item.id}`}
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-400">
                              {item.category}
                            </p>
                            {item.variants &&
                              Object.keys(item.variants).length > 0 && (
                                <div className="text-xs text-accent mt-1">
                                  {Object.entries(item.variants)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(", ")}
                                </div>
                              )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-accent">
                              {item.price}
                            </p>
                            <p className="text-sm text-gray-400">
                              {parseFloat(item.price.replace(/[^\d.]/g, "")) *
                                item.quantity}{" "}
                              total
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 p-0 border-[#444] text-gray-600 hover:bg-[#333]"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-12 text-center text-white font-medium">
                              {item.quantity}
                            </span>
                            {(() => {
                              const availableStock = item.variants
                                ? getAvailableStock(item)
                                : null;
                              const isAtMaxStock =
                                availableStock !== null &&
                                item.quantity >= availableStock;
                              return (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={isAtMaxStock}
                                  className={`w-8 h-8 p-0 border-[#444] ${
                                    isAtMaxStock
                                      ? "text-gray-500 cursor-not-allowed opacity-50"
                                      : "text-gray-600 hover:bg-[#333]"
                                  }`}
                                  title={
                                    isAtMaxStock
                                      ? `Only ${availableStock} available in stock`
                                      : "Increase quantity"
                                  }
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              );
                            })()}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            className="border-accent text-accent bg-red-600 hover:bg-red-600/20 hover:text-accent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {/* Stock warning for clothing items */}
                        {item.variants &&
                          (() => {
                            const availableStock = getAvailableStock(item);
                            if (
                              availableStock !== null &&
                              availableStock > 0 &&
                              item.quantity >= availableStock
                            ) {
                              return (
                                <div className="mt-2 text-xs text-orange-400 flex items-center">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Only {availableStock} available in stock
                                </div>
                              );
                            }
                            if (availableStock === 0) {
                              return (
                                <div className="mt-2 text-xs text-red-400 flex items-center">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Out of stock - Please remove from cart
                                </div>
                              );
                            }
                            return null;
                          })()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-[#1a1a1a] border-[#333] sticky top-32">
              <CardHeader>
                <CardTitle className="text-accent">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Subtotal ({itemCount} items)
                      </span>
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
                    {shippingCost > 0 && (
                      <div className="text-xs text-gray-500 bg-[#2a2a2a] p-2 rounded">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Add ₹{(1000 - total).toLocaleString()} more for free
                        shipping
                      </div>
                    )}

                    {/* Coupon Section */}
                    <div className="border-t border-[#333] pt-3">
                      <div className="space-y-2">
                        {appliedCoupon ? (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-2">
                                <Ticket className="w-4 h-4 text-green-500 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-green-500">
                                      {appliedCoupon.code}
                                    </span>
                                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                                      Applied
                                    </Badge>
                                  </div>
                                  {appliedCoupon.description && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {appliedCoupon.description}
                                    </p>
                                  )}
                                  <p className="text-sm font-medium text-green-500 mt-1">
                                    Saved ₹{couponDiscount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleRemoveCoupon}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Ticket className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">
                                Have a coupon code?
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Input
                                value={couponCode}
                                onChange={(e) =>
                                  setCouponCode(e.target.value.toUpperCase())
                                }
                                placeholder="Enter coupon code"
                                className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 uppercase"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleApplyCoupon();
                                  }
                                }}
                              />
                              <Button
                                onClick={handleApplyCoupon}
                                disabled={
                                  isValidatingCoupon || !couponCode.trim()
                                }
                                className="bg-accent hover:bg-accent/80 text-white"
                              >
                                {isValidatingCoupon ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Apply"
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Discount line */}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-500 flex items-center">
                          <Ticket className="w-4 h-4 mr-1" />
                          Coupon Discount
                        </span>
                        <span className="text-green-500 font-medium">
                          -₹{couponDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-[#333] pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-accent">
                          ₹{finalTotal.toLocaleString()}
                        </span>
                      </div>
                      {couponDiscount > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          You saved ₹{couponDiscount.toLocaleString()} with this
                          coupon!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-400">
                      <Truck className="w-4 h-4 mr-2 text-accent" />
                      Free shipping on orders over ₹1,000
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Shield className="w-4 h-4 mr-2 text-accent" />
                      Secure payment processing
                    </div>
                    <div className="flex items-center text-gray-400">
                      <CheckCircle className="w-4 h-4 mr-2 text-accent" />
                      30-day return policy
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || items.length === 0}
                    className="w-full bg-accent hover:bg-accent/80 text-white py-3 text-lg font-medium"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                  </Button>

                  {/* Continue Shopping */}
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/products")}
                    className="w-full border-accent text-accent hover:bg-accent/20"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
