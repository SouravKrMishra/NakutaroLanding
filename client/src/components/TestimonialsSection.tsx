import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    content: "Anime India has become my go-to source for everything anime in India. The community discussions are amazing, and I've found so many new series to watch through their recommendations. Their event listings also helped me attend my first cosplay convention!",
    author: "Priya Sharma",
    position: "Anime Enthusiast, Mumbai",
    initials: "PS",
    rating: 5
  },
  {
    content: "What sets Anime India apart is their detailed coverage of both popular and niche anime series. Their analysis of themes and cultural context has deepened my appreciation for anime as an art form. The forums are filled with passionate fans who are welcoming to newcomers.",
    author: "Arjun Kapoor",
    position: "Manga Artist, Delhi",
    initials: "AK",
    rating: 5
  },
  {
    content: "Being part of the Anime India community has connected me with fellow anime lovers across the country. The exclusive news and updates keep me informed about releases even before they're widely announced. Their anime meetups are always well-organized and fun!",
    author: "Nisha Patel",
    position: "Cosplayer, Bangalore",
    initials: "NP",
    rating: 4.5
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
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-[#FF3B30] text-[#FF3B30]" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 text-[#FF3B30]">
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor="#FF3B30" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-[#FF3B30]" />);
    }
    
    return stars;
  };
  
  return (
    <section id="testimonials" className="py-20 bg-[#121212] relative overflow-hidden">
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
            Community Voices
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            What Our Members Say
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Hear from passionate anime fans who are part of our growing community across India.
          </motion.p>
        </motion.div>
        
        <div className="relative testimonial-slider">
          <div 
            ref={sliderRef}
            className="flex overflow-hidden"
            style={{ transition: 'transform 0.5s ease', transform: `translateX(-${currentSlide * slideWidth}px)` }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="testimonial-slide w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-6 py-4"
              >
                <div className="bg-[#1E1E1E] p-8 rounded-xl border border-[#2D2D2D] h-full shadow-lg shadow-[#FF3B30]/5 hover:shadow-[#FF3B30]/10 transition-all duration-300 relative group overflow-visible">
                  <div className="absolute -top-10 -right-10 -bottom-10 -left-10 bg-gradient-to-br from-[#FF3B30]/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="text-[#FF3B30] flex">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                    <blockquote className="text-gray-300 mb-6">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#FF3B30]/30 to-[#FF3B30]/10 flex items-center justify-center mr-4 border-2 border-[#FF3B30]/20">
                        <span className="text-xl font-bold text-[#FF3B30]">{testimonial.initials}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.author}</h4>
                        <p className="text-gray-500 text-sm">{testimonial.position}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-center mt-10 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 w-3 rounded-full focus:outline-none ${
                  index === currentSlide ? 'bg-[#FF3B30]' : 'bg-[#2D2D2D]'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-[#2D2D2D] hover:bg-[#333333] text-white p-2 rounded-full focus:outline-none"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-[#2D2D2D] hover:bg-[#333333] text-white p-2 rounded-full focus:outline-none"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Anime-inspired decorative elements */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-[#FF3B30] opacity-5 rounded-full"></div>
      <div className="absolute top-1/4 right-10 w-40 h-40 bg-[#FF3B30] opacity-5 rounded-full"></div>
      <div className="absolute bottom-20 left-1/3 w-32 h-32 bg-[#FF3B30] opacity-5 rounded-full"></div>
      
      {/* Animated stars */}
      <div className="absolute top-10 right-1/4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '1.5s' }}></div>
      <div className="absolute top-1/3 left-10 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1s' }}></div>
      
      {/* Anime-style accent shapes */}
      <div className="absolute top-0 right-0 h-40 w-40 border-t-4 border-r-4 border-[#FF3B30]/20 rounded-tr-3xl"></div>
      <div className="absolute bottom-0 left-0 h-40 w-40 border-b-4 border-l-4 border-[#FF3B30]/20 rounded-bl-3xl"></div>
    </section>
  );
};

export default TestimonialsSection;
