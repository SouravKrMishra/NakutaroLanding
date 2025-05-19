import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram 
} from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  const quickLinks = [
    { href: '#home', label: 'Home' },
    { href: '#products', label: 'Products' },
    { href: '#events', label: 'Subscribe' },
    { href: '#contact', label: 'Contact Us' },
    { href: '#shop', label: 'Shop' },
    { href: '#faq', label: 'FAQs' }
  ];
  
  const serviceLinks = [
    { href: '#', label: 'Action Figures' },
    { href: '#', label: 'Anime Apparel' },
    { href: '#', label: 'Manga & Books' },
    { href: '#', label: 'Collectibles' },
    { href: '#', label: 'Accessories' },
    { href: '#', label: 'Special Editions' }
  ];
  
  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: '#' },
    { icon: <Linkedin className="h-5 w-5" />, href: '#' },
    { icon: <Facebook className="h-5 w-5" />, href: '#' },
    { icon: <Instagram className="h-5 w-5" />, href: '#' }
  ];

  return (
    <footer className="bg-[#121212] text-gray-400 pt-16 pb-8 border-t border-[#2D2D2D]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <a href="#" className="flex items-center space-x-2 mb-5">
              <span className="font-bold text-2xl text-white">
                Anime<span className="text-[#FF3B30]">India</span>
              </span>
            </a>
            <p className="mb-4">
              India's premier anime merchandise store. From action figures to apparel, we bring the best of Japanese animation to Indian fans.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href} 
                  className="text-gray-400 hover:text-[#FF3B30] transition duration-300"
                  aria-label={`Social media link ${index + 1}`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="hover:text-[#FF3B30] transition duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-5">Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="hover:text-[#FF3B30] transition duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-5">Newsletter</h4>
            <p className="mb-4">Subscribe to our newsletter to receive updates and news.</p>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-[#2D2D2D] border border-[#333333] focus:border-[#FF3B30] rounded-l-md px-4 py-2 text-white focus:outline-none w-full" 
                  required 
                />
                <button 
                  type="submit" 
                  className="bg-[#FF3B30] hover:bg-[#CC2F26] text-white px-4 py-2 rounded-r-md transition duration-300"
                  aria-label="Subscribe"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
            <p className="text-sm">
              By subscribing, you agree to our <a href="#" className="text-[#FF3B30] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
        
        <div className="border-t border-[#2D2D2D] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {year} Anime India. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <a href="#" className="text-sm mr-4 hover:text-[#FF3B30] transition duration-300">Privacy Policy</a>
              <a href="#" className="text-sm mr-4 hover:text-[#FF3B30] transition duration-300">Terms of Service</a>
              <a href="#" className="text-sm hover:text-[#FF3B30] transition duration-300">Return Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
