import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    content: "Nakutaro transformed our outdated systems into a streamlined digital solution that has significantly improved our operational efficiency. Their team was professional, responsive, and delivered exactly what we needed.",
    author: "Sarah Mitchell",
    position: "CTO, TechGrowth Inc.",
    initials: "SM",
    rating: 5
  },
  {
    content: "The mobile application developed by Nakutaro exceeded our expectations in terms of both functionality and user experience. Our customers love it, and we've seen a 40% increase in engagement since launch.",
    author: "James Davidson",
    position: "Product Director, InnovateRetail",
    initials: "JD",
    rating: 5
  },
  {
    content: "Nakutaro's cybersecurity services have given us peace of mind knowing our sensitive data is protected. Their team identified vulnerabilities we weren't even aware of and implemented robust solutions.",
    author: "Elena Lockhart",
    position: "Security Manager, FinSecure",
    initials: "EL",
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
    <section id="testimonials" className="py-20 bg-[#121212] relative">
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
            Testimonials
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            What Our Clients Say
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Don't just take our word for it - hear from some of our satisfied clients.
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
                className="testimonial-slide w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4"
              >
                <div className="bg-[#1E1E1E] p-8 rounded-xl border border-[#2D2D2D] h-full">
                  <div className="flex items-center mb-4">
                    <div className="text-[#FF3B30] flex">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <blockquote className="text-gray-300 mb-6">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-[#333333] flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-[#FF3B30]">{testimonial.initials}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.author}</h4>
                      <p className="text-gray-500 text-sm">{testimonial.position}</p>
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
    </section>
  );
};

export default TestimonialsSection;
