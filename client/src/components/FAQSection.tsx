import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { ChevronDown, ChevronUp, Phone } from 'lucide-react';

const FAQSection = () => {
  const faqs = [
    {
      question: "Are the prices listed on IndiaMART and in your catalogue wholesale prices?",
      answer: "Yes, the prices listed on our IndiaMART profile and in our product catalogue represent our wholesale pricing structure, designed specifically for our B2B customers. These rates offer significant value for businesses purchasing in bulk."
    },
    {
      question: "Do you deal only in action figures, or do you have other products?",
      answer: "While we're known for our premium anime action figures, our product range extends far beyond that. We offer a diverse collection including anime apparel (t-shirts, hoodies), accessories, manga, posters, keychains, and various collectibles to satisfy all anime enthusiasts."
    },
    {
      question: "Is Cash on Delivery (COD) available? What is your payment structure?",
      answer: "Yes, we offer Cash on Delivery for qualifying orders. Our payment options include bank transfers, UPI, and major credit/debit cards. For B2B clients, we offer flexible payment terms depending on order volume and business relationship."
    },
    {
      question: "Do you offer a dropshipping facility?",
      answer: "Yes, we provide dropshipping services for business partners. This allows you to list our products on your platform while we handle storage, packaging, and shipping directly to your customers under your branding."
    },
    {
      question: "Do you have a WhatsApp group for updates or communication?",
      answer: "Yes, we maintain an exclusive WhatsApp group for our B2B clients where we share product updates, limited-time offers, and answer queries. To join, please contact our customer service team with your business details."
    }
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-[#121212] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.span 
            variants={fadeIn('up', 'tween', 0.1, 1)}
            className="text-[#FF3B30] font-semibold text-sm uppercase tracking-wider"
          >
            FAQ
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Frequently Asked Questions
          </motion.h2>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-3xl mx-auto"
        >
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
                className="border border-[#2D2D2D] rounded-lg overflow-hidden bg-[#1E1E1E]"
              >
                <button
                  className="flex justify-between items-center w-full p-5 text-left focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  <div className="text-[#FF3B30]">
                    {activeIndex === index ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </button>
                <div 
                  className={`px-5 overflow-hidden transition-all duration-300 ${
                    activeIndex === index ? 'max-h-96 pb-5' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            variants={fadeIn('up', 'tween', 0.6, 1)}
            className="mt-10 text-center"
          >
            <p className="text-gray-400 text-lg">
              Still have questions? Contact us at 
              <a 
                href="tel:+911149042581" 
                className="text-[#FF3B30] ml-2 hover:text-[#FF6B61] inline-flex items-center"
              >
                <Phone className="h-4 w-4 mr-1" />
                (+91) 11 4904 2581
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-full h-40 bg-gradient-to-t from-[#1E1E1E] to-transparent opacity-50"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-[#FF3B30] rounded-full filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-[#FF3B30] rounded-full filter blur-3xl opacity-5"></div>
    </section>
  );
};

export default FAQSection;