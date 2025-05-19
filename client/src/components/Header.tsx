import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { id: 'nav-home', href: '/', label: 'Home' },
    { id: 'nav-products', href: '/products', label: 'Products' },
    { id: 'nav-subscribe', href: '/subscribe', label: 'Subscribe' },
    { id: 'nav-contact', href: '/contact', label: 'Contact Us' }
  ];

  return (
    <header className="fixed w-full z-50 transition-all duration-300" id="navbar">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="text-white">Anime</span> <span className="india text-accent">India</span> <span className="text-white text-lg font-normal">Logo</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            {navLinks.map((link) => (
              <Link 
                key={link.id}
                href={link.href} 
                className={`transition duration-200 ${location === link.href ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="hidden md:block">
            <a 
              href="https://shop.animeindia.org" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent hover:opacity-90 text-white px-6 py-2 rounded-md transition duration-300 inline-flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Shop</span>
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
                <Link 
                  key={link.id}
                  href={link.href} 
                  className={`transition duration-200 ${location === link.href ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
              <a 
                href="https://shop.animeindia.org" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent hover:opacity-90 text-white px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 transition duration-300 text-center"
                onClick={closeMenu}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Shop</span>
              </a>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;