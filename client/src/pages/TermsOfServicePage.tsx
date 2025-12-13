import { useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import {
  FileText,
  Scale,
  AlertCircle,
  ShoppingCart,
  CreditCard,
  Shield,
  Link as LinkIcon,
  MessageSquare,
  User,
  AlertTriangle,
  Ban,
  Info,
  Gavel,
  X,
  MapPin,
  Mail,
} from "lucide-react";

const TermsOfServicePage = () => {
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "SECTION 1 – ONLINE STORE TERMS",
      content: [
        "By agreeing to these Terms:",
        "• You represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority and have given consent for any minor dependents to use this Website under your supervision.",
        "• You agree not to use any of our Products or the Service for any unlawful or unauthorized purpose, and you will not violate any applicable laws in your jurisdiction (including but not limited to intellectual property and copyright laws) in your use of the Service.",
        "• You must not transmit any worms, viruses, malware, or any code of a destructive nature.",
        "• A breach or violation of any of these Terms may result in immediate termination or suspension of your access to the Service, at our sole discretion.",
      ],
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "SECTION 2 – GENERAL CONDITIONS",
      content: [
        "• We reserve the right to refuse Service to anyone, for any reason, at any time, subject to applicable law.",
        "• You understand that your content (excluding payment card details) may be transferred unencrypted and may involve:",
        "  - transmissions over various networks; and",
        "  - changes to conform and adapt to technical requirements of connecting networks or devices.",
        "• Payment card information is always encrypted during transfer over networks via our payment partners.",
        "• You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service, use of the Service, or access to the Service, or any contact on the Website through which the Service is provided, without our express written permission.",
        "• Section headings in this agreement are for convenience only and will not limit or otherwise affect the interpretation of these Terms.",
      ],
    },
    {
      icon: <Info className="w-6 h-6" />,
      title: "SECTION 3 – ACCURACY, COMPLETENESS & TIMELINESS OF INFORMATION",
      content: [
        "• We are not responsible if information on this Website is not accurate, complete, or current. The material on this Website is provided for general information only and should not be relied upon as your sole basis for making decisions. You should consult primary, more accurate, more complete, or more timely sources of information before making decisions. Any reliance on the material on this Website is at your own risk.",
        "• This Website may contain certain historical information. Historical information is not current and is provided for reference only.",
        "• We reserve the right to modify the contents of this Website at any time, but we have no obligation to update any information. You agree that it is your responsibility to monitor changes to our Website.",
      ],
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "SECTION 4 – MODIFICATIONS TO THE SERVICE & PRICES",
      content: [
        "• Prices for our Products are subject to change at any time without prior notice.",
        "• We reserve the right at any time to modify, suspend, or discontinue the Service (or any part or content thereof) without notice.",
        "• We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuance of the Service.",
      ],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "SECTION 5 – PRODUCTS & SERVICES",
      content: [
        "• Certain Products or Services may be available exclusively online through the Website. These Products or Services may have limited quantities and are subject to return or exchange only in accordance with our Return & Refund Policy.",
        "• We have made every effort to display as accurately as possible the colours and images of our Products as they appear online. However, we cannot guarantee that your screen's display of any colour will be accurate, and minor variations may occur.",
        "• We reserve the right, but are not obligated, to:",
        "  - limit the sales of our Products or Services to any person, geographic region, or jurisdiction;",
        "  - limit quantities of any Products or Services that we offer;",
        "  - discontinue any Product at any time.",
        "• All Product descriptions and pricing are subject to change at any time without notice, at our sole discretion.",
        "• Any offer for any Product or Service made on this site is void where prohibited by law.",
        "• We do not warrant that the quality of any Products, Services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected immediately.",
        "• For more details on returns, exchanges, and refunds, please refer to our Return & Refund Policy.",
      ],
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "SECTION 6 – ORDERS, BILLING & ACCOUNT INFORMATION",
      content: [
        "• We reserve the right to refuse or cancel any order you place with us, in whole or in part, for reasons including but not limited to Product availability, errors in Product or pricing information, suspected fraud, or issues identified by our risk management.",
        "• We may, at our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders:",
        "  - placed by or under the same customer account;",
        "  - using the same payment method; and/or",
        "  - having the same billing and/or shipping address.",
        "• In the event that we change or cancel an order, we may attempt to notify you using the email address, billing address, and/or phone number provided at the time the order was made.",
        "• We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors.",
        "• You agree to provide current, complete, and accurate purchase and account information for all transactions. You also agree to promptly update your account details, including email address, contact number, and payment information, so we can complete your transactions and contact you as needed.",
        "• For more details, please refer to our Return & Refund Policy and Shipping Policy.",
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "SECTION 7 – OPTIONAL TOOLS & THIRD-PARTY SERVICES",
      content: [
        "• We may provide you with access to third-party tools or services over which we neither monitor nor have any control or input.",
        '• You acknowledge that we provide access to such tools "as is" and "as available" without any warranties, representations, or conditions of any kind and without any endorsement. We shall have no liability arising from or relating to your use of optional third-party tools.',
        "• Any use by you of optional tools offered through the Website is entirely at your own risk and discretion. You should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).",
        "• We may also, in the future, offer new services and/or features through the Website (including the release of new tools and resources). Such new features and/or services will also be subject to these Terms.",
      ],
    },
    {
      icon: <LinkIcon className="w-6 h-6" />,
      title: "SECTION 8 – THIRD-PARTY LINKS",
      content: [
        "• Certain content, Products, and Services available via our Service may include materials from third parties.",
        "• Third-party links on this site may direct you to external websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy of such sites and we do not warrant and will not have any liability or responsibility for any third-party materials, websites, or other products or services.",
        "• We are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with third-party websites.",
        "• Please review carefully the third party's policies and practices before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products should be directed to the third party.",
      ],
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "SECTION 9 – USER CONTENT, COMMENTS & SUBMISSIONS",
      content: [
        'If, at our request, you submit certain content (for example, contest entries), or without a request you send creative ideas, suggestions, proposals, plans, reviews, feedback, or other materials, whether online, by email, by postal mail, or otherwise (collectively, "comments"), you agree that we may, at any time and without restriction:',
        "• edit, copy, publish, distribute, translate, and otherwise use in any medium any comments that you submit to us.",
        "We are and shall be under no obligation:",
        "• to maintain any comments in confidence;",
        "• to pay compensation for any comments; or",
        "• to respond to any comments.",
        "We may, but have no obligation to, monitor, edit, or remove content that we determine in our sole discretion to be:",
        "• unlawful, offensive, threatening, libellous, defamatory, pornographic, obscene, or otherwise objectionable; or",
        "• in violation of any party's intellectual property or these Terms.",
        "You agree that your comments will not violate any rights of any third party, including copyright, trademark, privacy, personality, or other personal or proprietary rights.",
        "You further agree that your comments will not contain libellous or otherwise unlawful, abusive, or obscene material, or contain any malware, virus, or harmful code that could affect the operation of the Service or any related website.",
        "You may not use a false email address or pretend to be someone other than yourself, or otherwise mislead us or third parties as to the origin of any comments.",
        "You are solely responsible for any comments you make and their accuracy. We assume no responsibility and no liability for any comments posted by you or any third party.",
      ],
    },
    {
      icon: <User className="w-6 h-6" />,
      title: "SECTION 10 – PERSONAL INFORMATION",
      content: [
        "• Your submission of personal information through the store is governed by our Privacy Policy.",
        "• Please review our Privacy Policy available on the Website for details on how we collect, use, and protect your personal data.",
      ],
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "SECTION 11 – ERRORS, INACCURACIES & OMISSIONS",
      content: [
        "• Occasionally there may be information on our Website or in the Service that contains typographical errors, inaccuracies, or omissions that may relate to Product descriptions, pricing, promotions, offers, shipping charges, transit times, and availability.",
        "• We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice (including after you have submitted your order).",
        "• We undertake no obligation to update, amend, or clarify information in the Service or on any related website, including without limitation, pricing information, except as required by law. No specified update or refresh date should be taken to indicate that all information has been modified or updated.",
      ],
    },
    {
      icon: <Ban className="w-6 h-6" />,
      title: "SECTION 12 – PROHIBITED USES",
      content: [
        "In addition to other prohibitions set forth in these Terms, you are prohibited from using the Website or its content:",
        "a. for any unlawful purpose;",
        "b. to solicit others to perform or participate in unlawful acts;",
        "c. to violate any international, national, state, or local regulations, laws, or ordinances;",
        "d. to infringe upon or violate our intellectual property rights or the intellectual property rights of others;",
        "e. to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate;",
        "f. to submit false or misleading information;",
        "g. to upload or transmit viruses or any other type of malicious or harmful code;",
        "h. to collect or track the personal information of others without consent;",
        "i. to spam, phish, pharm, pretext, spider, crawl, or scrape;",
        "j. for any obscene, immoral, or offensive purpose; or",
        "k. to interfere with or circumvent the security features of the Service, any related website, other websites, or the Internet.",
        "We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.",
      ],
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "SECTION 13 – DISCLAIMER OF WARRANTIES",
      content: [
        "• We do not guarantee, represent, or warrant that your use of our Service will be uninterrupted, timely, secure, or error-free.",
        "• We do not warrant that the results that may be obtained from the use of the Service will be accurate or reliable.",
        "• You agree that from time to time we may remove the Service (in whole or in part) for indefinite periods of time or cancel the Service at any time, without notice to you.",
        "• You expressly agree that your use of, or inability to use, the Service is at your sole risk.",
        '• The Service and all Products and Services delivered to you through the Service are (except as expressly stated by us) provided "as is" and "as available", without any representation, warranties, or conditions of any kind, either express or implied, including all implied warranties of merchantability, merchantable quality, fitness for a particular purpose, durability, title, and non-infringement.',
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "SECTION 14 – LIMITATION OF LIABILITY",
      content: [
        "To the maximum extent permitted by law, in no event shall Anime India Private Limited, its directors, officers, employees, affiliates, agents, contractors, suppliers, or service providers be liable for any:",
        "• indirect, incidental, punitive, special, or consequential damages of any kind;",
        "• loss of profits, revenue, savings, data, or goodwill;",
        "• replacement costs or similar damages;",
        "whether based in contract, tort (including negligence), strict liability or otherwise, arising from:",
        "• your use of the Service or any Products procured using the Service; or",
        "• any other claim related in any way to your use of the Service or any Product, including any errors or omissions in any content, or any loss or damage incurred as a result of the use of the Service or any content (or Product) posted, transmitted, or otherwise made available.",
        "Where the exclusion or limitation of liability for consequential or incidental damages is not allowed by law, our liability shall be limited to the maximum extent permitted by law and, in any case, shall not exceed the amount you actually paid for the specific order giving rise to the claim (excluding shipping and COD charges).",
      ],
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "SECTION 15 – INDEMNIFICATION",
      content: [
        "You agree to indemnify, defend, and hold harmless Anime India Private Limited, together with our affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, and employees, from any claim or demand (including reasonable attorneys' fees) made by any third party due to or arising out of:",
        "• your breach of these Terms or the documents they incorporate by reference;",
        "• your violation of any law or the rights of a third party; or",
        "• your use of the Service or Products other than as expressly permitted by these Terms.",
      ],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "SECTION 16 – SEVERABILITY",
      content: [
        "If any provision of these Terms is determined to be unlawful, void, or unenforceable, such provision shall nevertheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed severed from these Terms. Such determination shall not affect the validity and enforceability of any other remaining provisions.",
      ],
    },
    {
      icon: <X className="w-6 h-6" />,
      title: "SECTION 17 – TERMINATION",
      content: [
        "• The obligations and liabilities of the parties incurred prior to the termination date shall survive termination of this agreement for all purposes.",
        "• These Terms are effective unless and until terminated by either you or us. You may terminate these Terms at any time by:",
        "  - notifying us that you no longer wish to use our Services; or",
        "  - ceasing to use our Website.",
        "If, in our sole judgement, you fail or we suspect that you have failed to comply with any term or provision of these Terms, we may:",
        "• terminate this agreement at any time without notice; and/or",
        "• deny you access to the Service (or any part thereof), and you will remain liable for all amounts due up to and including the date of termination.",
      ],
    },
    {
      icon: <Gavel className="w-6 h-6" />,
      title: "SECTION 18 – GOVERNING LAW & DISPUTE RESOLUTION",
      content: [
        "• These Terms and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India.",
        "• Subject to applicable law, you agree that any disputes shall be subject to the exclusive jurisdiction of the courts located in New Delhi, Delhi, India.",
      ],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "SECTION 19 – CHANGES TO TERMS OF SERVICE",
      content: [
        "• You can review the most current version of these Terms at any time on this page.",
        "• We reserve the right, at our sole discretion, to update, change, or replace any part of these Terms by posting updates and changes on the Website. It is your responsibility to check our Website periodically for changes. Your continued use of or access to the Website or the Service following the posting of any changes constitutes acceptance of those changes.",
      ],
    },
  ];

  return (
    <div className="terms-of-service-page pt-28 pb-16 overflow-hidden">
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
                  Legal Information
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                <div className="inline-block">
                  <span style={{ color: "var(--theme-color-hex)" }}>
                    Terms & Conditions
                  </span>
                  <div
                    className="block h-1 rounded-full mt-1"
                    style={{
                      backgroundColor: "var(--theme-color-hex)",
                      opacity: 0.3,
                    }}
                  />
                </div>
                <div className="text-white block mt-2">Terms of Service</div>
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
          {/* Overview */}
          <motion.div
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="mb-12 bg-[#1a1a1a] rounded-lg p-6 sm:p-8 border border-[#2D2D2D]"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              OVERVIEW
            </h2>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                This website is operated by Anime India Private Limited ("Anime
                India", "we", "us", "our"). Throughout the site, the terms "you"
                and "your" refer to any user, browser, customer, merchant, or
                contributor of content.
              </p>
              <p>
                Anime India offers this website shop.animeindia.org (the
                "Website") and all information, tools, and services made
                available from it (collectively, the "Service") to you,
                conditioned upon your acceptance of all terms, conditions,
                policies, and notices stated here and referenced by hyperlink.
              </p>
              <p>
                By visiting our Website and/or purchasing something from us, you
                engage in our Service and agree to be bound by these Terms &
                Conditions ("Terms", "Terms of Service"). These Terms apply to
                all users of the Website. If you do not agree to these Terms in
                full, you must not access the Website or use any part of the
                Service.
              </p>
              <p>
                Any new features, products, or tools added to the current store
                will also be subject to these Terms. We may update or modify
                these Terms from time to time by posting changes on this page.
                It is your responsibility to review this page periodically. Your
                continued use of the Website or Service after any changes are
                posted constitutes your acceptance of those changes.
              </p>
            </div>
          </motion.div>

          {/* Terms Sections */}
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
                    color: "#fff",
                  }}
                >
                  {section.icon}
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
                      item.startsWith("•") || item.match(/^[a-k]\./)
                        ? "ml-4"
                        : ""
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
                SECTION 20 – CONTACT INFORMATION
              </h2>
            </div>
            <div className="ml-16 sm:ml-20 space-y-4">
              <p className="text-gray-300 text-lg leading-relaxed">
                Questions about these Terms of Service should be sent to us at:
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
                <div>
                  <strong className="text-white">
                    Anime India Private Limited
                  </strong>
                  <p className="mt-2">
                    House No. 215, Ground Floor,
                    <br />
                    Rajpur Khurd Extension Colony,
                    <br />
                    Chattarpur, New Delhi, Delhi – 110068, India
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
