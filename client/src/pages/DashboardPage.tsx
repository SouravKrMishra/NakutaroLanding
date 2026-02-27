import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useAuth } from "@/lib/AuthContext.tsx";
import { useWishlist } from "@/lib/WishlistContext.tsx";
import { useCart } from "@/lib/CartContext.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import { Link } from "wouter";
import axios from "axios";
import { buildApiUrl } from "@/lib/api.ts";
import {
  BarChart3,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  ArrowLeft,
  Building2,
  Heart,
  Plus,
  Trash2,
  ShoppingCart,
  Star,
  ArrowRight,
} from "lucide-react";

const DashboardPage = () => {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addItem: addToCart } = useCart();
  const {
    wishlistItems,
    removeFromWishlist,
    loading: wishlistLoading,
  } = useWishlist();
  // Get userType - check both user.userType and fallback to checking if it's not business
  const userType = (user?.userType || "").toLowerCase();
  // If userType is explicitly "individual", use that. Otherwise, if userType is missing or empty,
  // check if user has business fields - if not, treat as individual
  const isIndividual =
    userType === "individual" ||
    (!userType && user && !user.companyName && !user.businessType);

  const analyticsTitle = isIndividual
    ? "Shopping Insights"
    : "Inventory Analytics";
  const analyticsDescription = isIndividual
    ? "Monitor your personal spend and shopping patterns"
    : "Track your anime figure inventory and performance";

  const formatOrderStatus = (status: string) => {
    const labels: Record<string, string> = {
      ORDER_REQUESTED: "Order Requested",
      PENDING_PAYMENT: "Pending Payment",
      ORDER_SUCCESS: "Confirmed",
      ORDER_FAILED: "Failed",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status.replace(/_/g, " ");
  };

  // State for recommendations
  const [productRecommendations, setProductRecommendations] = React.useState<
    any[]
  >([]);
  const [recommendationsLoading, setRecommendationsLoading] =
    React.useState(true);
  const [recommendationsError, setRecommendationsError] = React.useState<
    string | null
  >(null);

  // State for recent orders
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(true);
  const [ordersError, setOrdersError] = React.useState<string | null>(null);

  // State for order analytics
  const [orderAnalytics, setOrderAnalytics] = React.useState<any>({
    monthlySpending: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    customerSince: null,
    loyaltyTier: isIndividual ? "" : "Bronze",
    nextOrderDue: null,
    recommendedItems: "",
    monthlyChange: 0,
    monthsSinceFirstOrder: 0,
  });
  const [analyticsLoading, setAnalyticsLoading] = React.useState(true);
  const [analyticsError, setAnalyticsError] = React.useState<string | null>(
    null
  );

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Fetch recommendations
  React.useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;

      setRecommendationsLoading(true);
      setRecommendationsError(null);

      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(buildApiUrl("/api/recommendations"), {
          params: { limit: 6 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setProductRecommendations(response.data.recommendations || []);
      } catch (error) {
        setRecommendationsError("Failed to load recommendations");
        // Fallback to empty array
        setProductRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // Fetch recent orders and calculate analytics
  React.useEffect(() => {
    const fetchOrdersAndAnalytics = async () => {
      if (!user) return;

      // Determine user type for this effect
      const currentUserType = (user?.userType || "").toLowerCase();
      const isIndividualUser =
        currentUserType === "individual" ||
        (!currentUserType && !user.companyName && !user.businessType);

      setOrdersLoading(true);
      setAnalyticsLoading(true);
      setOrdersError(null);
      setAnalyticsError(null);

      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(buildApiUrl("/api/orders"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        const orders = response.data.orders || [];

        // Helper function to check if an order is completed/paid (not pending or failed)
        const isOrderCompleted = (order: any): boolean => {
          const status = order.status || "";
          const paymentStatus = order.paymentStatus?.toUpperCase() || "";

          if (status === "CANCELLED" || status === "ORDER_FAILED") {
            return false;
          }
          if (paymentStatus === "PENDING" || paymentStatus === "FAILED") {
            return false;
          }
          if (
            status === "ORDER_REQUESTED" ||
            status === "PENDING_PAYMENT"
          ) {
            return false;
          }
          return (
            paymentStatus === "COMPLETED" ||
            status === "ORDER_SUCCESS" ||
            status === "PROCESSING" ||
            status === "SHIPPED" ||
            status === "DELIVERED"
          );
        };

        // Filter out pending/failed orders for analytics
        const completedOrders = orders.filter(isOrderCompleted);

        // All orders for display – raw status (e.g. PROCESSING) so badge/filter comparisons work
        const recentOrdersData = orders.map((order: any) => ({
          id: order.orderNumber,
          customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
          amount: `₹${order.total.toLocaleString()}`,
          status: order.status,
          date: new Date(order.orderDate).toLocaleDateString(),
          items: order.items
            .map((item: any) => `${item.quantity}x ${item.name}`)
            .join(", "),
        }));

        setRecentOrders(recentOrdersData);

        // Calculate analytics using only completed orders
        if (completedOrders.length > 0) {
          const totalSpent = completedOrders.reduce(
            (sum: number, order: any) => sum + order.total,
            0
          );
          const averageOrderValue = totalSpent / completedOrders.length;

          // Calculate monthly spending (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const recentOrders = completedOrders.filter(
            (order: any) => new Date(order.orderDate) >= thirtyDaysAgo
          );
          const monthlySpending = recentOrders.reduce(
            (sum: number, order: any) => sum + order.total,
            0
          );

          // Calculate previous month spending (30-60 days ago)
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
          const previousMonthOrders = completedOrders.filter(
            (order: any) =>
              new Date(order.orderDate) >= sixtyDaysAgo &&
              new Date(order.orderDate) < thirtyDaysAgo
          );
          const previousMonthSpending = previousMonthOrders.reduce(
            (sum: number, order: any) => sum + order.total,
            0
          );

          // Calculate percentage change
          let monthlyChange = 0;
          if (previousMonthSpending > 0) {
            monthlyChange =
              ((monthlySpending - previousMonthSpending) /
                previousMonthSpending) *
              100;
          } else if (monthlySpending > 0) {
            monthlyChange = 100; // New spending
          }

          // Find customer since date (earliest completed order)
          const earliestOrder = completedOrders.reduce(
            (earliest: any, order: any) =>
              new Date(order.orderDate) < new Date(earliest.orderDate)
                ? order
                : earliest
          );

          // Calculate months since first order
          const firstOrderDate = new Date(earliestOrder.orderDate);
          const currentDate = new Date();
          const monthsSinceFirstOrder = Math.floor(
            (currentDate.getFullYear() - firstOrderDate.getFullYear()) * 12 +
              (currentDate.getMonth() - firstOrderDate.getMonth())
          );

          // Determine loyalty tier based on total spent (only for business users)
          let loyaltyTier = "Bronze";
          if (!isIndividualUser) {
            if (totalSpent >= 1000000) loyaltyTier = "Diamond";
            else if (totalSpent >= 500000) loyaltyTier = "Platinum";
            else if (totalSpent >= 200000) loyaltyTier = "Gold";
            else if (totalSpent >= 50000) loyaltyTier = "Silver";
          }

          // Calculate next order due (based on average order frequency)
          const orderDates = completedOrders
            .map((order: any) => new Date(order.orderDate))
            .sort((a: Date, b: Date) => b.getTime() - a.getTime());
          let nextOrderDue = null;
          if (orderDates.length >= 2) {
            const avgDaysBetweenOrders =
              (orderDates[0].getTime() -
                orderDates[orderDates.length - 1].getTime()) /
              (1000 * 60 * 60 * 24) /
              (orderDates.length - 1);
            const nextOrderDate = new Date(orderDates[0]);
            nextOrderDate.setDate(
              nextOrderDate.getDate() + avgDaysBetweenOrders
            );
            nextOrderDue = nextOrderDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }

          // Get most ordered items for recommendation (from completed orders only)
          const itemCounts: { [key: string]: number } = {};
          completedOrders.forEach((order: any) => {
            order.items.forEach((item: any) => {
              const key = item.name;
              itemCounts[key] = (itemCounts[key] || 0) + item.quantity;
            });
          });

          const topItems = Object.entries(itemCounts)
            .sort((entry1, entry2) => entry2[1] - entry1[1])
            .slice(0, 2)
            .map(([name, count]) => `${count}x ${name}`)
            .join(", ");

          setOrderAnalytics({
            monthlySpending: Math.round(monthlySpending),
            totalOrders: completedOrders.length,
            averageOrderValue: Math.round(averageOrderValue),
            customerSince: new Date(earliestOrder.orderDate).toLocaleDateString(
              "en-US",
              { month: "long", year: "numeric" }
            ),
            loyaltyTier,
            nextOrderDue,
            recommendedItems: topItems || "No recommendations yet",
            monthlyChange: Math.round(monthlyChange),
            monthsSinceFirstOrder,
          });
        } else {
          // Set default values for new customers
          setOrderAnalytics({
            monthlySpending: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            customerSince: "New Customer",
            loyaltyTier: isIndividualUser ? "" : "Bronze",
            nextOrderDue: null,
            recommendedItems: "Start shopping to get recommendations",
            monthlyChange: 0,
            monthsSinceFirstOrder: 0,
          });
        }
      } catch (error) {
        setOrdersError("Failed to load recent orders");
        setAnalyticsError("Failed to load analytics");
        // Fallback to empty arrays
        setRecentOrders([]);
        // Determine user type for error fallback
        const errorUserType = (user?.userType || "").toLowerCase();
        const isIndividualError =
          errorUserType === "individual" ||
          (!errorUserType && !user.companyName && !user.businessType);
        setOrderAnalytics({
          monthlySpending: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          customerSince: "Unknown",
          loyaltyTier: isIndividualError ? "" : "Bronze",
          nextOrderDue: null,
          recommendedItems: "Unable to load recommendations",
          monthlyChange: 0,
          monthsSinceFirstOrder: 0,
        });
      } finally {
        setOrdersLoading(false);
        setAnalyticsLoading(false);
      }
    };

    fetchOrdersAndAnalytics();
  }, [user]);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const handleMoveToCart = async (item: any) => {
    if (!item?.inStock) {
      toast({
        title: "Out of stock",
        description: "This item is currently unavailable.",
        variant: "destructive",
      });
      return;
    }
    if (!isAuthenticated || !user) {
      toast({
        title: "Login required",
        description: (
          <span>
            Please{" "}
            <button
              type="button"
              onClick={() => setLocation("/login/individual")}
              className="underline underline-offset-2 hover:text-white hover:bg-white/20 hover:px-1.5 hover:py-0.5 hover:rounded transition-all duration-200 cursor-pointer font-medium"
            >
              log in
            </button>{" "}
            to add items to your cart.
          </span>
        ),
        variant: "destructive",
      });
      return;
    }
    const isClothingItem = ["T-Shirts", "Hoodies", "Sweatshirt"].includes(
      item.category || ""
    );
    if (isClothingItem) {
      toast({
        title: "Size selection required",
        description: "Please choose a size on the product page.",
        variant: "default",
      });
      setLocation(`/product/${(item as { slug?: string }).slug || item.id}`);
      return;
    }
    try {
      const priceStr =
        typeof item.price === "string"
          ? item.price
          : `₹${Number(item.price || 0).toLocaleString()}`;
      await addToCart(
        {
          id: String(item.id),
          productId: item.id,
          slug: (item as { slug?: string }).slug ?? null,
          productSlug: (item as { slug?: string }).slug ?? null,
          name: item.name,
          price: priceStr,
          image: item.image || "",
          category: item.category || "",
          inStock: Boolean(item.inStock),
        },
        1
      );
      await removeFromWishlist(item.id);
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart and removed from your wishlist.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddRecommendationToCart = async (product: any) => {
    if (!product?.inStock) {
      toast({
        title: "Out of stock",
        description: "This item is currently unavailable.",
        variant: "destructive",
      });
      return;
    }
    if (!isAuthenticated || !user) {
      toast({
        title: "Login required",
        description: (
          <span>
            Please{" "}
            <button
              type="button"
              onClick={() => setLocation("/login/individual")}
              className="underline underline-offset-2 hover:text-white hover:bg-white/20 hover:px-1.5 hover:py-0.5 hover:rounded transition-all duration-200 cursor-pointer font-medium"
            >
              log in
            </button>{" "}
            to add items to your cart.
          </span>
        ),
        variant: "destructive",
      });
      return;
    }
    const isClothingItem = ["T-Shirts", "Hoodies", "Sweatshirt"].includes(
      product.category || ""
    );
    if (isClothingItem) {
      toast({
        title: "Size selection required",
        description: "Please choose a size on the product page.",
        variant: "default",
      });
      setLocation(`/product/${product.slug || product.id}`);
      return;
    }
    try {
      const priceStr =
        typeof product.price === "string"
          ? product.price
          : `₹${Number(product.price || 0).toLocaleString()}`;
      await addToCart(
        {
          id: String(product.id),
          productId: product.id,
          slug: product.slug ?? null,
          productSlug: product.slug ?? null,
          name: product.name,
          price: priceStr,
          image: product.image || "",
          category: product.category || "",
          inStock: Boolean(product.inStock),
        },
        1
      );
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addPurchaseToHistory = async (productData: {
    productId: number;
    productName: string;
    category: string;
    series: string;
    quantity: number;
    price: number;
    totalAmount: number;
  }) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(buildApiUrl("/api/purchase-history"), productData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
    } catch (error) {}
  };

  // Only calculate stats for business users (they're only displayed for business users)
  const stats = !isIndividual
    ? [
        {
          title: "Total Orders",
          value: orderAnalytics.totalOrders.toString(),
          change: orderAnalytics.totalOrders > 0 ? "+12%" : "0%",
          icon: <Package className="w-6 h-6" />,
          color: "text-accent",
        },
        {
          title: "Monthly Spending",
          value: `₹${orderAnalytics.monthlySpending.toLocaleString()}`,
          change:
            orderAnalytics.monthlyChange >= 0
              ? `+${orderAnalytics.monthlyChange}%`
              : `${orderAnalytics.monthlyChange}%`,
          icon: <DollarSign className="w-6 h-6" />,
          color:
            orderAnalytics.monthlyChange >= 0
              ? "text-green-400"
              : "text-red-400",
        },
        {
          title: "Average Order Value",
          value: `₹${orderAnalytics.averageOrderValue.toLocaleString()}`,
          change: orderAnalytics.averageOrderValue > 0 ? "+5%" : "0%",
          icon: <DollarSign className="w-6 h-6" />,
          color: "text-purple-400",
        },
        {
          title: "Loyalty Tier",
          value: orderAnalytics.loyaltyTier,
          change: "Current",
          icon: <TrendingUp className="w-6 h-6" />,
          color: "text-orange-400",
        },
      ]
    : [];

  const headerTitle = isIndividual ? "Your Dashboard" : "Business Dashboard";
  const headerSubtitle = isIndividual
    ? `Welcome back, ${user?.name || "guest"}`
    : `Welcome back, ${user?.name || "guest"}${
        user?.companyName ? ` from ${user.companyName}` : ""
      }`;
  const backLabel = isIndividual ? "Back to Home" : "Back to Business";
  const backTarget = isIndividual ? "/" : "/business";

  // Safety check - if no user, show loading or redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white pt-28">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#333] px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(backTarget)}
              className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-accent">{headerTitle}</h1>
              <p className="text-gray-400">{headerSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:text-gray-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2 text-white" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid - Only show for business users */}
        {!isIndividual && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-[#1a1a1a] border-[#333]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1 text-white">
                        {stat.value}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          stat.title === "Monthly Spending"
                            ? orderAnalytics.monthlyChange >= 0
                              ? "text-green-400"
                              : "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {stat.change}
                      </p>
                    </div>
                    <div
                      className={`p-3 bg-[#2a2a2a] rounded-lg ${stat.color}`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div
          className={`grid grid-cols-1 ${
            !isIndividual ? "lg:grid-cols-3" : "lg:grid-cols-2"
          } gap-8`}
        >
          {/* Business Information - Only for business users */}
          {!isIndividual && (
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center text-accent">
                  <Building2 className="w-5 h-5 mr-2" />
                  Business Info
                </CardTitle>
                <CardDescription>Your company details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Company</p>
                    <p className="font-medium text-white">
                      {user?.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Industry</p>
                    <p className="font-medium text-white">{user?.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Business Type</p>
                    <p className="font-medium text-white">
                      {user?.businessType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Company Size</p>
                    <p className="font-medium text-white">
                      {user?.companySize}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="font-medium text-white">
                      {user?.addresses && user.addresses.length > 0
                        ? `${user.addresses[0].city}, ${user.addresses[0].state}`
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders - show only recent 5, fixed height */}
          <Card className="bg-[#1a1a1a] border-[#333] flex flex-col min-h-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-accent">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription>
                    {isIndividual
                      ? "Your latest orders"
                      : "Latest business transactions"}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent text-accent hover:bg-accent/20 hover:text-accent shrink-0"
                  onClick={() => setLocation("/orders")}
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1 min-h-0 flex flex-col">
              <div className="space-y-2 max-h-[280px] overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin">
                {ordersLoading ? (
                  <div className="text-center py-6">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-400 text-sm">Loading orders...</p>
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-6">
                    <BarChart3 className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-2">Unable to load orders</p>
                    <p className="text-xs text-gray-500 mb-3">{ordersError}</p>
                    <Button
                      className="bg-accent hover:bg-accent/80 text-white text-sm"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-6">
                    <BarChart3 className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-1">No orders yet</p>
                    <p className="text-xs text-gray-500">
                      Your orders will appear here.
                    </p>
                  </div>
                ) : (
                  recentOrders.slice(0, 3).map((order, index) => (
                    <div
                      key={order.id ?? index}
                      className="flex items-center justify-between gap-3 p-3 bg-[#2a2a2a] rounded-lg hover:bg-[#2f2f2f] transition-colors border border-transparent hover:border-[#333]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white text-sm truncate" title={order.id}>
                          {order.id}
                        </p>
                        <p className="text-xs text-gray-400 truncate" title={order.customer}>
                          {order.customer}
                        </p>
                        <p className="text-xs text-accent truncate mt-0.5" title={order.items}>
                          {order.items}
                        </p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <p className="font-semibold text-white text-sm whitespace-nowrap">{order.amount}</p>
                        <p className="text-[10px] text-gray-500">{order.date}</p>
                        <Badge
                          variant={
                            order.status === "DELIVERED" ||
                            order.status === "ORDER_SUCCESS"
                              ? "default"
                              : order.status === "PROCESSING"
                              ? "secondary"
                              : "outline"
                          }
                          className={`text-[10px] px-1.5 py-0 hover:bg-transparent ${
                            order.status === "DELIVERED" ||
                            order.status === "ORDER_SUCCESS"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : order.status === "PROCESSING"
                              ? "bg-accent/20 text-accent border-accent/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {formatOrderStatus(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {!ordersLoading && !ordersError && recentOrders.length > 5 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Showing 3 of {recentOrders.length} orders ·{" "}
                  <button
                    type="button"
                    className="text-accent hover:underline"
                    onClick={() => setLocation("/orders")}
                  >
                    View all
                  </button>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardHeader>
              <CardTitle className="text-accent">Quick Actions</CardTitle>
              <CardDescription>
                {isIndividual
                  ? "Manage your shopping and account"
                  : "Manage your business operations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  className="w-full justify-start bg-accent hover:bg-accent/80 text-white"
                  onClick={() => setLocation("/products")}
                >
                  {isIndividual ? (
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  ) : (
                    <Package className="w-4 h-4 mr-2" />
                  )}
                  {isIndividual ? "Continue Shopping" : "View Product Catalog"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-accent text-accent hover:bg-accent/20 hover:text-accent"
                  onClick={() => {
                    setLocation("/contact#get-in-touch");
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-accent text-accent hover:bg-accent/20 hover:text-accent"
                  onClick={() => setLocation("/account-settings")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics snapshot - Only show for business users */}
        {!isIndividual && (
          <div className="mt-8">
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center text-accent">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {analyticsTitle}
                </CardTitle>
                <CardDescription>{analyticsDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading analytics...</p>
                  </div>
                ) : analyticsError ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">
                      Unable to load analytics
                    </p>
                    <p className="text-sm text-gray-500">{analyticsError}</p>
                    <Button
                      className="mt-4 bg-accent hover:bg-accent/80 text-white"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-400">
                          {isIndividual
                            ? "Pending Deliveries"
                            : "Pending Orders"}
                        </h4>
                        <span className="text-yellow-400 text-sm font-bold">
                          {
                            recentOrders.filter(
                              (order) =>
                                order.status === "PROCESSING" ||
                                order.status === "ORDER_REQUESTED" ||
                                order.status === "PENDING_PAYMENT"
                            ).length
                          }
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {isIndividual
                          ? "Awaiting delivery"
                          : "Awaiting fulfilment"}
                      </p>
                    </div>

                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-400">
                          {isIndividual ? "Projected Spend" : "Total Spent"}
                        </h4>
                        <span className="text-green-400 text-sm font-bold">
                          ₹
                          {(
                            orderAnalytics.monthlySpending * 12
                          ).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {isIndividual
                          ? "This year (projected)"
                          : "Annual projection"}
                      </p>
                    </div>

                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-400">
                          Total Orders
                        </h4>
                        <span className="text-accent text-sm font-bold">
                          {orderAnalytics.totalOrders}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Lifetime orders</p>
                    </div>

                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-400">
                          Avg Order Value
                        </h4>
                        <span className="text-green-400 text-sm font-bold">
                          ₹{orderAnalytics.averageOrderValue.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Per order</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Order History & Analytics - Only show for business users */}
        {!isIndividual && (
          <div className="mt-8">
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center text-accent">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Order History & Analytics
                </CardTitle>
                <CardDescription>
                  Your purchasing patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading analytics...</p>
                  </div>
                ) : analyticsError ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">
                      Unable to load analytics
                    </p>
                    <p className="text-sm text-gray-500">{analyticsError}</p>
                    <Button
                      className="mt-4 bg-accent hover:bg-accent/80 text-white"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-[#2a2a2a] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">
                          Monthly Spending
                        </h4>
                        <span className="text-green-400 text-sm font-bold">
                          ₹{orderAnalytics.monthlySpending.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Average per month</p>
                      <p
                        className={`text-xs ${
                          orderAnalytics.monthlyChange >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {orderAnalytics.monthlyChange >= 0 ? "+" : ""}
                        {orderAnalytics.monthlyChange}% vs last month
                      </p>
                    </div>
                    {!isIndividual && (
                      <div className="p-3 bg-[#2a2a2a] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">
                            Loyalty Tier
                          </h4>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-transparent">
                            {orderAnalytics.loyaltyTier} Member
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          Premium customer benefits
                        </p>
                        <p className="text-xs text-accent">
                          Extra 5% discount on bulk orders
                        </p>
                      </div>
                    )}
                    <div className="p-3 bg-[#2a2a2a] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">
                          Next Order Due
                        </h4>
                        <span className="text-accent text-sm font-bold">
                          {orderAnalytics.nextOrderDue || "N/A"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Based on your pattern
                      </p>
                      <p className="text-xs text-accent">
                        Recommended: {orderAnalytics.recommendedItems}
                      </p>
                    </div>
                    <div className="p-3 bg-[#2a2a2a] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">
                          Customer Since
                        </h4>
                        <span className="text-white text-sm font-bold">
                          {orderAnalytics.customerSince || "Unknown"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {orderAnalytics.monthsSinceFirstOrder === 0
                          ? "New customer"
                          : orderAnalytics.monthsSinceFirstOrder === 1
                          ? "1 month of partnership"
                          : `${orderAnalytics.monthsSinceFirstOrder} months of partnership`}
                      </p>
                      <p className="text-xs text-accent">
                        {isIndividual
                          ? "Keep shopping to grow your perks"
                          : "Reliable bulk buyer"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wishlist Management */}
        <div className="mt-8">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center text-accent">
                    <Heart className="w-5 h-5 mr-2" />
                    Wishlist
                  </CardTitle>
                  <CardDescription>
                    {wishlistItems?.length
                      ? `${wishlistItems.length} item${wishlistItems.length === 1 ? "" : "s"} saved for later`
                      : "Save items you want to order later"}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent text-accent hover:bg-accent/20 hover:text-accent shrink-0 w-full sm:w-auto"
                  onClick={() => setLocation("/products")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add items
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {wishlistLoading ? (
                <div className="text-center py-10">
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Loading wishlist...</p>
                </div>
              ) : !wishlistItems || wishlistItems.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
                  <div className="w-14 h-14 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7 text-gray-500" />
                  </div>
                  <p className="text-white font-medium mb-1">Your wishlist is empty</p>
                  <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
                    Add products from the catalog and they’ll show up here so you can order later.
                  </p>
                  <Button
                    className="bg-accent hover:bg-accent/90 text-white"
                    onClick={() => setLocation("/products")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Browse products
                  </Button>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px] pr-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                    {(wishlistItems || []).map((item) => {
                      const productHref = `/product/${(item as { slug?: string }).slug || item.id}`;
                      const displayPrice =
                        typeof item.price === "string" && item.price.startsWith("₹")
                          ? item.price
                          : `₹${Number(String(item.price).replace(/[^\d.]/g, "") || 0).toLocaleString("en-IN")}`;
                      return (
                        <div
                          key={item.id}
                          className="group flex gap-4 p-4 bg-[#2a2a2a] rounded-xl border border-[#333] hover:border-accent/40 hover:bg-[#323232] transition-all duration-200"
                        >
                          <Link
                            href={productHref}
                            className="relative shrink-0 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-[#2a2a2a] rounded-lg"
                            aria-label={`View ${item.name}`}
                          >
                            <div className="w-20 h-20 bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#444]">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23333'/%3E%3Ctext x='32' y='32' text-anchor='middle' dy='.3em' fill='%23666' font-size='8'%3EImage%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                            {!item.inStock && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                                Out
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <Link
                                href={productHref}
                                className="block font-medium text-white text-sm leading-snug line-clamp-2 mb-1.5 hover:text-accent transition-colors focus:outline-none focus:text-accent"
                              >
                                {item.name}
                              </Link>
                              {item.category && (
                                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                  <span className="px-2 py-0.5 rounded-full bg-[#1f1f1f] border border-[#333] text-gray-400">
                                    {item.category}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-x-3 gap-y-1 mt-2 flex-wrap">
                                <span className="font-semibold text-accent text-base tabular-nums">
                                  {displayPrice}
                                </span>
                                {typeof item.inStock === "boolean" && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[11px] ${
                                      item.inStock ? "text-green-400" : "text-red-400"
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        item.inStock ? "bg-green-400" : "bg-red-400"
                                      }`}
                                    />
                                    {item.inStock ? "In stock" : "Out of stock"}
                                  </span>
                                )}
                                {typeof item.rating === "number" && item.rating > 0 && (
                                  <span className="flex items-center text-[10px] text-gray-400 gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                                    {item.rating.toFixed(1)}
                                    {typeof item.reviews === "number" && item.reviews > 0 && (
                                      <span className="text-gray-500">({item.reviews})</span>
                                    )}
                                  </span>
                                )}
                              </div>
                              {item.addedDate && (
                                <p className="text-[10px] text-gray-500 mt-1.5">
                                  Saved on {item.addedDate}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                className="flex-1 bg-accent hover:bg-accent/90 text-white text-xs h-9"
                                onClick={() => handleMoveToCart(item)}
                                disabled={!item.inStock}
                              >
                                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                                Add to cart
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#555] text-gray-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 h-9 w-9 p-0 shrink-0"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  try {
                                    await removeFromWishlist(item.id);
                                  } catch (error) {}
                                }}
                                aria-label="Remove from wishlist"
                                title="Remove from wishlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Recommendations (individual only) */}
        {isIndividual && (
          <div className="mt-8">
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-accent">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Recommended for You
                    </CardTitle>
                    <CardDescription>
                      Personalized recommendations based on your purchase
                      history
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-accent text-accent bg-red-600 hover:bg-red-600/20 hover:text-accent"
                    onClick={() => setLocation("/products")}
                  >
                    View All Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recommendationsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading recommendations...</p>
                  </div>
                ) : recommendationsError ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">
                      Unable to load recommendations
                    </p>
                    <p className="text-sm text-gray-500">
                      {recommendationsError}
                    </p>
                    <Button
                      className="mt-4 bg-accent hover:bg-accent/80 text-white"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : productRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">
                      No recommendations available
                    </p>
                    <p className="text-sm text-gray-500">
                      Start shopping to get personalized recommendations
                    </p>
                    <Button
                      className="mt-4 bg-accent hover:bg-accent/80 text-white"
                      onClick={() => setLocation("/products")}
                    >
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productRecommendations.map((product) => (
                      <div
                        key={product.id}
                        className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333] hover:border-accent/30 transition-all duration-300 group"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <div className="w-20 h-20 bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#444]">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23333'/%3E%3Ctext x='32' y='32' text-anchor='middle' dy='.3em' fill='%23666' font-size='8'%3EImage%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                            {!product.inStock && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                                Out
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-white text-sm leading-tight group-hover:text-accent transition-colors">
                                {product.name}
                              </h4>
                              <span className="font-bold text-accent text-sm ml-2">
                                {product.price}
                              </span>
                            </div>

                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                                <span className="text-xs text-gray-400">
                                  {product.rating}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 mx-1">
                                •
                              </span>
                              <span className="text-xs text-gray-400">
                                {product.reviews} reviews
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-[#1a1a1a] border-[#444] text-gray-300 hover:bg-transparent shrink-0 whitespace-nowrap"
                                >
                                  {product.category}
                                </Badge>
                                <span className="text-xs text-accent font-medium truncate">
                                  {product.reason}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-accent text-accent hover:bg-accent/20 hover:text-accent text-xs"
                                disabled={!product.inStock}
                                onClick={() =>
                                  setLocation(
                                    `/product/${product.slug || product.id}`
                                  )
                                }
                              >
                                <Package className="w-3 h-3 mr-1" />
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-accent text-accent hover:bg-accent/20 hover:text-accent"
                                disabled={!product.inStock}
                                onClick={() => handleAddRecommendationToCart(product)}
                                aria-label={`Add ${product.name} to cart`}
                              >
                                <ShoppingCart className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
