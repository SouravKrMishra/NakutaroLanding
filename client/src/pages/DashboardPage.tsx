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
import { useAuth } from "@/lib/AuthContext.tsx";
import { useWishlist } from "@/lib/WishlistContext.tsx";
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
  const { user, logout } = useAuth();
  const {
    wishlistItems,
    removeFromWishlist,
    loading: wishlistLoading,
  } = useWishlist();

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
    loyaltyTier: "Bronze",
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

        // Get the 4 most recent orders for display
        const recentOrdersData = orders.slice(0, 4).map((order: any) => ({
          id: order.orderNumber,
          customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
          amount: `₹${order.total.toLocaleString()}`,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
          date: new Date(order.orderDate).toLocaleDateString(),
          items: order.items
            .map((item: any) => `${item.quantity}x ${item.name}`)
            .join(", "),
        }));

        setRecentOrders(recentOrdersData);

        // Calculate analytics
        if (orders.length > 0) {
          const totalSpent = orders.reduce(
            (sum: number, order: any) => sum + order.total,
            0
          );
          const averageOrderValue = totalSpent / orders.length;

          // Calculate monthly spending (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const recentOrders = orders.filter(
            (order: any) => new Date(order.orderDate) >= thirtyDaysAgo
          );
          const monthlySpending = recentOrders.reduce(
            (sum: number, order: any) => sum + order.total,
            0
          );

          // Calculate previous month spending (30-60 days ago)
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
          const previousMonthOrders = orders.filter(
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

          // Find customer since date (earliest order)
          const earliestOrder = orders.reduce((earliest: any, order: any) =>
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

          // Determine loyalty tier based on total spent
          let loyaltyTier = "Bronze";
          if (totalSpent >= 1000000) loyaltyTier = "Diamond";
          else if (totalSpent >= 500000) loyaltyTier = "Platinum";
          else if (totalSpent >= 200000) loyaltyTier = "Gold";
          else if (totalSpent >= 50000) loyaltyTier = "Silver";

          // Calculate next order due (based on average order frequency)
          const orderDates = orders
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

          // Get most ordered items for recommendation
          const itemCounts: { [key: string]: number } = {};
          orders.forEach((order: any) => {
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
            totalOrders: orders.length,
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
            loyaltyTier: "Bronze",
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
        setOrderAnalytics({
          monthlySpending: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          customerSince: "Unknown",
          loyaltyTier: "Bronze",
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
    try {
      await removeFromWishlist(item.id);
    } catch (error) {}
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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "High":
        return "text-red-400";
      case "Medium":
        return "text-yellow-400";
      case "Low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const stats = [
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
        orderAnalytics.monthlyChange >= 0 ? "text-green-400" : "text-red-400",
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
  ];

  return (
    <div className="min-h-screen bg-[#181818] text-white pt-28">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#333] px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/business")}
              className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Business
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-accent">
                Business Dashboard
              </h1>
              <p className="text-gray-400">
                Welcome back, {user?.name} from {user?.companyName}
              </p>
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
        {/* Stats Grid */}
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
                  <div className={`p-3 bg-[#2a2a2a] rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Information */}
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
                  <p className="font-medium text-white">{user?.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Industry</p>
                  <p className="font-medium text-white">{user?.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Business Type</p>
                  <p className="font-medium text-white">{user?.businessType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Company Size</p>
                  <p className="font-medium text-white">{user?.companySize}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-medium text-white">
                    {user?.city}, {user?.state}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-accent">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription>
                    Latest business transactions
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent text-accent hover:bg-accent/20 hover:text-accent"
                  onClick={() => setLocation("/orders")}
                >
                  View All Orders
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading recent orders...</p>
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">
                      Unable to load recent orders
                    </p>
                    <p className="text-sm text-gray-500">{ordersError}</p>
                    <Button
                      className="mt-4 bg-accent hover:bg-accent/80 text-white"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No recent orders found</p>
                    <p className="text-sm text-gray-500">
                      Your recent orders will appear here.
                    </p>
                  </div>
                ) : (
                  recentOrders.map((order, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-white">{order.id}</p>
                        <p className="text-sm text-gray-400">
                          {order.customer}
                        </p>
                        <p className="text-xs text-accent">{order.items}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">{order.amount}</p>
                        <Badge
                          variant={
                            order.status === "Delivered" ||
                            order.status === "CONFIRMED"
                              ? "default"
                              : order.status === "Processing"
                              ? "secondary"
                              : "outline"
                          }
                          className={`mt-1 hover:bg-transparent ${
                            order.status === "Delivered" ||
                            order.status === "CONFIRMED"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : order.status === "Processing"
                              ? "bg-accent/20 text-accent border-accent/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {order.status === "CONFIRMED"
                            ? "Confirmed"
                            : order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardHeader>
              <CardTitle className="text-accent">Quick Actions</CardTitle>
              <CardDescription>Manage your business operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  className="w-full justify-start bg-accent hover:bg-accent/80 text-white"
                  onClick={() => setLocation("/products")}
                >
                  <Package className="w-4 h-4 mr-2" />
                  View Product Catalog
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-accent text-accent hover:bg-accent/20 hover:text-accent"
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Users className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-accent text-accent hover:bg-accent/20 hover:text-accent"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Analytics */}
        <div className="mt-8">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardHeader>
              <CardTitle className="flex items-center text-accent">
                <BarChart3 className="w-5 h-5 mr-2" />
                Inventory Analytics
              </CardTitle>
              <CardDescription>
                Track your anime figure inventory and performance
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
                  <p className="text-gray-400 mb-2">Unable to load analytics</p>
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
                        Pending Orders
                      </h4>
                      <span className="text-yellow-400 text-sm font-bold">
                        {
                          recentOrders.filter(
                            (order) =>
                              order.status === "Processing" ||
                              order.status === "Pending"
                          ).length
                        }
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Awaiting delivery</p>
                  </div>

                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-400">
                        Total Spent
                      </h4>
                      <span className="text-green-400 text-sm font-bold">
                        ₹
                        {(orderAnalytics.monthlySpending * 12).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      This year (projected)
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

        {/* Order History & Analytics */}
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
                  <p className="text-gray-400 mb-2">Unable to load analytics</p>
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
                  <div className="p-3 bg-[#2a2a2a] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">Loyalty Tier</h4>
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
                  <div className="p-3 bg-[#2a2a2a] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">Next Order Due</h4>
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
                      <h4 className="font-medium text-white">Customer Since</h4>
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
                    <p className="text-xs text-accent">Reliable bulk buyer</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Wishlist Management */}
        <div className="mt-8">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-accent">
                    <Heart className="w-5 h-5 mr-2" />
                    Wishlist Management
                  </CardTitle>
                  <CardDescription>
                    Track items you want to order later
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent text-accent bg-red-600 hover:bg-red-600/20 hover:text-accent"
                  onClick={() => setLocation("/products")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Items
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {wishlistLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading wishlist...</p>
                </div>
              ) : !wishlistItems || wishlistItems.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Your wishlist is empty</p>
                  <p className="text-sm text-gray-500">
                    Browse our catalog and add items you'd like to order later
                  </p>
                  <Button
                    className="mt-4 bg-accent hover:bg-accent/80 text-white"
                    onClick={() => setLocation("/products")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(wishlistItems || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">
                            {item.name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={`hover:bg-transparent ${
                                item.inStock
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                              }`}
                            >
                              {item.inStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                            <span
                              className={`text-sm font-medium ${getPriorityColor(
                                item.priority
                              )}`}
                            >
                              {item.priority} Priority
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                          <span>Series: {item.series}</span>
                          <span>Price: {item.price}</span>
                          <span>Quantity: {item.quantity}</span>
                          <span>Added: {item.addedDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-accent text-accent hover:bg-accent/20 hover:text-accent"
                          onClick={() => handleMoveToCart(item)}
                          disabled={!item.inStock}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Order Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-accent text-accent bg-red-600 hover:bg-red-600/20 hover:text-accent"
                          onClick={async () => {
                            try {
                              await removeFromWishlist(item.id);
                            } catch (error) {}
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Recommendations */}
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
                    Personalized recommendations based on your purchase history
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
                          <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#444]">
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

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className="text-xs bg-[#1a1a1a] border-[#444] text-gray-300 hover:bg-transparent"
                              >
                                {product.category}
                              </Badge>
                              <span className="text-xs text-accent font-medium">
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
                                setLocation(`/product/${product.slug || product.id}`)
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
      </div>
    </div>
  );
};

export default DashboardPage;
