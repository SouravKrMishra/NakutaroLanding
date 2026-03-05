import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useAuth } from "@/lib/AuthContext.tsx";
import {
  ArrowLeft,
  Search,
  Package,
  Calendar,
  Filter,
  Truck,
  Loader2,
  IndianRupee
} from "lucide-react";
import axios from "axios";
import { buildApiUrl } from "@/lib/api.ts";

interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  orderDate: string;
  estimatedDelivery?: string;
  awbCode?: string | null;
  shiprocketShipmentId?: string | null;
  courierName?: string | null;
  items: Array<{
    productId: number;
    name: string;
    price: string;
    quantity: number;
    image: string;
    category: string;
    size?: string | null;
    color?: string | null;
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

/** API response from GET /api/shiprocket/tracking/:shipmentId */
/** Official Shiprocket tracking page */
const SHIPROCKET_TRACK_BASE = "https://shiprocket.co/tracking/";

const OrdersPage = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // State for orders
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("success");
  const [trackingOrderId, setTrackingOrderId] = React.useState<string | null>(null);

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

  const STATUS_GROUPS: Record<string, string[]> = {
    pending: ["ORDER_REQUESTED", "PENDING_PAYMENT"],
    success: ["ORDER_SUCCESS", "PROCESSING", "SHIPPED", "DELIVERED"],
    failed: ["CANCELLED", "ORDER_FAILED"],
  };

  const getDisplayStatus = (status: string): string => {
    if (STATUS_GROUPS.pending.includes(status)) return "Pending";
    if (STATUS_GROUPS.success.includes(status)) return "Success";
    if (STATUS_GROUPS.failed.includes(status)) return "Failed";
    return status.replace(/_/g, " ");
  };

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
      (STATUS_GROUPS[statusFilter] ?? []).includes(order.status);

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ORDER_SUCCESS":
      case "DELIVERED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PROCESSING":
      case "SHIPPED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "PENDING_PAYMENT":
      case "ORDER_REQUESTED":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "CANCELLED":
      case "ORDER_FAILED":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
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
    { value: "success", label: "Successful Orders" },
    { value: "pending", label: "Pending Orders" },
    { value: "failed", label: "Failed / Cancelled" },
    { value: "all", label: "All Orders" },
  ];

  const getOrderId = (order: Order) => order.id || order._id || "";

  const handleTrackShipment = React.useCallback(
    (order: Order) => {
      const orderId = getOrderId(order);
      const awbCode = order.awbCode;

      if (!awbCode) {
        window.alert("Tracking link is not available yet for this shipment.");
        return;
      }

      setTrackingOrderId(orderId);
      try {
        const url = `${SHIPROCKET_TRACK_BASE}${encodeURIComponent(awbCode)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      } finally {
        setTrackingOrderId(null);
      }
    },
    []
  );

  const canTrackOrder = (order: Order) =>
    order.status === "SHIPPED" || order.status === "DELIVERED";

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] -ml-2 mb-4 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Order History
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                View and track all your orders
              </p>
            </div>
          </div>
        </header>

        {/* Summary Stats - compact strip when orders exist */}
        {!loading && !error && orders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="rounded-xl bg-[#1f1f1f] border border-[#2a2a2a] p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{orders.length}</p>
            </div>
            <div className="rounded-xl bg-[#1f1f1f] border border-[#2a2a2a] p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Spent</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400 mt-0.5">
                ₹{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-[#1f1f1f] border border-[#2a2a2a] p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Delivered</p>
              <p className="text-xl sm:text-2xl font-bold text-accent mt-0.5">
                {orders.filter((o) => o.status === "DELIVERED").length}
              </p>
            </div>
            <div className="rounded-xl bg-[#1f1f1f] border border-[#2a2a2a] p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">In Progress</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">
                {orders.filter((o) =>
                  ["ORDER_REQUESTED", "PENDING_PAYMENT", "ORDER_SUCCESS", "PROCESSING", "SHIPPED"].includes(o.status)
                ).length}
              </p>
            </div>
          </div>
        )}

        {/* Search and Filter - compact toolbar */}
        {orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
              <Input
                placeholder="Search by order #, product, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-[#1f1f1f] border-[#333] text-white placeholder:text-gray-500 rounded-lg focus-visible:ring-accent/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-4 bg-[#1f1f1f] border border-[#333] text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
              >
                {statusOptions.map((option, index) => (
                  <option key={`status-${option.value}-${index}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Unable to load orders</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-accent hover:bg-accent/90 text-white rounded-lg">
              Try Again
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {searchTerm || statusFilter !== "all" ? "No orders found" : "No orders yet"}
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              {searchTerm
                ? "Try adjusting your search term."
                : statusFilter !== "all"
                ? `You have no ${statusOptions.find((o) => o.value === statusFilter)?.label.toLowerCase() ?? ""}.`
                : "Your orders will appear here after you make a purchase."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setLocation("/products")} className="bg-accent hover:bg-accent/90 text-white rounded-lg">
                Browse Products
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order, index) => (
              <Card
                key={`order-${order.orderNumber}-${getOrderId(order)}-${index}`}
                className="bg-[#1f1f1f] border border-[#2a2a2a] overflow-hidden rounded-xl hover:border-[#333] transition-colors"
              >
                {/* Card header row */}
                <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-base font-semibold text-white">
                      #{order.orderNumber}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(order.orderDate)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${getStatusColor(order.status)} border text-xs font-medium`}>
                      {getDisplayStatus(order.status)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                    {/* Items - left / full width on mobile */}
                    <div className="lg:col-span-2 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#2a2a2a]">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Items ({order.items.length})
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={`${order.orderNumber}-${item.productId}-${idx}`}
                            className="flex gap-4 p-3 rounded-lg bg-[#181818] border border-[#2a2a2a]"
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#333]">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23333'/%3E%3Ctext x='40' y='40' text-anchor='middle' dy='.3em' fill='%23666' font-size='8'%3E?%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-white text-sm sm:text-base truncate">
                                {item.name}
                              </h5>
                              <p className="text-gray-500 text-xs mt-0.5">{item.category}</p>
                              {(item.size || item.color) && (
                                <p className="text-gray-500 text-xs mt-0.5">
                                  {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                              <p className="text-accent font-medium text-sm mt-1.5">
                                {item.quantity} × {item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary + Shipping - right column */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          Summary
                        </h4>
                        <div className="rounded-lg bg-[#181818] border border-[#2a2a2a] p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total</span>
                            <span className="font-semibold text-white">₹{order.total.toLocaleString()}</span>
                          </div>
                          {order.estimatedDelivery && (
                            <div className="flex justify-between text-sm pt-1 border-t border-[#2a2a2a]">
                              <span className="text-gray-400">Est. delivery</span>
                              <span className="text-accent text-xs sm:text-sm">
                                {formatDate(order.estimatedDelivery)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" />
                          Shipping
                        </h4>
                        <div className="rounded-lg bg-[#181818] border border-[#2a2a2a] p-4 text-sm text-gray-400 space-y-1">
                          <p className="text-white font-medium">
                            {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                          </p>
                          <p>{order.shippingInfo.address}</p>
                          <p>
                            {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.pincode}
                          </p>
                          <p>{order.shippingInfo.country}</p>
                          <p className="text-accent text-xs mt-1">{order.shippingInfo.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipment tracking - open Shiprocket track_url in a new tab */}
                  {canTrackOrder(order) && (
                    <div className="border-t border-[#2a2a2a] px-5 py-4 sm:px-6 flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-sm font-medium text-white">
                          <Truck className="w-4 h-4 text-accent" />
                          Track shipment
                        </span>
                        {order.awbCode && (
                          <span className="text-xs text-gray-500">AWB: {order.awbCode}</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-accent/40 text-accent hover:bg-accent/10"
                        onClick={() => handleTrackShipment(order)}
                        disabled={trackingOrderId === getOrderId(order)}
                      >
                        {trackingOrderId === getOrderId(order) ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Opening…
                          </>
                        ) : (
                          <>Open tracking</>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
