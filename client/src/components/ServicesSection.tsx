import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { 
  Code, 
  Smartphone, 
  BarChart2, 
  Cloud, 
  Shield, 
  Bot,
  ArrowRight
} from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Custom Software Development',
      description: "Bespoke software solutions built to address your specific business challenges and requirements.",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: 'Mobile App Development',
      description: "Powerful, intuitive mobile applications designed for both iOS and Android platforms.",
    },
    {
      icon: <BarChart2 className="h-8 w-8" />,
      title: 'Digital Strategy',
      description: "Comprehensive digital strategies to position your business for long-term success and growth.",
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: 'Cloud Solutions',
      description: "Scalable, secure cloud infrastructure and migration services to enhance your operational efficiency.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Cybersecurity',
      description: "Robust security solutions to protect your data, systems, and reputation from evolving threats.",
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: 'AI & Machine Learning',
      description: "Advanced AI solutions to automate processes, gain insights, and drive intelligent decision-making.",
    }
  ];

  return (
    <section id="services" className="py-20 bg-[#121212] relative overflow-hidden">
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
            Our Services
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            What We Offer
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Comprehensive solutions designed to help your business thrive in the digital world.
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
              variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
              className="bg-[#1E1E1E] rounded-xl p-8 card-hover border border-[#2D2D2D]"
            >
              <div className="text-[#FF3B30] mb-5 text-3xl">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-400 mb-4">
                {service.description}
              </p>
              <a 
                href="#contact" 
                className="text-[#FF3B30] hover:text-[#FF6B61] transition duration-300 font-medium inline-flex items-center"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#FF3B30] rounded-full filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-[#FF3B30] rounded-full filter blur-3xl opacity-5"></div>
    </section>
  );
};

export default ServicesSection;
