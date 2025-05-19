import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { Calendar, Users, Bell, Gift, Star } from 'lucide-react';

const EventsSection = () => {
  const subscriptionPlans = [
    {
      title: 'Monthly Anime Box',
      period: 'Monthly subscription',
      price: '₹1,499/month',
      description: "Get our curated box of premium anime merchandise delivered to your doorstep every month. Each box includes exclusive collectibles, apparel, and accessories from your favorite anime series.",
      type: 'subscription',
      icon: <Gift className="h-6 w-6" />
    },
    {
      title: "Premium Membership",
      period: 'Annual subscription',
      price: '₹8,999/year',
      description: "Join our premium membership program and enjoy early access to new merchandise, special discounts, exclusive event invitations, and limited-edition items only available to members.",
      type: 'subscription',
      icon: <Star className="h-6 w-6" />
    },
    {
      title: 'Manga Club Subscription',
      period: 'Quarterly delivery',
      price: '₹3,999/quarter',
      description: "Subscribe to our Manga Club and receive the latest manga volumes, translated light novels, and exclusive reading merchandise. Stay up-to-date with all your favorite series without hunting for releases.",
      type: 'subscription',
      icon: <Bell className="h-6 w-6" />
    }
  ];

  return (
    <section id="events" className="py-20 bg-[#1E1E1E] relative overflow-hidden">
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
            Subscribe Now
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Membership Plans
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Join our community with exclusive subscription options
          </motion.p>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold mb-6 text-[#FF3B30]">Featured Subscription</h3>
            <div className="bg-[#242424] rounded-xl overflow-hidden border border-[#2D2D2D] shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-64 lg:h-auto relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1636633762833-5d1658f1e29b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
                    alt="Anime collectibles subscription box"
                    className="absolute w-full h-full object-cover transform transition-all duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-50"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] mb-4">
                    <Star className="h-6 w-6" />
                  </div>
                  <h4 className="text-2xl font-bold mb-2">Premium Membership</h4>
                  <div className="flex items-center text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Annual subscription</span>
                  </div>
                  <div className="flex items-center text-gray-400 mb-4">
                    <Users className="h-4 w-4 mr-2" />
                    <span>₹8,999/year</span>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Join our premium membership program and enjoy early access to new merchandise, special discounts, 
                    exclusive event invitations, and limited-edition items only available to members.
                  </p>
                  <a 
                    href="#" 
                    className="inline-flex items-center text-[#FF3B30] hover:text-[#FF6B61] transition duration-300 font-medium"
                  >
                    Learn More
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={fadeIn('up', 'tween', 0.3, 1)}
          >
            <h3 className="text-2xl font-bold mb-6 text-[#FF3B30]">Other Subscription Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {subscriptionPlans.filter(plan => plan.title !== "Premium Membership").map((plan, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
                  className="bg-[#242424] rounded-xl p-6 border border-[#2D2D2D] hover:border-[#FF3B30]/20 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] mb-4">
                    {plan.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-2">{plan.title}</h4>
                  <div className="flex items-center text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{plan.period}</span>
                  </div>
                  <div className="flex items-start text-gray-400 mb-4">
                    <Users className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                    <span>{plan.price}</span>
                  </div>
                  <p className="text-gray-300 mb-6">
                    {plan.description}
                  </p>
                  <a 
                    href="#" 
                    className="inline-flex items-center text-[#FF3B30] hover:text-[#FF6B61] transition duration-300 font-medium"
                  >
                    Subscribe Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Anime-inspired decorative elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-[#FF3B30] rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-[#FF3B30] rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-[#FF3B30] rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[#FF3B30] rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Stylized anime-inspired shape */}
      <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-[#FF3B30]/10 rounded-full"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 border-8 border-[#FF3B30]/5 rounded-full"></div>
    </section>
  );
};

export default EventsSection;