import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import {
  Code,
  Smartphone,
  BarChart2,
  Cloud,
  Shield,
  Bot,
  ArrowRight,
} from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: <BarChart2 className="h-8 w-8" />,
      title: "B2B Platform",
      description:
        "We supply premium anime action figures, merchandise, and manga to retailers and collectors, ensuring authenticity and quality. Our B2B services are designed to meet the diverse needs of businesses seeking to offer top-tier anime products to their customers.",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Nakutaro: B2C Platform",
      description:
        "Through our sub-brand, Nakutaro, we connect directly with anime fans, providing a wide array of high-quality merchandise and collectibles at affordable prices. Nakutaro is committed to delivering products that resonate with the passion and enthusiasm of the anime community.",
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Event Organization and Community Engagement",
      description:
        "We host engaging events, conventions, and workshops that celebrate anime culture and bring fans together. Our events are designed to foster community spirit, encourage creativity, and provide platforms for fans to connect and share their love for anime.",
    },
  ];

  return (
    <section
      id="services"
      className="py-20 bg-[#121212] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.span
            variants={fadeIn("up", "tween", 0.1, 1)}
            className="text-[#ff382e] font-semibold text-sm uppercase tracking-wider"
          >
            What We Offer
          </motion.span>
          <motion.h2
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Our Services
          </motion.h2>
          <motion.p
            variants={fadeIn("up", "tween", 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            We offer a wide range of anime merchandise and services to satisfy
            your otaku needs.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={fadeIn("up", "tween", 0.1 + index * 0.1, 1)}
              className="bg-[#1E1E1E] rounded-xl p-8 card-hover border border-[#2D2D2D]"
            >
              <div className="text-[#ff382e] mb-5 text-3xl">{service.icon}</div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-400 mb-4">{service.description}</p>
              <a
                href="#contact"
                className="text-[#ff382e] hover:text-[#FF6B61] transition duration-300 font-medium inline-flex items-center"
              >
                Browse This Genre
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#ff382e] rounded-full filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-[#ff382e] rounded-full filter blur-3xl opacity-5"></div>
    </section>
  );
};

export default ServicesSection;
