import { useEffect, cloneElement } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import {
  Package,
  Clock,
  Truck,
  MapPin,
  Search,
  AlertCircle,
  Shield,
  Mail,
} from "lucide-react";

const ShippingPolicyPage = () => {
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const sections = [
    {
      icon: <Package className="w-6 h-6" />,
      title: "1. Order Processing & Dispatch",
      content: [
        "• Orders are usually processed and dispatched within 24–48 business hours after payment confirmation.",
        "• Our warehouse operates Monday to Saturday (excluding national holidays).",
        "• Cash on Delivery (COD) orders may take an additional 24–48 hours for verification and processing.",
      ],
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "2. Delivery Timelines",
      content: [
        "• Estimated delivery time within India is 3–8 working days from the date of dispatch, depending on your PIN code and courier operations.",
        "• During peak seasons, sales, or due to unforeseen delays, delivery timelines may be slightly longer.",
      ],
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "3. Shipping Charges",
      content: [
        "• Free shipping is applicable on orders above ₹1999 within India.",
        "• Orders below this amount will incur a nominal shipping charge, calculated based on the product, weight, and delivery location and clearly displayed at checkout.",
        "• Any applicable taxes are included in the price shown on the website.",
      ],
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "4. Multiple Shipments",
      content: [
        "• In case of multi-item orders, products may be shipped in separate packages and/or from different warehouses to ensure faster delivery.",
      ],
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "5. Change of Delivery Address",
      content: [
        "• Address changes can be made only before the order has been dispatched.",
        "• Once the order is shipped, the delivery address cannot be modified.",
      ],
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "6. Tracking Your Order",
      content: [
        "• Once your order is dispatched, you will receive a tracking link via email, SMS, or WhatsApp.",
        "• You can also track your order from the \"My Orders\" section in your account.",
      ],
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "7. Undelivered / RTO Orders",
      content: [
        "• If a prepaid order is undelivered and returned to us (RTO), we will process a refund as store credit to your Anime India account within 48–72 hours after we receive the shipment.",
        "• Shipping and COD charges (if any) are generally non-refundable.",
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "8. Damaged or Lost in Transit",
      content: [
        "• If your parcel appears damaged or is lost in transit, please contact our support team at the earliest with photos/video (if available).",
        "• After verification, we will either:",
        "  - resend the product, or",
        "  - provide a suitable resolution as per our Return & Refund Policy.",
      ],
    },
  ];

  return (
    <div className="shipping-policy-page pt-28 pb-16 overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] min-h-[350px] sm:min-h-[400px] md:min-h-[450px] mb-12 sm:mb-16 md:mb-20 overflow-hidden bg-[#121212]">
        <div className="absolute inset-0 opacity-20">
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>

          {/* Decorative elements */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-40 h-40 bg-accent rounded-full filter blur-[80px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-accent rounded-full filter blur-[100px]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="text-center max-w-4xl mx-auto px-4 sm:px-0"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, ease: "backOut" }}
                className="inline-block bg-accent/10 px-4 py-1 rounded-full border border-accent/20 mb-6"
              >
                <span className="text-accent font-medium text-sm">
                  Delivery Information
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                <div className="inline-block">
                  <span style={{ color: "var(--theme-color-hex)" }}>
                    Shipping Policy
                  </span>
                  <div
                    className="block h-1 rounded-full mt-1"
                    style={{
                      backgroundColor: "var(--theme-color-hex)",
                      opacity: 0.3,
                    }}
                  />
                </div>
                <div className="text-white block mt-2">
                  Delivery & Shipping Information
                </div>
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto"
        >
          {/* Policy Sections */}
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={fadeIn("up", "tween", 0.2, 1)}
              className="mb-12 bg-[#1a1a1a] rounded-lg p-6 sm:p-8 border border-[#2D2D2D] hover:border-accent/50 transition duration-300"
            >
              <div className="flex items-start mb-4">
                <div
                  className="mr-4 p-3 rounded-lg flex-shrink-0"
                  style={{
                    backgroundColor: "var(--theme-color-hex)",
                    opacity: 0.8,
                  }}
                >
                  {cloneElement(section.icon, {
                    className: "w-6 h-6 text-white stroke-white",
                  })}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex-1">
                  {section.title}
                </h2>
              </div>
              <div className="ml-16 sm:ml-20">
                {section.content.map((item, itemIndex) => (
                  <p
                    key={itemIndex}
                    className={`text-gray-300 mb-2 text-lg leading-relaxed ${
                      item.startsWith("•") ? "ml-4" : ""
                    } ${item.startsWith("  -") ? "ml-8" : ""}`}
                  >
                    {item}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Contact Section */}
          <motion.div
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="mb-12 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg p-6 sm:p-8 border border-accent/20"
          >
            <div className="flex items-start mb-4">
              <div
                className="mr-4 p-3 rounded-lg flex-shrink-0"
                style={{
                  backgroundColor: "var(--theme-color-hex)",
                  opacity: 0.1,
                  color: "var(--theme-color-hex)",
                }}
              >
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex-1">
                Contact Us
              </h2>
            </div>
            <div className="ml-16 sm:ml-20 space-y-4">
              <p className="text-gray-300 text-lg leading-relaxed">
                For any shipping-related queries, please contact:
              </p>
              <div className="space-y-3 text-gray-300">
                <p>
                  <strong className="text-white">Email:</strong>{" "}
                  <a
                    href="mailto:contact@animeindia.org"
                    className="text-accent hover:underline"
                  >
                    contact@animeindia.org
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;

