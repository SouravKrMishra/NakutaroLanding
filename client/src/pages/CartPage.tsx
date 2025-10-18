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
import { Badge } from "@/components/ui/badge.tsx";
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
} from "lucide-react";
import { Link } from "wouter";

const CartPage = () => {
  const [, setLocation] = useLocation();
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Authentication is now handled by ProtectedRoute wrapper

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

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
      } else {
        await updateQuantity(id, newQuantity);
        toast({
          title: "Quantity Updated",
          description: "Item quantity has been updated.",
          variant: "default",
        });
      }
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

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }
    setIsCheckingOut(true);
    setLocation("/checkout");
  };

  const shippingCost = total > 1000 ? 0 : 100;
  const finalTotal = total + shippingCost;

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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 p-0 border-[#444] text-gray-600 hover:bg-[#333]"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
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
                    <div className="border-t border-[#333] pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-accent">
                          ₹{finalTotal.toLocaleString()}
                        </span>
                      </div>
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
