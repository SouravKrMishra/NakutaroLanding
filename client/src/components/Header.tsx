import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

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
    { id: "nav-home", href: "/", label: "Home" },
    { id: "nav-events", href: "/events", label: "Events" },
    { id: "nav-contact", href: "/contact", label: "Contact Us" },
  ];

  return (
    <header
      className="fixed w-full z-50 transition-all duration-300"
      id="navbar"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="text-white">Anime</span>{" "}
              <span className="india text-accent">India</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link
              key="nav-home"
              href="/"
              className={`transition duration-200 ${
                location === "/"
                  ? "text-white font-medium"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Home
            </Link>
            {/* External Products link */}
            <a
              href="https://shop.animeindia.org"
              target="_blank"
              rel="noopener noreferrer"
              className="transition duration-200 text-gray-300 hover:text-white font-medium"
            >
              Products
            </a>
            <Link
              key="nav-events"
              href="/events"
              className={`transition duration-200 ${
                location === "/events"
                  ? "text-white font-medium"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Events
            </Link>
            <Link
              key="nav-contact"
              href="/contact"
              className={`transition duration-200 ${
                location === "/contact"
                  ? "text-white font-medium"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Contact Us
            </Link>
          </nav>

          <div className="hidden md:block">
            <Link
              href="/business"
              className="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-md transition duration-300 inline-flex items-center space-x-2"
            >
              <span>For Business</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="md:hidden text-gray-300 hover:text-white hover:bg-transparent focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
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
              <Link
                key="nav-home"
                href="/"
                className={`transition duration-200 ${
                  location === "/"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={closeMenu}
              >
                Home
              </Link>
              {/* External Products link */}
              <a
                href="https://shop.animeindia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="transition duration-200 text-gray-300 hover:text-white font-medium text-center"
                onClick={closeMenu}
              >
                Products
              </a>
              <Link
                key="nav-events"
                href="/events"
                className={`transition duration-200 ${
                  location === "/events"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={closeMenu}
              >
                Events
              </Link>
              <Link
                key="nav-contact"
                href="/contact"
                className={`transition duration-200 ${
                  location === "/contact"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={closeMenu}
              >
                Contact Us
              </Link>
              <Link
                href="/business"
                className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 transition duration-300 text-center"
                onClick={closeMenu}
              >
                <span>For Business</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
