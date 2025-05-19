import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#products', label: 'Products' },
    { href: '#events', label: 'Subscribe' },
    { href: '#contact', label: 'Contact Us' },
    { href: '#products-shop', label: 'Shop' }
  ];

  return (
    <header className="fixed w-full z-50 transition-all duration-300" id="navbar">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a href="#" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="text-white">Anime</span> <span className="text-[#FF3B30]">India</span> <span className="text-white text-lg font-normal">Logo</span>
            </span>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-300 hover:text-white transition duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>
          
          <div className="hidden md:block">
            <a 
              href="#contact" 
              className="bg-[#FF3B30] hover:bg-[#CC2F26] text-white px-6 py-2 rounded-md transition duration-300 inline-block"
            >
              Get Started
            </a>
          </div>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost" 
            size="icon"
            onClick={toggleMenu}
            className="md:hidden text-gray-300 hover:text-white hover:bg-transparent focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#1E1E1E] rounded-md mt-2 p-4"
          >
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="text-gray-300 hover:text-white transition duration-200"
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              ))}
              <a 
                href="#contact" 
                className="bg-[#FF3B30] hover:bg-[#CC2F26] text-white px-4 py-2 rounded-md inline-block transition duration-300 text-center"
                onClick={closeMenu}
              >
                Get Started
              </a>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
