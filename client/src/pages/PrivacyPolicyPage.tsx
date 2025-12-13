import { useEffect, cloneElement } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Mail,
  Cookie,
  Database,
  UserCheck,
  Globe,
  AlertCircle,
  Settings,
  Bell,
} from "lucide-react";

const PrivacyPolicyPage = () => {
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "1. What This Policy Covers",
      content: [
        "This Privacy Policy explains:",
        "• What information we collect about you",
        "• How and why we collect and use it",
        "• With whom we share it",
        "• How we protect it",
        "• The choices and rights you have in relation to your data",
        "If you do not agree with this Policy, please discontinue use of the Website.",
      ],
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "2. Information We Collect",
      content: [
        "We only ask for personal information when we truly need it to provide a service to you. We collect information by fair and lawful means, with your knowledge and consent, and we will always let you know why we're collecting it and how it will be used.",
        "In general, you can browse the Website without telling us who you are. However, certain features (such as placing an order or creating an account) require you to provide personal information.",
      ],
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "2.1 Information You Provide Directly",
      content: [
        'If you choose to register, place an order, or contact us, and are 13 years of age or older, we may collect and process the following ("Personal Information"):',
        "• Contact details: name, email address, phone number, billing and shipping addresses",
        "• Account details: username, password, preferences (e.g., wishlists, favourites, saved carts)",
        "• Order information: products purchased, size, quantity, transaction history",
        "• Communications: information you provide when you write directly to us (including by email, forms, chat, social media messages) or when you comment/review on our Website",
        "• Other information: any details you voluntarily submit, such as feedback, survey responses, or support requests",
      ],
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "2.2 Payment and Billing Information",
      content: [
        "When you make a purchase:",
        "• Payments are processed by secure third-party payment gateways.",
        "• We do not store your complete card, UPI, or net-banking credentials on our servers.",
        "• We may store limited billing-related information such as:",
        "  - Transaction ID",
        "  - Payment mode",
        "  - Amount paid and status",
        "  - Partial masked card details as returned by the payment provider (if any)",
        "If required for refunds on COD orders, we may collect your bank account or UPI details solely for refund processing.",
      ],
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "2.3 Automatically Collected Data (Logs & Usage Data)",
      content: [
        "Each time you visit or use the Website, certain information may be automatically reported by your browser or device, including:",
        "• IP address",
        "• Browser type and version",
        "• Device type, operating system, and language",
        "• Referring and exit pages/URLs",
        "• Pages viewed, links clicked, session time and date",
        "• Number of clicks, time spent on pages, and other similar usage information",
        "We use this information in an aggregated and anonymised manner to:",
        "• Analyse trends",
        "• Administer and improve the Website",
        "• Understand overall user behaviour and demographics",
        "We do not link this automatically collected data directly to your personally identifiable information unless required for security, fraud prevention, or legal purposes.",
      ],
    },
    {
      icon: <Cookie className="w-6 h-6" />,
      title: "2.4 Cookies and Similar Technologies",
      content: [
        "We may collect information about your general internet usage by using a cookie file stored on the hard drive of your device or through similar technologies (e.g. local storage, pixels).",
        "Cookies help us:",
        "• Recognise you when you return to our Website",
        "• Remember your preferences and cart items",
        "• Estimate our user size and usage patterns",
        "• Customise the Website according to your interests",
        "• Speed up searches and improve overall experience",
        "You can control or disable cookies via your browser settings. However, if you choose to disable cookies, some parts of the Website may not function properly.",
      ],
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "3. How We Use Collected Information",
      content: [
        "We use the information we collect, either directly or indirectly, for the following purposes:",
      ],
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "3.1 Providing and Improving Our Services",
      content: [
        "• To process, personalise, and fulfil your orders",
        "• To enable account creation, login, and personalised features (e.g., wishlist, order history)",
        "• To provide customer support, respond to queries, and resolve issues",
        "• To maintain and enhance the security and performance of our Website",
        "• To debug, test, and improve our systems, user interface, and features",
      ],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "3.2 Contractual and Legal Obligations",
      content: [
        "• To carry out our obligations arising from any contracts entered into between you and us",
        "• To handle invoicing, billing, returns, and refunds",
        "• To comply with applicable legal, tax, and regulatory requirements",
      ],
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "3.3 Personalisation and Marketing",
      content: [
        "• To understand how users interact with our Website and services",
        "• To improve the content and features of our Website (for example, by personalising recommendations and offers based on your interests)",
        "• To provide you with information about products and services similar to those you have purchased, enquired about, or may reasonably be interested in",
        "• To send promotional communications, offers, updates, or alerts via email, SMS, WhatsApp, push notifications, or phone (where permitted by law or with your consent)",
        "You can opt out of non-essential marketing communications at any time (see Section 8 – Your Rights & Choices).",
      ],
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "3.4 Analytics, Research and Reporting",
      content: [
        "• To generate and review reports and statistics about our user base and service usage patterns",
        "• To conduct research and surveys, and improve our offerings",
        "• To administer and enhance security, including fraud detection and prevention",
      ],
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "3.5 Reminders and Notifications",
      content: [
        "• To remind you about abandoned carts, pending payments, or time-sensitive offers",
        "• To notify you regarding shipment, delivery, order status changes, and service-related updates",
        "We may combine information received from third parties with information you provide and information we collect about you for the purposes described above. We may also anonymise and/or de-identify data, in which case it no longer identifies you personally and is not subject to this Policy.",
      ],
    },
    {
      icon: <Cookie className="w-6 h-6" />,
      title: "4. Cookies, Third-Party Cookies and Pixels",
      content: [
        "4.1 First-Party Cookies",
        "We use both session cookies (which expire when you close your browser) and persistent cookies (which remain until they expire or are deleted) to:",
        "• Keep you logged in",
        "• Remember your preferences",
        "• Maintain your cart and browsing state",
        "• Enhance performance and usability",
        "The information collected via cookies is not sold, rented, or shared with outside parties in a personally identifiable form.",
        "",
        "4.2 Third-Party Cookies and Analytics",
        "From time to time, we may engage third-party service providers to:",
        "• Track and analyse non-personally identifiable usage and volume statistical information",
        "• Provide analytics, advertising, or re-targeting services (for example, through tools like Google Analytics, Facebook, etc.)",
        "These third parties may use cookies, pixels, or similar technologies to help track visitor behaviour. Such cookies do not associate individual visitors with personally identifiable information and are used only to provide us with anonymised usage data.",
        "You may opt out of certain analytics or advertising cookies by using the relevant opt-out tools offered by the third party (for example, browser add-ons or opt-out pages provided by Google or Facebook).",
        "",
        "4.3 Pixels and Web Beacons",
        "Our pages or emails may contain small electronic files known as pixels or web beacons that allow us to:",
        "• Count users who have visited a page or opened an email",
        "• Recognise returning users and their devices",
        "• Measure campaign performance and improve content relevance",
        "These technologies help us personalise your experience and improve our marketing and communication efficiency.",
      ],
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "5. Data Retention",
      content: [
        "We only retain collected information for as long as necessary to:",
        "• Provide you with the requested service",
        "• Fulfil orders and maintain your account",
        "• Comply with our legal, tax, and regulatory obligations",
        "• Resolve disputes and enforce our agreements",
        "When your information is no longer needed for these purposes, we will delete or anonymise it using commercially reasonable measures.",
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "6. Data Security",
      content: [
        "We protect the data we store using commercially acceptable means designed to prevent:",
        "• Loss and theft",
        "• Unauthorised access, disclosure, copying, use, or modification",
        "These measures may include encryption, access controls, and internal policies.",
        "However, no method of electronic transmission or storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security. You use the Website and share information with us at your own risk.",
      ],
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "7. Children's Privacy",
      content: [
        "We are committed to protecting children's privacy online.",
        "• Our Website is intended for users above the age of 13.",
        "• We do not knowingly collect payment-related information from children.",
        "• If we learn that we have collected personal data from a child under 13 without appropriate consent, we will take steps to delete such information.",
        "• If you are a parent or guardian and believe that your child has provided us with personal information, please contact us.",
      ],
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "8. Your Rights and Choices",
      content: [
        "Depending on applicable law, you may have certain rights regarding your personal information, including to:",
        "• Access the personal information we hold about you",
        "• Correct inaccurate or incomplete data",
        "• Request deletion of your personal information, subject to legal and contractual obligations",
        "• Restrict or object to certain processing activities",
        "• Withdraw consent for marketing communications or other processing based on consent",
        "To exercise these rights, or to update or correct your information, you may:",
        "• Contact us at support@shop.animeindia.org",
        "",
        "8.1 Marketing Communications",
        "You can manage your marketing preferences by:",
        '• Clicking the "unsubscribe" link in any promotional email',
        "• Using available STOP/opt-out options for SMS or WhatsApp",
        "• Contacting us directly and requesting removal from specific communication lists",
        "Please note that even if you opt out of promotional communications, we may still send you essential transactional or service-related messages (e.g., order confirmations, shipping updates).",
      ],
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "9. Links to Third-Party Sites",
      content: [
        "Our Website may, from time to time, contain links to or integrations with third-party websites, services, or content.",
        "• The inclusion of a link does not imply endorsement by us of the third-party site or its policies.",
        "• These websites may be governed by their own privacy policies and terms, and we disclaim responsibility or liability for their content or practices.",
        "• We encourage you to review the privacy policies and terms of any third-party sites before submitting any information to them.",
      ],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "10. Changes to This Policy",
      content: [
        "We may update this Privacy Policy periodically to reflect changes in:",
        "• Our practices",
        "• Legal or regulatory requirements",
        "• Our services or technology",
        'Any changes will be posted on this page with an updated "Last Updated" date. Your continued use of our Website after any changes are published will be regarded as acceptance of those changes.',
      ],
    },
  ];

  return (
    <div className="privacy-policy-page pt-28 pb-16 overflow-hidden">
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
                  Your Privacy Matters
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                <div className="inline-block">
                  <span style={{ color: "var(--theme-color-hex)" }}>
                    Privacy Policy
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
                  How We Protect Your Data
                </div>
              </h1>

              <motion.p
                variants={fadeIn("up", "tween", 0.2, 1)}
                className="text-gray-400 text-base sm:text-lg md:text-xl mb-5 sm:mb-6 md:mb-8 max-w-3xl mx-auto px-4 sm:px-6"
              >
                Last Updated: 14 January 2025
              </motion.p>
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
          {/* Introduction */}
          <motion.div
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="mb-12 bg-[#1a1a1a] rounded-lg p-6 sm:p-8 border border-[#2D2D2D]"
          >
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                Your privacy is important to us. It is the policy of Anime India
                Private Limited ("Anime India", "we", "us", "our") to respect
                your privacy regarding any information we may collect from you
                across our website shop.animeindia.org, and any other sites or
                services we own and operate (collectively, the "Website").
              </p>
              <p>
                By accessing or using the Website, creating an account, or
                placing an order, you agree to this Privacy Policy.
              </p>
            </div>
          </motion.div>

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
                {section.content.map((item, itemIndex) => {
                  if (item === "") {
                    return <div key={itemIndex} className="mb-4" />;
                  }
                  return (
                    <p
                      key={itemIndex}
                      className={`text-gray-300 mb-2 text-lg leading-relaxed ${
                        item.startsWith("•") || item.match(/^[a-z]\./)
                          ? "ml-4"
                          : ""
                      } ${item.startsWith("  -") ? "ml-8" : ""} ${
                        item.match(/^\d+\.\d+/) && !item.startsWith("•")
                          ? "font-semibold text-white mt-4 mb-2"
                          : ""
                      }`}
                    >
                      {item}
                    </p>
                  );
                })}
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
                11. Contact Us
              </h2>
            </div>
            <div className="ml-16 sm:ml-20 space-y-4">
              <p className="text-gray-300 text-lg leading-relaxed">
                If you have any questions about how we handle user data and
                personal information, or if you wish to exercise your rights
                under this Policy, please contact us:
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
              <p className="text-gray-300 text-lg leading-relaxed mt-4">
                Your continued use of our Website will be regarded as acceptance
                of our practices around privacy and personal information.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
