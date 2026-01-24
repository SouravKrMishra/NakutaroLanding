import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  MessageCircleQuestion,
  HelpCircle,
  Mail,
  Share2,
} from "lucide-react";

// Move FAQs outside component to prevent recreation on every render
const faqs = [
    {
      question:
        "Are the prices listed on IndiaMART and in your catalogue wholesale prices?",
      answer:
        "Yes, the prices listed on our IndiaMART profile and in our product catalogue represent our wholesale pricing structure, designed specifically for our B2B customers. These rates offer significant value for businesses purchasing in bulk.",
      category: "products",
    },
    {
      question:
        "Do you deal only in action figures, or do you have other products?",
      answer:
        "While we're known for our premium anime action figures, our product range extends far beyond that. We offer a diverse collection including anime apparel (t-shirts, hoodies), accessories, manga, posters, keychains, and various collectibles to satisfy all anime enthusiasts.",
      category: "products",
    },
    {
      question:
        "Is Cash on Delivery (COD) available? What is your payment structure?",
      answer:
        "Yes, we offer Cash on Delivery for qualifying orders. Our payment options include bank transfers, UPI, and major credit/debit cards. For B2B clients, we offer flexible payment terms depending on order volume and business relationship.",
      category: "ordering",
    },
    {
      question: "Do you offer a dropshipping facility?",
      answer:
        "Yes, we provide dropshipping services for business partners. This allows you to list our products on your platform while we handle storage, packaging, and shipping directly to your customers under your branding.",
      category: "products",
    },
    {
      question: "Do you have a WhatsApp group for updates or communication?",
      answer:
        "Yes, we maintain an exclusive WhatsApp group for our B2B clients where we share product updates, limited-time offers, and answer queries. To join, please contact our customer service team with your business details.",
      category: "support",
    },
    {
      question: "How do I track my order once it's been shipped?",
      answer:
        "After your order ships, you'll receive a tracking number via email and SMS. You can track your package in real-time through our website's 'Order Tracking' section or directly through our shipping partner's website using your provided tracking number.",
      category: "ordering",
    },
    {
      question: "What is your return and exchange policy?",
      answer:
        "We offer a 7-day return policy for unopened items in their original packaging. For damaged or defective products, please contact our support team within 48 hours of delivery with photos of the damaged items. Exchanges are processed after we receive the returned items.",
      category: "support",
    },
];

const FAQSection = () => {
  // Categories for FAQs with icons - memoized to prevent recreation on every render
  const faqCategories = useMemo(() => [
    {
      id: "all",
      name: "All Questions",
      icon: <MessageCircleQuestion className="h-5 w-5" />,
    },
    { id: "products", name: "Products", icon: <Share2 className="h-5 w-5" /> },
    { id: "ordering", name: "Ordering", icon: <Phone className="h-5 w-5" /> },
    { id: "support", name: "Support", icon: <Mail className="h-5 w-5" /> },
  ], []);

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Filter FAQs based on active category - memoized to prevent recalculation
  const filteredFaqs = useMemo(() => {
    return activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="faq" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[#171717] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        {/* Decorative elements (static) */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-accent rounded-full filter blur-[80px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-40 right-10 w-60 h-60 bg-accent rounded-full filter blur-[80px] opacity-5 pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-block bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20 mb-6">
            <span className="text-accent font-medium text-sm flex items-center justify-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              HELPFUL ANSWERS
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6">
            <span className="text-white">Frequently Asked</span>{" "}
            <span className="text-accent">Questions</span>
          </h2>

          <p className="text-gray-300 text-lg leading-relaxed">
            Find quick answers to common questions about our products, services,
            and policies
          </p>
        </div>

        {/* FAQ Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
                category.id === activeCategory
                  ? "bg-accent text-white"
                  : "bg-[#1A1A1A] text-gray-300 hover:bg-[#222] border border-[#333]"
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto" key={activeCategory}>
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className={`border border-[#333] rounded-xl overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] shadow-lg transition-all duration-300 ${
                    activeIndex === index
                      ? "border-accent/30"
                      : "hover:border-accent/20"
                  }`}
                >
                  <button
                    className="flex justify-between items-center w-full p-5 text-left focus:outline-none group"
                    onClick={() => toggleFAQ(index)}
                  >
                    <h3
                      className={`font-semibold text-lg transition-colors duration-300 ${
                        activeIndex === index
                          ? "text-accent"
                          : "group-hover:text-accent/80"
                      }`}
                    >
                      {faq.question}
                    </h3>
                    <div
                      className={`${
                        activeIndex === index
                          ? "bg-accent text-white"
                          : "bg-[#222] text-accent group-hover:bg-accent/20"
                      } p-2 rounded-full transition-colors duration-300`}
                    >
                      {activeIndex === index ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      activeIndex === index ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="px-5 pb-5 border-t border-[#333] pt-4 text-gray-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#1A1A1A] p-8 rounded-xl text-center border border-[#333]">
                <HelpCircle className="h-12 w-12 text-accent/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No questions found
                </h3>
                <p className="text-gray-400">
                  There are no questions in this category yet. Try selecting a
                  different category.
                </p>
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 text-center">
            <h3 className="text-xl font-semibold mb-3 text-white">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Our support team is here to help you with any queries you might
              have
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+911149042581"
                className="group relative inline-flex items-center overflow-hidden rounded-lg bg-[#181818] px-6 py-2.5 text-white transition-all duration-300 ease-out hover:scale-105 border border-[#333]"
              >
                <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                  <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
                </span>
                <span className="relative flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-accent" />
                  (+91) 11 4904 2581
                </span>
              </a>

              <a
                href="mailto:support@animeindia.org"
                className="group relative inline-flex items-center overflow-hidden rounded-lg bg-[#181818] px-6 py-2.5 text-white transition-all duration-300 ease-out hover:scale-105 border border-[#333]"
              >
                <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                  <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
                </span>
                <span className="relative flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-accent" />
                  support@animeindia.org
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Accent glows - Static instead of animated for better performance */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-accent rounded-full opacity-[0.02] filter blur-[80px] pointer-events-none"></div>
    </section>
  );
};

export default FAQSection;
