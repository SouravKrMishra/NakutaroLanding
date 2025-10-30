import { useEffect } from "react";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster.js";
import { TooltipProvider } from "@/components/ui/tooltip.js";
import { Route, Switch } from "wouter";
import { ThemeProvider } from "./lib/ThemeContext.js";
import { AuthProvider } from "./lib/AuthContext.tsx";
import { WishlistProvider } from "./lib/WishlistContext.tsx";
import { CartProvider } from "./lib/CartContext.tsx";
import { RecaptchaProvider } from "./lib/RecaptchaContext.tsx";
import { ThemeCustomizer } from "./components/ThemeCustomizer.js";

// Pages
import HomePage from "@/pages/HomePage.js";
import ProductsPage from "@/pages/ProductsPage.js";
import EventsPage from "@/pages/EventsPage.js";
import ContactPage from "@/pages/ContactPage.js";
import NotFoundPage from "@/pages/not-found.js";
import BusinessPage from "@/pages/BusinessPage.js";
import ProductDetailPage from "@/pages/ProductDetailPage.js";
import LoginPage from "@/pages/LoginPage.tsx";
import RegisterPage from "@/pages/RegisterPage.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";
import CartPage from "@/pages/CartPage.tsx";
import CheckoutPage from "@/pages/CheckoutPage.tsx";
import OrderSuccessPage from "@/pages/OrderSuccessPage.tsx";
import OrdersPage from "@/pages/OrdersPage.tsx";
 

// Shared components
import Header from "./components/Header.js";
import Footer from "@/components/Footer.js";
import ScrollToTop from "@/components/ui/scroll-to-top.js";
import ProtectedRoute from "@/components/ProtectedRoute.tsx";

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
      <RecaptchaProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <ThemeProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Header />
                    <main>
                      <Switch>
                        <Route path="/" component={HomePage} />
                        <Route path="/products" component={ProductsPage} />
                        <Route
                          path="/product/:id"
                          component={ProductDetailPage}
                        />
                        <Route path="/events" component={EventsPage} />
                        <Route path="/contact" component={ContactPage} />
                        <Route path="/business" component={BusinessPage} />
                        <Route path="/login" component={LoginPage} />
                        <Route path="/register" component={RegisterPage} />
                        <Route
                          path="/dashboard"
                          component={() => (
                            <ProtectedRoute>
                              <DashboardPage />
                            </ProtectedRoute>
                          )}
                        />
                        <Route
                          path="/orders"
                          component={() => (
                            <ProtectedRoute>
                              <OrdersPage />
                            </ProtectedRoute>
                          )}
                        />
                        <Route
                          path="/cart"
                          component={() => (
                            <ProtectedRoute>
                              <CartPage />
                            </ProtectedRoute>
                          )}
                        />
                        <Route
                          path="/checkout"
                          component={() => (
                            <ProtectedRoute>
                              <CheckoutPage />
                            </ProtectedRoute>
                          )}
                        />
                        <Route
                          path="/order-success"
                          component={() => (
                            <ProtectedRoute>
                              <OrderSuccessPage />
                            </ProtectedRoute>
                          )}
                        />
                      
                        <Route component={NotFoundPage} />
                      </Switch>
                    </main>
                    <Footer />
                    <ScrollToTop />
                    <ThemeCustomizer />
                  </TooltipProvider>
                </ThemeProvider>
              </CartProvider>
            </WishlistProvider>
        </AuthProvider>
      </RecaptchaProvider>
    </QueryClientProvider>
  );
}

export default App;
