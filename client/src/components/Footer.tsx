import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl } from "@/lib/api";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/subscribe", label: "Subscribe" },
    { href: "/contact", label: "Contact Us" },
    { href: "https://shop.animeindia.org", external: true, label: "Shop" },
    { href: "/products#faq", label: "FAQs" },
  ];

  const serviceLinks = [
    { href: "/products", label: "Action Figures" },
    { href: "/products", label: "Anime Apparel" },
    { href: "/products", label: "Manga & Books" },
    { href: "/products", label: "Collectibles" },
    { href: "/products", label: "Accessories" },
    { href: "/products", label: "Special Editions" },
  ];

  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: "#" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#" },
    { icon: <Facebook className="h-5 w-5" />, href: "#" },
    { icon: <Instagram className="h-5 w-5" />, href: "#" },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        buildApiUrl("/api/newsletter/subscribe"),
        {
          email: email.trim(),
        }
      );

      if (response.data.success) {
        toast({
          title: "Successfully Subscribed!",
          description: response.data.message,
        });
        setEmail(""); // Clear the form
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to subscribe. Please try again.";
      toast({
        title: "Subscription Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#121212] text-gray-400 pt-16 pb-8 border-t border-[#2D2D2D]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-5">
              <span className="font-bold text-2xl text-white">
                Anime<span className="text-accent">India</span>
              </span>
            </Link>
            <p className="mb-4">
              India's premier anime merchandise store. From action figures to
              apparel, we bring the best of Japanese animation to Indian fans.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-accent transition duration-300"
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
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent transition duration-300"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="hover:text-accent transition duration-300"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5">Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="hover:text-accent transition duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5">Newsletter</h4>
            <p className="mb-4">
              Subscribe to our newsletter to receive updates and news.
            </p>
            <form className="mb-4" onSubmit={handleNewsletterSubmit}>
              <div className="flex">
                <input
                  type="email"
                  id="newsletter-email"
                  name="newsletter-email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-[#2D2D2D] border border-[#333333] focus:border-accent rounded-l-md px-4 py-2 text-white focus:outline-none w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-r-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                  aria-label="Subscribe"
                >
                  {isSubmitting ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </form>
            <p className="text-sm">
              By subscribing, you agree to our{" "}
              <a href="#" className="text-accent hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-[#2D2D2D] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {year} Anime India. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <a
                href="#"
                className="text-sm mr-4 hover:text-accent transition duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm mr-4 hover:text-accent transition duration-300"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm hover:text-accent transition duration-300"
              >
                Return Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
