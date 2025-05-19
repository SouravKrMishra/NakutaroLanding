import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

const CTASection = () => {
  return (
    <section className="py-16 bg-accent text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.1, 1)}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to Join the Anime Community?
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-xl opacity-90 mb-8"
          >
            Discover premium anime merchandise and connect with fellow anime enthusiasts across India. From action figures to exclusive apparel!
          </motion.p>
          <motion.a
            variants={fadeIn('up', 'tween', 0.3, 1)}
            href="#contact"
            className="inline-block bg-white text-accent hover:bg-gray-100 font-bold px-8 py-3 rounded-md shadow-lg transition duration-300 text-lg"
          >
            Shop Now
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
