import React from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useLocation } from "wouter";
import ContactSection from "@/components/ContactSection.tsx";
import { useAuth } from "@/lib/AuthContext.tsx";
import {
  Building2,
  Users,
  Package,
  Award,
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Target,
  Zap,
  BarChart3,
  LogIn,
} from "lucide-react";

const BusinessPage = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const services = [
    {
      icon: <Package className="w-8 h-8" />,
      title: "Bulk Orders",
      description:
        "Special pricing and dedicated support for large quantity orders. Perfect for retail stores, events, and corporate gifting.",
      features: [
        "Volume discounts",
        "Priority processing",
        "Custom packaging",
        "Dedicated account manager",
      ],
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Custom Branding",
      description:
        "Personalize products with your brand logo, colors, and messaging. Stand out with unique anime-themed merchandise.",
      features: [
        "Logo placement",
        "Custom color schemes",
        "Branded packaging",
        "Exclusive designs",
      ],
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Event Collaborations",
      description:
        "Partner with us for anime conventions, college events, corporate functions, and community gatherings.",
      features: [
        "Event merchandise",
        "Pop-up stores",
        "Live demonstrations",
        "Sponsorship opportunities",
      ],
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Wholesale Programs",
      description:
        "Access our complete catalog at wholesale prices. Ideal for retailers, distributors, and resellers.",
      features: [
        "Wholesale pricing",
        "Product catalog access",
        "Inventory management",
        "Marketing support",
      ],
    },
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Growing Market",
      description:
        "Anime industry is booming with 40% year-over-year growth in merchandise sales",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Targeted Audience",
      description:
        "Access to passionate anime fans aged 13-35 with high disposable income",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Quality Products",
      description:
        "Authentic, licensed merchandise with premium materials and craftsmanship",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Quick Turnaround",
      description:
        "Fast production and shipping to meet your business timelines",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Event Manager",
      company: "AnimeCon India",
      content:
        "Anime India's event collaboration exceeded our expectations. Their products were a huge hit with attendees!",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      role: "Store Owner",
      company: "Geek Haven",
      content:
        "The wholesale program helped us expand our anime merchandise section. Sales increased by 60% in the first quarter.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Marketing Director",
      company: "TechCorp",
      content:
        "Custom branded merchandise for our corporate event was perfect. Great quality and professional service.",
      rating: 5,
    },
  ];

  const stats = [
    { number: "500+", label: "Business Partners" },
    { number: "50K+", label: "Products Delivered" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" },
  ];

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge
            variant="secondary"
            className="mb-6 bg-accent/20 text-accent border-accent/30"
          >
            Business Partnership
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-accent leading-tight">
            Partner with <span className="text-white">Anime India</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Elevate your business with authentic anime merchandise. From bulk
            orders to custom branding, we help businesses, colleges, and events
            create unforgettable experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/80 text-white px-8 py-4 text-lg rounded-lg transition duration-300"
              onClick={() => setLocation("/products")}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              View Products
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:!text-white px-8 py-4 text-lg rounded-lg transition duration-300"
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Mail className="w-5 h-5 mr-2" />
              Get Quotation
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-16 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Business Dashboard</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Access your business analytics, orders, and management tools
            </p>
          </div>

          <Card className="bg-[#2a2a2a] border-[#444] max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="p-4 bg-accent/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-accent">
                  Business Portal
                </h3>
                <p className="text-gray-400">
                  {isAuthenticated
                    ? "Access your business dashboard to manage orders, view analytics, and track performance."
                    : "Login to access your business dashboard and manage your partnership with Anime India."}
                </p>
              </div>

              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/80 text-white px-8 py-4 text-lg rounded-lg transition duration-300"
                  onClick={() => setLocation("/dashboard")}
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/80 text-white px-8 py-4 text-lg rounded-lg transition duration-300"
                    onClick={() => setLocation("/login?from=/business")}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Business Login
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:!text-white px-8 py-4 text-lg rounded-lg transition duration-300"
                    onClick={() => setLocation("/register?from=/business")}
                  >
                    <Building2 className="w-5 h-5 mr-2" />
                    Register Business
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Business Services</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive solutions designed to meet your business needs and
              drive growth
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="bg-[#1a1a1a] border-[#333] hover:border-accent/50 transition duration-300"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/20 rounded-lg text-accent">
                      {service.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-accent">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-2">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2 text-gray-300"
                      >
                        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Partner With Us?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the advantages that make Anime India the preferred choice
              for businesses
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="p-4 bg-accent/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-accent">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Partners Say</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Trusted by businesses across India for quality and reliability
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-[#1a1a1a] border-[#333]">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="text-accent font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-accent/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful businesses that trust Anime India for
            their merchandise needs. Let's discuss how we can help grow your
            business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/80 text-white px-8 py-4 text-lg rounded-lg transition duration-300"
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Start Partnership
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:!text-white px-8 py-4 text-lg rounded-lg transition duration-300"
              onClick={() => setLocation("/products")}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Browse Catalog
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
};

export default BusinessPage;
