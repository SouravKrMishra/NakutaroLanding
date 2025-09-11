import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.js";
import aboutUsImage from "@assets/about-us.jpg";
import {
  Check,
  Star,
  Users,
  Calendar,
  Tag,
  BarChart4,
  MapPin,
  Award,
} from "lucide-react";

const AboutSection = () => {
  const missionPoints = [
    "Bringing fans and businesses together through anime events",
    "Organizing immersive anime events celebrating Japanese pop culture",
    "Providing B2B merchandise services for premium anime products",
    "Creating memorable anime experiences through conventions and meetups",
  ];

  const stats = [
    { value: "2.7K+", label: "Users", icon: <Users className="h-6 w-6" /> },
    { value: "1.8K+", label: "Deliveries", icon: <Tag className="h-6 w-6" /> },
    {
      value: "112+",
      label: "Daily Orders",
      icon: <BarChart4 className="h-6 w-6" />,
    },
    { value: "15+", label: "Events", icon: <Calendar className="h-6 w-6" /> },
  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[#171717] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>

        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 bg-accent rounded-full filter blur-[120px] opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-40 right-10 w-60 h-60 bg-accent rounded-full filter blur-[100px] opacity-5"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="inline-block bg-accent/10 px-4 py-1 rounded-full border border-accent/20 mb-6"
          >
            <span className="text-accent font-medium text-sm">Who We Are</span>
          </motion.div>

          <motion.h2
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            <span className="text-white">About</span>{" "}
            <span className="text-accent">Anime India</span>
          </motion.h2>

          <motion.p
            variants={fadeIn("up", "tween", 0.3, 1)}
            className="text-gray-300 text-lg leading-relaxed"
          >
            At Anime India, we are a dedicated group of anime enthusiasts
            committed to bringing fans and businesses together through immersive
            experiences.
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
            variants={fadeIn("right", "tween", 0.2, 1)}
            className="order-2 md:order-1"
          >
            <div className="relative">
              <div className="inline-block bg-[#222] px-3 py-1 rounded border border-accent/20 mb-4">
                <span className="text-white font-medium text-sm flex items-center">
                  <Star className="h-4 w-4 text-accent mr-2" />
                  Our Mission
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-4 text-white">What We Do</h3>

              <div className="bg-gradient-to-r from-accent/30 to-transparent h-[1px] w-20 mb-6"></div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                We organize immersive anime events that celebrate the vibrant
                world of Japanese pop culture. Our B2B merchandise services help
                companies access exclusive anime-related products, fostering
                partnerships within the anime industry.
              </p>

              <p className="text-gray-300 mb-8 leading-relaxed">
                We specialize in creating memorable anime experiences by hosting
                events that connect fans and brands. Our team handles everything
                from conventions and pop-up events to fan meetups, fostering a
                dynamic anime community.
              </p>
            </div>

            <div className="space-y-4 bg-[#1A1A1A] p-6 rounded-lg border border-[#333] mb-8">
              <div className="inline-block bg-[#222] px-3 py-1 rounded border border-[#444] mb-2">
                <span className="text-gray-200 font-medium text-sm">
                  Our Goals
                </span>
              </div>

              {missionPoints.map((point, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn("up", "tween", 0.3 + index * 0.1, 1)}
                  className="flex items-start group"
                >
                  <div className="flex-shrink-0 mt-1 bg-accent/10 p-1 rounded group-hover:bg-accent/20 transition-colors duration-300">
                    <Check className="text-accent h-4 w-4" />
                  </div>
                  <p className="ml-3 text-gray-300 group-hover:text-white transition-colors duration-300">
                    {point}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeIn("right", "tween", 0.6, 1)}
              className="mt-8"
            >
              <a
                href="#services"
                className="group relative inline-flex items-center overflow-hidden rounded-lg border border-accent/40 bg-[#181818] px-6 py-3 text-base font-bold text-white transition-all duration-300 ease-out hover:scale-105"
              >
                <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                  <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
                </span>
                <span className="relative flex items-center">
                  <Award className="h-5 w-5 mr-2 text-accent" />
                  Explore Anime Categories
                </span>
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeIn("left", "tween", 0.4, 1)}
            className="order-1 md:order-2"
          >
            <div className="relative group">
              {/* Animated glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-accent/30 to-transparent rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

              <div className="relative">
                <div className="relative overflow-hidden rounded-lg p-1 bg-[#131313] border border-accent/20">
                  {/* Main image */}
                  <img
                    src={aboutUsImage}
                    alt="About Anime India"
                    className="w-full h-auto object-cover rounded transform group-hover:scale-105 transition duration-700 z-10"
                  />

                  {/* Location tag */}
                  <div className="absolute top-4 left-4 bg-[#0A0A0A]/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-accent mr-1" />
                      <span className="text-sm font-medium text-white">
                        NCUI Auditorium, Hauz Khas, Delhi, India
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image caption */}
              <div className="absolute -bottom-4 right-8 bg-[#0A0A0A]/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-[#333]">
                <p className="text-sm text-white">
                  <span className="text-accent font-medium">Anime India's</span>{" "}
                  Nakutaro Cosplay Royale, 2024
                </p>
              </div>
            </div>
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
              variants={fadeIn("up", "tween", 0.1 + index * 0.1, 1)}
              className="bg-gradient-to-b from-[#1A1A1A] to-[#121212] p-6 rounded-lg text-center border border-[#333] group hover:border-accent/30 transition-colors duration-300 shadow-lg"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-accent/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors duration-300">
                <div className="text-accent">{stat.icon}</div>
              </div>
              <div className="text-accent text-3xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-gray-300 text-sm font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
