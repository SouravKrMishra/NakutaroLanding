import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-[#CC2F26] to-[#FF3B30] text-white">
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
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-xl opacity-90 mb-8"
          >
            Join hundreds of successful companies that have partnered with Nakutaro to drive innovation and growth.
          </motion.p>
          <motion.a
            variants={fadeIn('up', 'tween', 0.3, 1)}
            href="#contact"
            className="inline-block bg-white text-[#FF3B30] hover:bg-gray-100 font-bold px-8 py-3 rounded-md shadow-lg transition duration-300 text-lg"
          >
            Get in Touch Today
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
