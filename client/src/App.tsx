import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { ThemeProvider } from "./lib/ThemeContext";
import { ThemeCustomizer } from "./components/ThemeCustomizer";

// Pages
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import SubscribePage from "@/pages/SubscribePage";
import ContactPage from "@/pages/ContactPage";
import NotFoundPage from "@/pages/not-found";

// Shared components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ui/scroll-to-top";

function App() {
  // Add scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById("navbar");
      if (navbar) {
        if (window.scrollY > 10) {
          navbar.classList.add("bg-[#121212]", "shadow-lg");
        } else {
          navbar.classList.remove("bg-[#121212]", "shadow-lg");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Header />
          <main className="overflow-hidden">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/products" component={ProductsPage} />
              <Route path="/subscribe" component={SubscribePage} />
              <Route path="/contact" component={ContactPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </main>
          <Footer />
          <ScrollToTop />
          <ThemeCustomizer />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
