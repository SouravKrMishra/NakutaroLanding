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
      title: 'Shonen Anime',
      description: "Action-packed anime typically aimed at teenage boys featuring protagonists with extraordinary abilities and epic battles.",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: 'Shojo Anime',
      description: "Romance-focused anime aimed primarily at young women, featuring emotional storylines and character development.",
    },
    {
      icon: <BarChart2 className="h-8 w-8" />,
      title: 'Seinen Anime',
      description: "Mature anime targeting adult men with complex storylines, realistic characters, and often darker themes.",
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: 'Isekai Anime',
      description: "Stories where protagonists are transported to, reborn, or trapped in a parallel universe, alternate world, or virtual reality.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Mecha Anime',
      description: "Features giant robots or machines controlled by people, with epic battles and advanced technology.",
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: 'Slice of Life Anime',
      description: "Portrays mundane everyday experiences, focusing on the ordinary lives of characters rather than fantastic adventures.",
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
            Anime Categories
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Explore Anime Genres
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Discover the diverse world of anime through these popular genres and find your next favorite series.
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
                Browse This Genre
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
