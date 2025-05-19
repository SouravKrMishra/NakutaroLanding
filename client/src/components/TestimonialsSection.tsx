import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { ChevronLeft, ChevronRight, Star, Quote, MessageSquare, Heart, UsersRound } from 'lucide-react';

const testimonials = [
  {
    content: "Anime India has become my go-to source for everything anime in India. The community discussions are amazing, and I've found so many new series to watch through their recommendations. Their event listings also helped me attend my first cosplay convention!",
    author: "Priya Sharma",
    position: "Anime Enthusiast, Mumbai",
    initials: "PS",
    rating: 5,
    avatarBg: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)"
  },
  {
    content: "What sets Anime India apart is their detailed coverage of both popular and niche anime series. Their analysis of themes and cultural context has deepened my appreciation for anime as an art form. The forums are filled with passionate fans who are welcoming to newcomers.",
    author: "Arjun Kapoor",
    position: "Manga Artist, Delhi",
    initials: "AK",
    rating: 5,
    avatarBg: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)"
  },
  {
    content: "Being part of the Anime India community has connected me with fellow anime lovers across the country. The exclusive news and updates keep me informed about releases even before they're widely announced. Their anime meetups are always well-organized and fun!",
    author: "Nisha Patel",
    position: "Cosplayer, Bangalore",
    initials: "NP",
    rating: 4.5,
    avatarBg: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)"
  },
  {
    content: "The merchandise quality from Anime India is outstanding. The products are authentic and reasonably priced, making it accessible for collectors like me. Their customer service team is also very responsive and helpful with any inquiries.",
    author: "Rahul Singhania",
    position: "Collector, Chennai",
    initials: "RS",
    rating: 5,
    avatarBg: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)"
  },
  {
    content: "As someone new to anime, Anime India's beginner guides and recommendations have been invaluable. They make the vast world of anime approachable and exciting to explore. I appreciate how they cater to fans at all levels of experience.",
    author: "Ananya Desai",
    position: "New Anime Fan, Pune",
    initials: "AD",
    rating: 4.5,
    avatarBg: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
  }
];

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const updateSlideWidth = () => {
      if (sliderRef.current) {
        const firstSlide = sliderRef.current.querySelector('.testimonial-slide');
        if (firstSlide) {
          const style = window.getComputedStyle(firstSlide as HTMLElement);
          const width = (firstSlide as HTMLElement).offsetWidth;
          const marginLeft = parseInt(style.marginLeft || '0', 10);
          const marginRight = parseInt(style.marginRight || '0', 10);
          
          setSlideWidth(width + marginLeft + marginRight);
        }
      }
    };
    
    updateSlideWidth();
    window.addEventListener('resize', updateSlideWidth);
    
    return () => {
      window.removeEventListener('resize', updateSlideWidth);
    };
  }, []);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  
  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-accent text-accent" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 text-accent">
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-accent/30" />);
    }
    
    return stars;
  };
  
  // Community stats
  const communityStats = [
    { number: "15K+", label: "Community Members", icon: <UsersRound className="h-6 w-6" /> },
    { number: "40+", label: "Events Organized", icon: <MessageSquare className="h-6 w-6" /> },
    { number: "98%", label: "Satisfaction Rate", icon: <Heart className="h-6 w-6" /> }
  ];
  
  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[#0A0A0A] overflow-hidden">
        
        {/* Animated background elements */}
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 15, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/5 rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -10, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Subtle accent elements */}
        <div className="absolute top-1/4 right-8 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-1/3 left-12 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-white/10 rounded-full animate-pulse" style={{ animationDuration: '5s' }}></div>
        
        {/* Subtle glow */}
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-accent rounded-full filter blur-[80px] opacity-[0.03]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-accent rounded-full filter blur-[100px] opacity-[0.02]"></div>
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
            className="inline-block bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20 mb-6"
          >
            <span className="text-accent font-medium text-sm flex items-center justify-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              COMMUNITY VOICES
            </span>
          </motion.div>
          
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-5xl font-bold mt-2 mb-6"
          >
            <span className="text-white">What Our</span> <span className="text-accent">Members Say</span>
          </motion.h2>
          
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-300 text-lg leading-relaxed"
          >
            Hear from passionate anime fans who are part of our growing community across India
          </motion.p>
        </motion.div>
        
        {/* Community Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {communityStats.map((stat, index) => (
            <motion.div 
              key={index}
              variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] p-6 rounded-lg text-center border border-[#333] group hover:border-accent/30 transition-colors duration-300 shadow-lg"
            >
              <div className="bg-accent/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors duration-300">
                <div className="text-accent">
                  {stat.icon}
                </div>
              </div>
              <div className="text-accent text-4xl font-bold mb-1">{stat.number}</div>
              <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Main Testimonial */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.4, 1)}
          className="mb-14"
        >
          <div className="relative bg-gradient-to-b from-[#181818] to-[#080808] p-8 lg:p-10 rounded-2xl border border-[#333] overflow-hidden shadow-xl">
            {/* Accent quote icon */}
            <div className="absolute -top-5 -left-5 text-accent/10">
              <Quote className="h-28 w-28" />
            </div>
            
            {/* Large featured testimonial */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 relative z-10">
              <div className="lg:w-1/3 flex flex-col items-center lg:items-start">
                <div className="w-24 h-24 rounded-full mb-4" 
                  style={{ background: testimonials[currentSlide].avatarBg || "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)" }}>
                  <div className="w-full h-full rounded-full border-4 border-[#111] flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{testimonials[currentSlide].initials}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 text-center lg:text-left">{testimonials[currentSlide].author}</h3>
                <p className="text-accent mb-3 text-sm text-center lg:text-left">{testimonials[currentSlide].position}</p>
                
                <div className="flex mb-6">
                  {renderStars(testimonials[currentSlide].rating)}
                </div>
                
                {/* Desktop navigation */}
                <div className="hidden lg:flex items-center space-x-4 mt-auto">
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-full bg-[#222] hover:bg-accent/20 text-accent transition-colors duration-300"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <div className="flex space-x-1">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 transition-all duration-300 rounded-full ${
                          index === currentSlide 
                            ? 'w-6 bg-accent' 
                            : 'w-2 bg-[#333] hover:bg-accent/30'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={nextSlide}
                    className="p-2 rounded-full bg-[#222] hover:bg-accent/20 text-accent transition-colors duration-300"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="lg:w-2/3">
                <blockquote className="text-gray-300 text-lg lg:text-xl leading-relaxed relative">
                  <div className="absolute top-0 left-0 text-accent mt-[-15px] lg:mt-0 ml-[-15px] lg:ml-[-30px]">
                    <Quote className="h-6 w-6 lg:h-8 lg:w-8" fill="currentColor" />
                  </div>
                  <div className="pl-4 lg:pl-6">
                    {testimonials[currentSlide].content}
                  </div>
                </blockquote>
              </div>
            </div>
            
            {/* Mobile navigation */}
            <div className="flex lg:hidden items-center justify-center mt-8 space-x-4">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-[#222] hover:bg-accent/20 text-accent transition-colors duration-300"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex space-x-1">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 transition-all duration-300 rounded-full ${
                      index === currentSlide 
                        ? 'w-6 bg-accent' 
                        : 'w-2 bg-[#333] hover:bg-accent/30'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-[#222] hover:bg-accent/20 text-accent transition-colors duration-300"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Join Community CTA */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.5, 1)}
          className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-8 lg:p-10 border border-accent/20 text-center"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            <span className="text-white">Join Our</span> <span className="text-accent">Anime Community</span>
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            Connect with fellow anime enthusiasts, participate in discussions, get early access to events, and more!
          </p>
          <a 
            href="#contact"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent/80 px-8 py-3 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105"
          >
            <span className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            <span className="absolute bottom-0 left-0 h-1 w-full bg-white opacity-10"></span>
            <span className="absolute right-0 -mt-3 h-16 w-16 rotate-45 translate-x-8 -translate-y-2 bg-white opacity-10"></span>
            <span className="relative flex items-center">
              <UsersRound className="h-5 w-5 mr-2" />
              Join Community
            </span>
          </a>
        </motion.div>
      </div>
      
      {/* Animated elements */}
      <div className="absolute top-1/4 left-8 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
      <div className="absolute bottom-1/4 right-8 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
      <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
      
      {/* Accent glows */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-accent rounded-full opacity-[0.02] filter blur-[100px]"></div>
    </section>
  );
};

export default TestimonialsSection;
