import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { Check } from 'lucide-react';

const AboutSection = () => {
  const missionPoints = [
    'Delivering cutting-edge technology solutions tailored to your unique needs',
    'Fostering innovation through strategic partnerships and continuous learning',
    'Building long-term relationships based on trust and exceptional results'
  ];

  const stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '200+', label: 'Projects Completed' },
    { value: '50+', label: 'Team Members' },
    { value: '98%', label: 'Client Satisfaction' }
  ];

  return (
    <section id="about" className="py-20 bg-[#1E1E1E]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
            About Us
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Who We Are
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Founded with a vision to transform the digital landscape, Nakutaro brings innovative solutions to businesses worldwide.
          </motion.p>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <motion.div 
            variants={fadeIn('right', 'tween', 0.2, 1)}
            className="order-2 md:order-1"
          >
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-400 mb-6">
              At Nakutaro, we're committed to helping businesses navigate the complex digital landscape through innovative solutions that drive growth and success.
            </p>
            
            <div className="space-y-4">
              {missionPoints.map((point, index) => (
                <motion.div 
                  key={index}
                  variants={fadeIn('right', 'tween', 0.3 + index * 0.1, 1)}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 mt-1">
                    <Check className="text-[#FF3B30] h-5 w-5" />
                  </div>
                  <p className="ml-3 text-gray-300">{point}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              variants={fadeIn('right', 'tween', 0.6, 1)}
              className="mt-8"
            >
              <a 
                href="#services" 
                className="text-[#FF3B30] font-medium flex items-center hover:text-[#FF6B61] transition duration-300"
              >
                Discover Our Services
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={fadeIn('left', 'tween', 0.4, 1)}
            className="order-1 md:order-2"
          >
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
              alt="Nakutaro team collaboration" 
              className="rounded-lg shadow-xl w-full h-auto" 
            />
          </motion.div>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
              className="bg-[#2D2D2D] p-6 rounded-lg text-center"
            >
              <div className="text-[#FF3B30] text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
