import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import { Bolt, BookOpen, Users, Calendar } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Bolt className="h-5 w-5" />,
      title: "Extensive Anime Database",
      description:
        "Access our comprehensive collection of anime titles, complete with detailed information, ratings, and reviews.",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Exclusive News & Updates",
      description:
        "Get the latest news about upcoming releases, events, and exclusive content directly from Japan and Indian anime communities.",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Community Discussion Forums",
      description:
        "Connect with fellow anime enthusiasts to discuss your favorite series, characters, and theories in our active community.",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Anime Conventions & Meetups",
      description:
        "Stay informed about upcoming anime conventions, cosplay events, and fan meetups happening across India.",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 bg-[#1E1E1E] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
            Platform Features
          </motion.span>
          <motion.h2
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Why Choose Anime India
          </motion.h2>
          <motion.p
            variants={fadeIn("up", "tween", 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Experience the ultimate anime platform designed specifically for
            Indian fans and enthusiasts.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        >
          <motion.div variants={fadeIn("right", "tween", 0.2, 1)}>
            <img
              src="https://images.unsplash.com/photo-1595535873420-a599195b3f4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
              alt="Anime collectibles and artwork"
              className="rounded-xl shadow-2xl w-full border-2 border-[#ff382e]/20 transform transition-all duration-500 hover:scale-[1.02] hover:border-[#ff382e]/40"
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
                variants={fadeIn("left", "tween", 0.1 + index * 0.1, 1)}
                className="flex"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-[#ff382e] to-[#FF6B61] text-white">
                    {feature.icon}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Anime-inspired decorative elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-[#ff382e] rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      <div
        className="absolute bottom-20 left-10 w-32 h-32 bg-[#ff382e] rounded-full filter blur-3xl opacity-10 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-[#ff382e] rounded-full animate-ping"></div>
      <div
        className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[#ff382e] rounded-full animate-ping"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute top-1/2 right-1/3 w-2 h-2 bg-[#ff382e] rounded-full animate-ping"
        style={{ animationDelay: "1.5s" }}
      ></div>

      {/* Stylized anime-inspired shape */}
      <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-[#ff382e]/10 rounded-full"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 border-8 border-[#ff382e]/5 rounded-full"></div>
    </section>
  );
};

export default FeaturesSection;
