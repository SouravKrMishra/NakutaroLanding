import { useState } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  ShoppingCart,
  LogIn,
  Building2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext.tsx";
import { useCart } from "@/lib/CartContext.tsx";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();

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

          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon - Only show for authenticated users */}
            {isAuthenticated && (
              <Link
                href="/cart"
                className="relative p-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-md transition duration-300 inline-flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : location === "/business" || location === "/products" ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={`/login?from=${location}`}
                  className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-md transition duration-300 inline-flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  href={`/register?from=${location}`}
                  className="border border-accent text-white hover:bg-accent hover:text-white px-4 py-2 rounded-md transition duration-300 inline-flex items-center space-x-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/business"
                className="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-md transition duration-300 inline-flex items-center space-x-2"
              >
                <span>For Business</span>
              </Link>
            )}
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
              {/* Cart Link for Mobile - Only show for authenticated users */}
              {isAuthenticated && (
                <Link
                  href="/cart"
                  className="flex items-center justify-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                  onClick={closeMenu}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart ({itemCount})</span>
                </Link>
              )}

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
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 transition duration-300 text-center"
                  onClick={closeMenu}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              ) : location === "/business" || location === "/products" ? (
                <div className="flex flex-col space-y-2">
                  <Link
                    href={`/login?from=${location}`}
                    className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 transition duration-300 text-center"
                    onClick={closeMenu}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href={`/register?from=${location}`}
                    className="border border-accent text-white hover:bg-accent hover:text-white px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 transition duration-300 text-center"
                    onClick={closeMenu}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/business"
                  className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 transition duration-300 text-center"
                  onClick={closeMenu}
                >
                  <span>For Business</span>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
