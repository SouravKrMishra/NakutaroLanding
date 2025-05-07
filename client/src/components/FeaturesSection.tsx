import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { Bolt, Lock, RefreshCw, Headphones } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Bolt className="h-5 w-5" />,
      title: 'Fast Implementation',
      description: 'Our agile approach ensures rapid development and deployment of solutions to meet your timeline requirements.'
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: 'Enterprise-Grade Security',
      description: 'Advanced security measures integrated throughout our development process to protect your data and systems.'
    },
    {
      icon: <RefreshCw className="h-5 w-5" />,
      title: 'Scalable Solutions',
      description: 'Future-proof architecture designed to grow with your business and adapt to changing requirements.'
    },
    {
      icon: <Headphones className="h-5 w-5" />,
      title: '24/7 Support',
      description: 'Dedicated support team available around the clock to address any issues and ensure smooth operation.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-[#1E1E1E] relative">
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
            Our Features
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Why Choose Nakutaro
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Discover the advantages that set us apart and make us the partner of choice for your digital journey.
          </motion.p>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        >
          <motion.div
            variants={fadeIn('right', 'tween', 0.2, 1)}
          >
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
              alt="Technology innovation interface" 
              className="rounded-xl shadow-2xl w-full" 
            />
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="space-y-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeIn('left', 'tween', 0.1 + index * 0.1, 1)}
                className="flex"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-[#FF3B30] to-[#FF6B61] text-white">
                    {feature.icon}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
