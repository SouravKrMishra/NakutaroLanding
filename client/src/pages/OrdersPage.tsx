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
import { Input } from "@/components/ui/input.tsx";
import { useAuth } from "@/lib/AuthContext.tsx";
import {
  ArrowLeft,
  Search,
  Package,
  Calendar,
  DollarSign,
  Filter,
} from "lucide-react";
import axios from "axios";
import { buildApiUrl } from "@/lib/api.ts";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  orderDate: string;
  estimatedDelivery?: string;
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
}

const OrdersPage = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // State for orders
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Fetch orders
  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(buildApiUrl("/api/orders"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setOrders(response.data.orders || []);
      } catch (error) {
        setError("Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "delivered":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "processing":
      case "shipped":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending_payment":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending_payment", label: "Pending Payment" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#181818] text-white pt-28">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
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
              onClick={() => setLocation("/dashboard")}
              className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-accent">Order History</h1>
              <p className="text-gray-400">
                View all your orders and their status
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders by order number, product name, or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#2a2a2a] border-[#444] text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#2a2a2a] border border-[#444] text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    {statusOptions.map((option, index) => (
                      <option
                        key={`status-${option.value}-${index}`}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Unable to load orders
            </h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-accent hover:bg-accent/80 text-white"
            >
              Try Again
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || statusFilter !== "all"
                ? "No orders found"
                : "No orders yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Your orders will appear here once you make a purchase"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button
                onClick={() => setLocation("/products")}
                className="bg-accent hover:bg-accent/80 text-white"
              >
                Browse Products
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <Card
                key={`order-${order.orderNumber}-${order.id}-${index}`}
                className="bg-[#1a1a1a] border-[#333] hover:border-accent/30 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-accent">
                        Order #{order.orderNumber}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Placed on {formatDate(order.orderDate)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`${getStatusColor(
                          order.status
                        )} hover:bg-transparent`}
                      >
                        {order.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge
                        className={`${getPaymentStatusColor(
                          order.paymentStatus
                        )} hover:bg-transparent`}
                      >
                        {order.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold text-white mb-3">
                        Items ({order.items.length})
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={`${order.orderNumber}-${item.productId}-${item.name}-${index}`}
                            className="flex items-center space-x-3 p-3 bg-[#2a2a2a] rounded-lg"
                          >
                            <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#444]">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23333'/%3E%3Ctext x='24' y='24' text-anchor='middle' dy='.3em' fill='%23666' font-size='6'%3EImage%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-white text-sm">
                                {item.name}
                              </h5>
                              <p className="text-gray-400 text-xs">
                                {item.category}
                              </p>
                              <p className="text-accent text-sm font-medium">
                                {item.quantity}x {item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-4">
                      <div className="bg-[#2a2a2a] p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-3 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Order Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Amount</span>
                            <span className="text-white font-medium">
                              ₹{order.total.toLocaleString()}
                            </span>
                          </div>
                          {order.estimatedDelivery && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Estimated Delivery
                              </span>
                              <span className="text-accent">
                                {formatDate(order.estimatedDelivery)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#2a2a2a] p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-3 flex items-center">
                          <Package className="w-4 h-4 mr-2" />
                          Shipping Address
                        </h4>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p className="text-white font-medium">
                            {order.shippingInfo.firstName}{" "}
                            {order.shippingInfo.lastName}
                          </p>
                          <p>{order.shippingInfo.address}</p>
                          <p>
                            {order.shippingInfo.city},{" "}
                            {order.shippingInfo.state}{" "}
                            {order.shippingInfo.pincode}
                          </p>
                          <p>{order.shippingInfo.country}</p>
                          <p className="text-accent">
                            {order.shippingInfo.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && !error && orders.length > 0 && (
          <div className="mt-8">
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="text-accent">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-[#2a2a2a] rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {orders.length}
                    </div>
                    <div className="text-sm text-gray-400">Total Orders</div>
                  </div>
                  <div className="text-center p-4 bg-[#2a2a2a] rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      ₹
                      {orders
                        .reduce((sum, order) => sum + order.total, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Total Spent</div>
                  </div>
                  <div className="text-center p-4 bg-[#2a2a2a] rounded-lg">
                    <div className="text-2xl font-bold text-accent">
                      {
                        orders.filter(
                          (order) => order.status.toLowerCase() === "delivered"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-400">Delivered</div>
                  </div>
                  <div className="text-center p-4 bg-[#2a2a2a] rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {
                        orders.filter((order) =>
                          [
                            "pending_payment",
                            "confirmed",
                            "processing",
                            "shipped",
                          ].includes(order.status.toLowerCase())
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-400">In Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
